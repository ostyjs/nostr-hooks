# Nostr-Hooks

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
