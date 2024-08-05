# Nostr-Hooks

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
