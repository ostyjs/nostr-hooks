![nostr-hooks](https://socialify.git.ci/ostyjs/nostr-hooks/image?description=1&descriptionEditable=React%20hooks%20for%20developing%20Nostr%20clients.&font=KoHo&forks=1&issues=1&language=1&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Dark)

# Nostr-Hooks

React hooks for developing [Nostr](https://github.com/nostr-protocol/nostr) clients. It's simple yet intelligent.

![NPM Downloads](https://img.shields.io/npm/dt/nostr-hooks)

Nostr-Hooks is a stateful wrapper library of React hooks around [NDK](https://github.com/nostr-dev-kit/ndk), designed to simplify the process of interacting with the Nostr protocol in real-time web applications. It provides an easy-to-use interface with low bandwidth consumption and high performance, allowing developers to quickly integrate Nostr into their projects and build responsive, real-time applications.

## Migrate to v2

Nostr-Hooks v2 is a major release.

- It replaces the `Zustand` store with the `React Context API`.
  This means that now you need to wrap your application with the `NostrHooksContextProvider` component.

- It replaces `nostr-tools` with `nostr-dev-kit (NDK)`.
  This means that most of the functionalities like caching, batching, and merging filters are now handled by NDK and Nostr-Hooks is only responsible for managing the component state and subscriptions.

## Installation

```bash
npm install nostr-hooks
```

## Features

- Provides a single instance of Nostr pool for the entire application, which is reused by all components.
- Creates a single connection to each Nostr relay at a time and reuses it for all subscriptions, reducing network overhead.
- Automatically manages subscriptions from multiple components and delivers only the events that each component needs.
- Automatically batches multiple subscriptions from different components into a single subscription request, further reducing network overhead.
- Intelligently merges filters into a unique set of filters, reducing the load on the Nostr relays.
- Provides a built-in cache mechanism since version 1.1.
- Minimizes re-renders by updating only the events that have changed, improving application performance.
- Automatically cleans up subscriptions and garbage events when a component unmounts, preventing memory leaks.

## Isn't NDK enough? Why do we need Nostr-Hooks?

> Nostr-Hooks is not a replacement for NDK. You may still need to install NDK and use it in your application.

NDK is a powerful library (shout-out to [pablo](https://github.com/pablof7z)) with a lot of out-of-the-box features, like caching, batching, and merging filters. However, it's a stateless library and doesn't understand the React component lifecycle. This means that it's up to the developer to update the component state when new events arrive, and to unsubscribe from the subscription when the component unmounts. This can be a tedious and error-prone process, especially when scaling the application. Nostr-Hooks on the other hand, is a stateful wrapper library that manages the component state and subscriptions automatically, allowing the developer to focus on building and scaling the application.

## Usage

### Add Context Provider

Wrap your application with the `NostrHooksContextProvider`. This will create a single instance of NDK for the entire application, which is reused by all components.

```jsx
import { NostrHooksContextProvider } from 'nostr-hooks';

const App = () => {
  return (
    <NostrHooksContextProvider>
      <YourApp />
    </NostrHooksContextProvider>
  );
};
```

### Subscribe to events

Here are some examples of how to use the `useSubscribe` hook:

#### Example 1: Basic usage:

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const { events } = useSubscribe({
    filters: [{ authors: ['pubkey1'], kinds: [1] }],
  });

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

The `useSubscribe` hook takes an object with one mandatory and two optional parameters:

- `filters`: A mandatory array of filters that the subscription should be created for.
- `enabled`: An optional boolean flag indicating whether the subscription is enabled. If set to `false`, the subscription will not be created automatically.
- `opts`: An optional "NDK Subscription Options" object.
- `relays`: An optional array of relay urls to use for the subscription. If not provided, the default relays will be used.

> There are lots of options available for creating a subscription. [Read more about the NDK subscription options here](https://github.com/nostr-dev-kit/ndk)

The `useSubscribe` hook returns an object with four properties:

- `events`: An array of events that match the filters.
- `eose`: A boolean flag indicating whether the subscription has reached the end of the stream.
- `unSubscribe`: A function that can be used to unsubscribe from the subscription.
- `isSubscribed`: A boolean flag indicating whether the subscription is active.

#### Example 2: Using multiple subscriptions in a single component:

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const { events: articles } = useSubscribe({
    filters: [{ authors: ['pubkey'], kinds: [30023] }],
  });

  const { events: notes } = useSubscribe({
    filters: [{ authors: ['pubkey'], kinds: [1] }],
  });

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

```jsx
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
  const { events } = useSubscribe({
    filters: [{ authors: ['pubkey'], kinds: [1] }],
  });

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
  const { events } = useSubscribe({
    filters: [{ authors: ['pubkey'], kinds: [30023] }],
  });

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

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = ({ noteId }: Params) => {
  const { events } = useSubscribe({
    filters: [{ ids: [noteId] }],
    enabled: !!noteId,
  });

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

### Publish new events

The `useNewEvent` hook is used to create a new NDK event, which can then be published using the internal `publish` method.

#### Example:

```jsx
import { useNewEvent } from 'nostr-hooks';

const MyComponent = () => {
  const [content, setContent] = useState('');

  const { createNewEvent } = useNewEvent();

  const handlePublish = () => {
    const event = createNewEvent();
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

> There is also a `usePublish` hook that can be used to publish an existing NDK event.

### Fetch Profiles

The `useProfiles` hook is used to fetch profiles for a given set of events or users.

> The default behavior is to mutate the original events or users with the fetched profiles. To prevent this, you can use the `mutateOrignal` option and set it to `false`. In this case, the updated events or users will be returned from the `useProfiles` hook, and you can use them to render the UI.

#### Example: Fetch profiles for a set of events:

Consider a scenario where you have a list of events, and you want to fetch the profiles of the authors of those events.

```jsx
const MyComponent = () => {
  const { events } = useSubscribe({ filters });

  useProfiles({ events });

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <p>{event.author.profile?.name}</p>
          <p>{event.author.profile?.bio}</p>
        </li>
      ))}
    </ul>
  );
};
```

The `useProfiles` hook will automatically fetch the profiles of the authors of the events, and mutate the original events with the fetched profiles. This means that the `author` property of each event will be updated with the fetched profile.

### Interact with NDK instance

You can leverage `useNdk` hook to interact with the NDK instance. it returns the NDK instance itself and also an updater (using [Immer](https://github.com/immerjs/use-immer)) to update the NDK instance and re-render the application.

```jsx
import { useNdk } from 'nostr-hooks';

const MyComponent = () => {
  const { ndk, updateNdk } = useNdk();

  const handleUpdateNdk = ({ signer }: UpdateNDKParams) => {
    updateNdk((draft) => {
      draft.signer = signer;
    });
  };
};
```

### Getting the Active User Profile

You can use the `useActiveUser` hook to get the active user's profile based on the current NDK instance and its signer.

```jsx
import { useActiveUser } from 'nostr-hooks';

const MyComponent = () => {
  const { activeUser } = useActiveUser();

  return (
    <div>
      <p>{activeUser?.profile?.name}</p>
    </div>
  );
};
```

### Using a NIP-07 browser extension (e.g. Alby, nos2x)

You can use the `useNip07` hook to update the current NDK instance with the NIP-07 browser extension's signer.
This hook will automatically update the `existing NDK instance` with the signer from the NIP-07 browser extension, and will prompt the user to connect to the NIP-07 browser extension if they haven't already.

```jsx
import { useNip07 } from 'nostr-hooks';

const MyComponent = () => {
  useNip07();

  // ...
};
```

> You can use this hook in the root component of your application for the entire application, or you can use it in a specific component where you need the user pubkey. This will update the NDK instance in the entire application.

## Contributing

We welcome contributions from the community! If you'd like to contribute to Nostr-Hooks, please refer to the [CONTRIBUTING.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/CONTRIBUTING.md) file in the project's GitHub repository.

> You can also consider contributing to [NDK](https://github.com/nostr-dev-kit/ndk).

## Donations

If you'd like to support the development of Nostr-Hooks, please consider donating to the developer.

- ⚡ Zap sats to [sepehr@getalby.com](sepehr@getalby.com)

> You can also consider supporting the [NDK](https://github.com/nostr-dev-kit/ndk).

## License

Nostr-Hooks is licensed under the MIT License. For more information, see the [LICENSE.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/LICENSE.md) file in the project's GitHub repository.

## Contact

If you have any questions or concerns about Nostr-Hooks, please contact the developer at [npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7](https://njump.me/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7).
