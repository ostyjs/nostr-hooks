# Nostr-Hooks

## 4.0.0

This version is a major update that includes a lot of breaking changes and improvements.
Please make sure to update your codebase according to the following changes.

### Breaking Changes

We have reverted the `createStore` function. It is no longer necessary to create multiple Zustand stores for each NDK instance. Instead, a single Zustand store will be used for a single NDK instance, simplifying the codebase and making it easier to manage.

The `useSubscribe` hook has been replaced with the `useSubscription` hook, which is more flexible and user-friendly. Detailed information about this change can be found in the README. Unlike `useSubscribe`, you no longer need to memoize input parameters. The `useSubscription` hook provides a `createSubscription` function that can be called with any parameters. It is recommended to call `createSubscription` within a `useEffect` hook and pass the parameters as arguments, and to call `removeSubscription` within the `useEffect` cleanup function. Examples are available in the README.

The `useNdk` and `useLogin` hooks have been reintroduced. The `useNdk` hook can be used to initialize and connect to the NDK instance, while the `useLogin` hook can be used for logging in with various methods. More details about these changes are available in the README.

### NIP-29 is here!

NIP-29 has been integrated in this release! This update introduces several new hooks and methods for interacting with NIP-29 Relay-based groups. We've implemented an internal store following best practices for state management in React, offering a comprehensive set of hooks and methods that are fast, efficient, and user-friendly. More details about these new hooks and methods can be found in the README.

## 3.0.0

This version is a major update that includes a lot of breaking changes and improvements.
Please make sure to update your codebase according to the following changes.

### Breaking Changes

- Removed hooks:
  - `useAutoLogin`
  - `useLogin`
  - `useNdk`
  - `useNewEvent`
  - `useNostrHooks`
  - `useProfiles`
  - `usePublish`
  - `useSigner`
- Modified hooks:
  - `useActiveUser`
  - `useProfile`
  - `useSubscribe`
- Added methods:
  - `createStore`
- Changed `secretKey` to `privateKey` everywhere.

We used to have an internal NDK instace in the previous versions of Nostr-Hooks which was also accessible through the `useNdk` hook. Since that approach was not flexible enough, we decided to let the user create their own NDK instances as many as they want and pass them to the hooks in a more reactive way.
To address this change, we let the user create multiple Zustand stores **(a Zustand store is a hook)** with the `createStore` function imported from `nostr-hooks` and use them to create and manage their own NDK instances in a more flexible and reactive way.
This also fixes the issue with re-rendering the components when the NDK instance changes, for example, when the user logs-in with different methods.

All the login related functionalities are moved from the legacy `useLogin` hook to any user created Zustand store. Also the `useAutoLogin` hook is removed so you just need to call the `loginFromLocalStorage` method from the Zustand store.

As we removed the `useNostrHooks` hook, you need to execute the `ndk.connect()` method manually once you initialize the NDK instance with the `initNdk` method from the created Zustand store.

As we removed the `useNewEvent` and `usePublish` hooks, you can simply use `new NDKEvent()` and `event.publish()` instead.

The `useNdk` and `useSigner` hooks are removed and you can simply use the `initNdk` and `setSigner` methods from the created Zustand store.

You can find more information about the new changes in the README.

### Summary of the new approach

1. Create a Zustand store with the `createStore` function:

```ts
// use-ndk.ts

import { createStore } from 'nostr-hooks';

export const useNdk = createStore('ndk-store'); // with unique store name
```

2. Initialize the NDK instance with the `initNdk` method and connect to the NDK with the `ndk.connect()` method:

```tsx
// App.tsx

import { useNdk } from './use-ndk';

export const App = () => {
  const { initNdk, ndk } = useNdk();

  useEffect(() => {
    initNdk({
      // NDK Constructor Options
    });
  }, [initNdk]);

  useEffect(() => {
    ndk?.connect();
  }, [ndk]);

  return <div>{/* Your app */}</div>;
};
```

## 2.10.0

- Added a `loadMore` function to the `useSubscribe` hook to fetch more events.
- Added a `hasMore` boolean to the `useSubscribe` hook to check if there are more events to fetch.

## 2.9.9

- Fixed a typo from `loginWithExtention` to `loginWithExtension`.

### Breaking Changes

- Fixed a typo from `loginWithExtention` to `loginWithExtension`. Now you need to use `loginWithExtension` instead of `loginWithExtention`.

## 2.9.8

- Added support for custom NDK instances. Now you can pass a custom NDK instance to all the hooks, but you need to execute `ndk.connect()` manually once you create a custom NDK instance.

## 2.9.2

- Replaces `useProfiles` with `useProfile` hook.
- Added `useAutoLogin` hook.
- Bug fixes for `useLogin` hook.
- Bug fixes for setting ndk signer.
- Refactor store.

### Breaking Changes

- Replaces `useProfiles` with `useProfile` hook. Now you can use `useProfile` hook to fetch a single profile by address.
- Replaces `reLoginFromLocalStorage` with `loginFromLocalStorage`.

## 2.8.0

- Improved `useSubscribe` hook to react to the changes in the input parameters.

### Breaking Changes

- `useSubscribe` hook is now sensitive to all the input parameters. If any of the input parameters change, the hook will unsubscribe from the previous subscription and subscribe to the new one. This will help you to subscribe to different filters based on the input parameters. You need to make sure that the input parameters are memoized and don't change on every render to avoid infinite re-render loops. You can find examples in README.
- `useNostrHooks` hook is now sensitive to the initial NDK instance parameter. You need to make sure that the initial NDK instance is memoized and doesn't change on every render to avoid infinite re-render loops. You can find examples in README.

## 2.7.0

- Improved interacting with different signers.
- Added `useSigner` hook.
- Added `useLogin` hook.
- Removed `useNip07` hook.

### Breaking Changes

- Extracted signer related functionalities from `useNDK` hook to `useSigner` hook. Now you need to import `setSigner` method from `useSigner` hook instead of `useNDK` hook.
- Removed `useNip07` hook. Now you can use `useLogin` hook to login with extension (NIP-07).

## 2.6.0

- Added `fetchProfiles` boolean to `useSubscribe` hook to fetch profiles on subscription.

## 2.5.0

### Breaking Changes

- It reverts replacing `Zustand` store with the `React Context API`. Now, you don't need to wrap your application with the `NostrHooksContextProvider` component. but you need to initialize NostrHooks with `useNostrHooks` hook. You can find more information about this change in readme.
- It reverts using `Immer` for updating NDK instance in `useNDK` hook, and uses `CloneDeep` from `lodash` to update the NDK instance.

## 2.4.0

### Breaking Changes

- Using [Immer](https://github.com/immerjs/use-immer) for updating NDK instance in `useNDK` hook. This will require you to update your code to use the new `produce` function from `immer` to update the NDK instance. This is a breaking change because the old `setState` function is no longer available. You can find more information about this change in the [README](https://github.com/ostyjs/nostr-hooks/blob/master/README.md), and Immer documentation.

## 2.x.x

### Breaking Changes

- It replaces the `Zustand` store with the `React Context API`.
  This means that now you need to wrap your application with the `NostrHooksContextProvider` component.

- It replaces `nostr-tools` with `nostr-dev-kit (NDK)`.
  This means that most of the functionalities like caching, batching, and merging filters are now handled by NDK and Nostr-Hooks is only responsible for managing the component state and subscriptions.
