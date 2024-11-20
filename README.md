![nostr-hooks](https://socialify.git.ci/ostyjs/nostr-hooks/image?description=1&descriptionEditable=React%20hooks%20for%20developing%20Nostr%20clients.&font=KoHo&forks=1&issues=1&language=1&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Dark)

# Nostr-Hooks

React hooks for developing [Nostr](https://github.com/nostr-protocol/nostr) clients. It's simple yet intelligent.

![NPM Downloads](https://img.shields.io/npm/dt/nostr-hooks)

Nostr-Hooks is a stateful wrapper library of React hooks around [NDK](https://github.com/nostr-dev-kit/ndk), designed to simplify the process of interacting with the Nostr protocol in real-time web applications. It provides an easy-to-use interface with low bandwidth consumption and high performance, allowing developers to quickly integrate Nostr into their projects and build responsive, real-time applications.

## Supported by

<a href="https://opensats.org">
  <img src="https://opensats.org/logo.svg" alt="OpenSats" width="150px" />
</a>

## Features

- Provides high-level hooks to interact with the Nostr protocol, making it easy to integrate Nostr into React applications.
- Provides a single instance of Nostr pool for the entire application, which is reused by all components.
- Creates a single connection to each Nostr relay at a time and reuses it for all subscriptions, reducing network overhead.
- Automatically manages subscriptions from multiple components and delivers only the events that each component needs.
- Automatically batches multiple subscriptions from different components into a single subscription request, further reducing network overhead.
- Intelligently merges filters into a unique set of filters, reducing the load on the Nostr relays.
- Provides a built-in cache mechanism since version 1.1.
- Minimizes re-renders by updating only the events that have changed, improving application performance.
- Automatically cleans up subscriptions and garbage events when a component unmounts, preventing memory leaks.

<details>
  <summary>
    <b>
      Isn't nostr-tools or NDK enough? Why do we need Nostr-Hooks?
    </b>
  </summary>

Nostr-Hooks is not a replacement for NDK or nostr-tools. You may still need to install and use them in your application for some advanced low-level functionalities.
As you may know NDK is a powerful library (shout-out to [pablo](https://github.com/pablof7z)) with a lot of out-of-the-box features, like caching, batching, and merging filters. However, it's a **stateless** library and doesn't understand the React component lifecycle. This means that it's up to the developer to update the component state when new events arrive, and to unsubscribe from the subscription when the component unmounts. This can be a tedious and error-prone process, especially when scaling the application. Nostr-Hooks on the other hand, is a stateful wrapper library that manages the component state and subscriptions automatically, allowing the developer to focus on building and scaling the application.
Nostr-Hooks also provides a bunch of well-designed high-level hooks to interact with relays, so you don't need to worry about the low-level details any more.

</details>

## Usage

## Installation

```sh
npm install nostr-hooks
```

### First create a store

Your store is a hook that will be used to manage the NDK instance and its Signer.

```tsx
// use-ndk.ts

import { createStore } from 'nostr-hooks';

export const useNdk = createStore('ndk-store'); // with unique store name
```

> You should provide unique names for your stores – This will be used as the key in the localStorage.

### Then do some setup

Initialize the Ndk instance, and connect to it.

```tsx
import { useNdk } from './use-ndk';

const App = () => {
  const { initNdk, ndk } = useNdk();

  useEffect(() => {
    initNdk({
      // NDK Constructor Options
    });
  }, [initNdk]);

  useEffect(() => {
    ndk?.connect(); // This will also reconnect when the instance changes
  }, [ndk]);

  return <div>My App</div>;
};
```

> Calling `initNdk` and `ndk.connect` are mandatory to start using Nostr-Hooks.

### Subscribe to events

Here are some examples of how to use the `useSubscribe` hook:

#### Example 1: Basic usage:

```tsx
import { useSubscribe } from 'nostr-hooks';
import { useNdk } from './use-ndk';

const filters = [{ authors: ['pubkey1'], kinds: [1] }];

const MyComponent = () => {
  const { ndk } = useNdk();
  const { events } = useSubscribe(ndk, { filters });

  if (!events) return <p>Loading...</p>;

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <p>{event.pubkey}</p>
          <p>{event.kind}</p>
        </li>
      ))}
    </ul>
  );
};
```

The `useSubscribe` hook takes two parameters:

- `ndk`: The NDK instance to use for the subscription.
- `options`: An object with the following properties:
  - `filters`: A mandatory array of filters that the subscription should be created for.
  - `enabled`: An optional boolean flag indicating whether the subscription is enabled. If set to `false`, the subscription will not be created automatically.
  - `opts`: An optional "NDK Subscription Options" object.
  - `relays`: An optional array of relay urls to use for the subscription. If not provided, the default relays will be used.
  - `fetchProfiles`: An optional boolean flag indicating whether to fetch profiles for the events in the subscription. If set to `true`, the profiles will be fetched automatically.

> There are lots of options available for creating a subscription. [Read more about the NDK subscription options here](https://github.com/nostr-dev-kit/ndk)

The `useSubscribe` hook returns an object with a few properties:

- `events`: An array of events that match the filters.
- `eose`: A boolean flag indicating whether the subscription has reached the end of the stream.
- `unSubscribe`: A function that can be used to unsubscribe from the subscription.
- `isSubscribed`: A boolean flag indicating whether the subscription is active.
- `hasMore`: A boolean flag indicating whether there are more events available to fetch.
- `loadMore`: A function that can be used to fetch more events.

⚠️ **Note** that since version 2.8.0, the `useSubscribe` hook is sensitive to all the input parameters. If any of the input parameters change, the hook will unsubscribe from the previous subscription and subscribe to the new one. This will help you to subscribe to different filters based on the input parameters. You need to make sure that the input parameters are memoized and don't change on every render to avoid **infinite re-render loops**.

🚫 Don't:

```tsx
const MyComponent = ({ pubkey }) => {
  const { ndk } = useNdk();

  const { events } = useSubscribe(ndk, { filters: [{ authors: [pubkey], kinds: [1] }] });

  // ...
};
```

✅ Do:

```tsx
const MyComponent = ({ pubkey }) => {
  const { ndk } = useNdk();

  const options = useMemo(() => ({ filters: [{ authors: [pubkey], kinds: [1] }] }), [pubkey]);

  const { events } = useSubscribe(ndk, options);

  // ...
};
```

#### Example 2: Using multiple subscriptions in a single component:

```tsx
import { useSubscribe } from 'nostr-hooks';
import { useNdk } from './use-ndk';

// You can define filters outside the component to prevent re-creating them on every render
const articlesFilters = [{ authors: ['pubkey'], kinds: [30023] }];
const notesFilters = [{ authors: ['pubkey'], kinds: [1] }];

const MyComponent = () => {
  const { ndk } = useNdk();

  const { events: articles } = useSubscribe(ndk, { filters: articlesFilters });

  const { events: notes } = useSubscribe(ndk, { filters: notesFilters });

  return (
    <>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <p>{article.pubkey}</p>
            <p>{article.content}</p>
          </li>
        ))}
      </ul>

      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <p>{note.pubkey}</p>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
```

The `useSubscribe` hook can be used multiple times in a single component. Nostr-Hooks batches all subscriptions into a single subscription request, and delivers only the events that each hook needs.

#### Example 3: Using subscriptions in multiple components:

```tsx
import { useSubscribe } from 'nostr-hooks';

const App = () => {
  return (
    <>
      <ComponentA />
      <ComponentB />
    </>
  );
};

const ComponentA = () => {
  const { ndk } = useNdk();

  const filters = useMemo(() => [{ authors: ['pubkey'], kinds: [1] }], []);
  const { events } = useSubscribe(ndk, { filters });

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <p>{event.pubkey}</p>
          <p>{event.kind}</p>
        </li>
      ))}
    </ul>
  );
};

const ComponentB = () => {
  const { ndk } = useNdk();

  const filters = useMemo(() => [{ authors: ['pubkey'], kinds: [30023] }], []);
  const { events } = useSubscribe(ndk, { filters });

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <p>{event.pubkey}</p>
          <p>{event.content}</p>
        </li>
      ))}
    </ul>
  );
};
```

The `useSubscribe` hook can be used in multiple components. Nostr-Hooks batches all subscriptions from all components into a single subscription request, and delivers only the events that each component needs.

#### Example 4: Dependent subscriptions:

```tsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = ({ noteId }: Params) => {
  const { ndk } = useNdk();

  const { events } = useSubscribe(
    ndk,
    useMemo(
      () => ({
        filters: [{ ids: [noteId] }],
        enabled: !!noteId,
      }),
      [noteId]
    )
  );

  return (
    <>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <p>{event.pubkey}</p>
            <p>{event.content}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
```

The `useSubscribe` hook can be used in a component that depends on a prop or state. In this example, the subscription waits for the `noteId` prop to be set before creating the subscription.

#### Example 5: Using different ndk instances:

```tsx
import { useSubscribe } from 'nostr-hooks';
import { useGlobalNdk } from './use-global-ndk';
import { useSpecificNdk } from './use-specific-ndk';

const MyComponent = () => {
  const { ndk: globalNdk } = useGlobalNdk();
  const { ndk: specificNdk } = useSpecificNdk();

  const filters = useMemo(() => [{ authors: ['pubkey'], kinds: [1] }], []);
  const { events: globalEvents } = useSubscribe(globalNdk, { filters });
  const { events: specificEvents } = useSubscribe(specificNdk, { filters });

  return (
    <>
      <ul>
        {globalEvents.map((event) => (
          <li key={event.id}>
            <p>{event.pubkey}</p>
            <p>{event.content}</p>
          </li>
        ))}
      </ul>

      <ul>
        {specificEvents.map((event) => (
          <li key={event.id}>
            <p>{event.pubkey}</p>
            <p>{event.content}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
```

### Publish new events

You can publish new events using the `NDKEvent` class and the `publish` method.

```tsx
import { NDKEvent } from 'nostr-dev-kit';
import { useNdk } from './use-ndk';

const MyComponent = () => {
  const [content, setContent] = useState('');

  const { ndk } = useNdk();

  const handlePublish = () => {
    const event = new NDKEvent(ndk);
    event.content = content;
    event.kind = 1;

    event.publish();
  };

  return (
    <>
      <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />

      <button onClick={() => handlePublish()}>Publish Note</button>
    </>
  );
};
```

### Fetch Profile for a user

The `useProfile` hook is used to fetch profile for a given user based on their `pubkey`, `npub`, `nip46 address`, or `nip05`. It returns the fetched profile.

```tsx
import { useProfile } from 'nostr-hooks';
import { useNdk } from './use-ndk';

const MyComponent = () => {
  const { profile } = useProfile(ndk, { pubkey: '...' });

  return (
    <div>
      <p>{profile?.displayName}</p>
      <p>{profile?.about}</p>
    </div>
  );
};
```

### Interact with Signer

You can leverage `useSigner` hook to interact with the signer.

```tsx
import { useNdk } from './use-ndk';

const newSigner = new NDKNip07Signer();

const MyComponent = () => {
  const { ndk, setSigner } = useNdk();

  setSigner(newSigner); // this will keep the existing NDK instance and update its signer
};
```

> You may not need to use the `useSigner` hook directly. See the next section for more information.

### Login with different signers

You can use the various login methods provided by the created Zustand store. These hooks will automatically update the NDK instance with the new signer. These also use local storage to persist the login method, so the user doesn't need to login manually every time the page reloads or the app restarts.

We provide 4 methods for logging in with different signers, and 1 method for logging out:

- `loginWithExtension`: Login with Nostr Extension (NIP07).
- `loginWithRemoteSigner`: Login with Remote Signer (NIP46).
- `loginWithPrivateKey`: Login with Private Key.
- `loginFromLocalStorage`: Login from previously saved login method in local storage.
- `logout`: Logout.

```tsx
import { useNdk } from './use-ndk';

const MyComponent = () => {
  const {
    loginWithExtension,
    loginWithRemoteSigner,
    loginWithSecretKey,
    loginFromLocalStorage,
    logout,
  } = useNdk();

  return (
    <>
      <button onClick={() => loginWithExtension()}>Login with Extension</button>
      <button onClick={() => loginWithRemoteSigner()}>Login with Remote Signer</button>
      <button onClick={() => loginWithSecretKey()}>Login with Secret Key</button>
      <button onClick={() => loginFromLocalStorage()}>Login from Local Storage</button>
      <button onClick={() => logout()}>Logout</button>
    </>
  );
};
```

#### Automatically login with previously saved login method:

You can use `loginFromLocalStorage` to automatically login with previously saved login method in local storage when the component mounts.

```tsx
import { useNdk } from './use-ndk';

const MyComponent = () => {
  const { loginFromLocalStorage } = useNdk();

  useEffect(() => {
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);
};
```

### Getting the Active User Profile

You can use the `useActiveUser` hook to get the active user's profile based on the provided NDK instance and its signer.

```tsx
import { useActiveUser } from 'nostr-hooks';
import { useNdk } from './use-ndk';

const MyComponent = () => {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser(ndk);

  if (!activeUser) return <p>Not logged in</p>;

  return (
    <div>
      <p>{activeUser.pubkey}</p>
    </div>
  );
};
```

> If the user is not logged in, the `activeUser` will be `undefined`.

## Contributing

We welcome contributions from the community! If you'd like to contribute to Nostr-Hooks, please refer to the [CONTRIBUTING.md](https://github.com/ostyjs/nostr-hooks/blob/master/CONTRIBUTING.md) file in the project's GitHub repository.

> You can also consider contributing to [NDK](https://github.com/nostr-dev-kit/ndk).

## Donations

If you'd like to support the development of Nostr-Hooks, please consider donating to the developer.

- ⚡ Zap sats to [sepehr@getalby.com](sepehr@getalby.com)

> You can also consider supporting the [NDK](https://github.com/nostr-dev-kit/ndk).

## License

Nostr-Hooks is licensed under the MIT License. For more information, see the [LICENSE.md](https://github.com/ostyjs/nostr-hooks/blob/master/LICENSE.md) file in the project's GitHub repository.

## Contact

If you have any questions or concerns about Nostr-Hooks, please contact the developer at [npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7](https://njump.me/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7).
