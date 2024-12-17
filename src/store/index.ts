import NDK, {
  NDKConstructorParams,
  NDKEvent,
  NDKFilter,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelaySet,
} from '@nostr-dev-kit/ndk';
import { produce } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  CreateSubscription,
  InitNdk,
  LoginData,
  LoginWithExtension,
  LoginWithPrivateKey,
  LoginWithRemoteSigner,
  RemoveSubscription,
  SetSigner,
  Subscriptions,
} from '../types';

type State = {
  // ndk state
  constructorParams: NDKConstructorParams | undefined;

  ndk: NDK | undefined;

  subscriptions: Subscriptions;

  // login state
  loginData: LoginData;
};

type Actions = {
  // ndk actions
  initNdk: InitNdk;

  setSigner: SetSigner;

  // subscription actions
  createSubscription: CreateSubscription;

  removeSubscription: RemoveSubscription;

  addEvent: (subId: string, event: NDKEvent, replaceOlderReplaceableEvents?: boolean) => void;

  setEose: (subId: string, eose: boolean) => void;

  setHasMore: (subId: string, hasMore: boolean) => void;

  loadMore: (subId: string, limit?: number) => void;

  // login actions
  loginWithExtension: LoginWithExtension;
  loginWithRemoteSigner: LoginWithRemoteSigner;
  loginWithPrivateKey: LoginWithPrivateKey;
  loginFromLocalStorage: () => void;
  logout: () => void;
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // ndk state
      constructorParams: undefined,

      ndk: undefined,

      // subscription state
      subscriptions: {},

      // login state
      loginData: {
        privateKey: undefined,
        loginMethod: undefined,
        nip46Address: undefined,
      },

      // subscription actions
      createSubscription: ({
        subId,
        filters,
        opts,
        relayUrls,
        onEvent,
        autoStart,
        replaceOlderReplaceableEvents,
      }) => {
        if (!subId) return null;

        const sub = get().subscriptions[subId];
        if (sub) {
          set(
            produce((state: State) => {
              if (!state.subscriptions[subId]) return;

              state.subscriptions[subId].listenersCount += 1;
            })
          );

          return sub.subscription;
        }

        const { ndk } = get();
        if (!ndk) return null;

        const subscription = ndk.subscribe(
          filters,
          opts,
          relayUrls ? NDKRelaySet.fromRelayUrls(relayUrls, ndk) : undefined,
          autoStart
        );

        subscription.on('event', (event) => {
          get().addEvent(subId, event, replaceOlderReplaceableEvents);
          onEvent?.(event);
        });
        subscription.on('eose', () => {
          get().setEose(subId, true);

          const events = get().subscriptions[subId || 'na']?.events;
          if (events && events.length > 0) {
            get().setHasMore(subId, true);
          }
        });

        set(
          produce((state: State) => {
            state.subscriptions[subId] = {
              subscription,
              events: [],
              eose: false,
              hasMore: false,
              listenersCount: 1,
            };
          })
        );

        return subscription;
      },

      removeSubscription: (subId) => {
        if (!subId) return;

        set(
          produce((state: State) => {
            if (!state.subscriptions[subId]) return;

            state.subscriptions[subId].listenersCount -= 1;

            if (state.subscriptions[subId].listenersCount <= 0) {
              state.subscriptions[subId]?.subscription?.stop();
              delete state.subscriptions[subId];
            }
          })
        );
      },

      addEvent: (subId, event, replaceOlderReplaceableEvents = true) =>
        set(
          produce((state: State) => {
            if (!subId) return;
            if (!state.subscriptions[subId]) return;

            state.subscriptions[subId].events = [event, ...state.subscriptions[subId].events]
              .filter(
                (e, i, a) =>
                  a.findIndex((ee) => {
                    if (ee.isParamReplaceable() && replaceOlderReplaceableEvents) {
                      return ee.dTag === e.dTag;
                    } else {
                      return ee.id === e.id;
                    }
                  }) === i
              )
              .sort((a, b) => a.created_at! - b.created_at!);
          })
        ),

      setEose: (subId, eose) =>
        set(
          produce((state: State) => {
            if (!subId) return;
            if (!state.subscriptions[subId]) return;

            state.subscriptions[subId].eose = eose;
          })
        ),

      setHasMore: (subId, hasMore) =>
        set(
          produce((state: State) => {
            if (!subId) return;
            if (!state.subscriptions[subId]) return;

            state.subscriptions[subId].hasMore = hasMore;
          })
        ),

      loadMore: (subId, limit) => {
        if (!subId) return;

        const sub = get().subscriptions[subId];
        if (!sub) return;

        if (!sub.hasMore || !sub.eose || !sub.events || !sub.events.length) return;

        const oldestEvent = sub.events[0];
        if (!oldestEvent) return;

        const ndk = get().ndk;
        if (!ndk) return;

        const untilTimestamp = oldestEvent.created_at! - 1;

        const loadMoreSub = ndk.subscribe(
          sub.subscription.filters.map(
            (filter) =>
              ({
                ...filter,
                limit: limit || filter.limit || 50,
                until: untilTimestamp,
              }) as NDKFilter
          ),
          { ...sub.subscription.opts, closeOnEose: true },
          sub.subscription.relaySet
        );

        let hasEvents = false;
        loadMoreSub.on('event', (event) => {
          hasEvents = true;
          sub.subscription.emit('event', event, event.relay, sub.subscription);
        });
        loadMoreSub.on('eose', () => {
          get().setHasMore(subId, hasEvents);
        });
      },

      // ndk actions
      initNdk: (constructorParams, update = false) => {
        const newConstructorParams = update
          ? { ...get().constructorParams, ...constructorParams }
          : { ...constructorParams };

        set(
          produce((state: State) => {
            state.constructorParams = newConstructorParams;
            state.ndk = new NDK(newConstructorParams);
          })
        );
      },

      setSigner: (signer) => {
        const newConstructorParams = { ...get().constructorParams };

        set(
          produce((state: State) => {
            if (signer) {
              newConstructorParams.signer = signer;
            } else {
              delete newConstructorParams.signer;
            }

            const ndk = new NDK(newConstructorParams);

            state.constructorParams = newConstructorParams;
            state.ndk = ndk;
          })
        );
      },

      // login actions
      loginWithExtension: ({
        onError,
        onSuccess,
      }: {
        onError?: (err: any) => void;
        onSuccess?: (signer: NDKNip07Signer) => void;
      } = {}) => {
        const signer = new NDKNip07Signer();

        signer
          .blockUntilReady()
          .then(() => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = 'Extension';
                state.loginData.nip46Address = undefined;
              })
            );

            get().setSigner(signer);

            onSuccess?.(signer);
          })
          .catch((err) => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

            onError?.(err);
          });
      },

      loginWithRemoteSigner: ({
        nip46Address,
        onError,
        onSuccess,
      }: {
        nip46Address?: string | undefined;
        onError?: (err: unknown) => void;
        onSuccess?: (signer: NDKNip46Signer) => void;
      } = {}) => {
        const { ndk } = get();
        if (!ndk) {
          onError?.('NDK instance is not initialized');

          return;
        }

        const _addr = !nip46Address ? get().loginData.nip46Address : nip46Address;

        if (!_addr) {
          set(
            produce((state: State) => {
              state.loginData.privateKey = undefined;
              state.loginData.loginMethod = undefined;
              state.loginData.nip46Address = undefined;
            })
          );

          onError?.('NIP46 address is empty');

          return;
        }

        const signer = new NDKNip46Signer(ndk, _addr);

        signer.on('authUrl', (url) => {
          window.open(url, 'auth', 'width=600,height=600');
        });

        signer
          .blockUntilReady()
          .then(() => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = 'Remote';
                state.loginData.nip46Address = _addr;
              })
            );

            get().setSigner(signer);

            onSuccess?.(signer);
          })
          .catch((err) => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

            onError?.(err);
          });
      },

      loginWithPrivateKey: ({
        privateKey,
        onError,
        onSuccess,
      }: {
        privateKey?: string | undefined;
        onError?: (err: unknown) => void;
        onSuccess?: (signer: NDKPrivateKeySigner) => void;
      } = {}) => {
        const signer = new NDKPrivateKeySigner(privateKey);

        signer
          .blockUntilReady()
          .then(() => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = privateKey;
                state.loginData.loginMethod = 'PrivateKey';
                state.loginData.nip46Address = undefined;
              })
            );

            get().setSigner(signer);

            onSuccess?.(signer);
          })
          .catch((err) => {
            set(
              produce((state: State) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

            onError?.(err);
          });
      },

      loginFromLocalStorage: () => {
        const { privateKey, loginMethod, nip46Address } = get().loginData;

        if (loginMethod === 'PrivateKey' && privateKey) {
          get().loginWithPrivateKey({ privateKey });
        } else if (loginMethod === 'Remote' && nip46Address) {
          get().loginWithRemoteSigner({ nip46Address });
        } else if (loginMethod === 'Extension') {
          get().loginWithExtension();
        }
      },

      logout: () => {
        set(
          produce((state: State) => {
            state.loginData.privateKey = undefined;
            state.loginData.loginMethod = undefined;
            state.loginData.nip46Address = undefined;
          })
        );

        get().setSigner(undefined);
      },
    }),
    {
      name: 'ndk-store',
      partialize: (state) => ({ loginData: state.loginData }),
    }
  )
);
