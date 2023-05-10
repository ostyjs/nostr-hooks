# Nostr-Hooks

React hooks for developing [Nostr](https://github.com/fiatjaf/nostr) clients. It's simple yet intelligent.

Nostr-Hooks is a library of React hooks designed to simplify the process of interacting with the Nostr protocol in real-time web applications. It provides an easy-to-use interface with low bandwidth consumption and high performance, allowing developers to quickly integrate Nostr into their projects and build responsive, real-time applications.

## Used by

- [Nostribe](https://nostribe.com)
- [New Iris](https://new.iris.to)
- [Pinstr](https://pinstr.app)

```
Add your project here by submitting a PR!
```

## Features

- Provides a single instance of Nostr pool for the entire application, which is reused by all components.
- Creates a single connection to each Nostr relay at a time and reuses it for all subscriptions, reducing network overhead.
- Automatically manages subscriptions from multiple components and delivers only the events that each component needs.
- Automatically batches multiple subscriptions from different components into a single subscription request, further reducing network overhead.
- Intelligently merges filters into a unique set of filters, reducing the load on the Nostr relays.
- Provides a built-in cache mechanism since version 1.1, storing events for a fixed amount of time (~10 seconds) and removing them permanently if they do not receive a new subscription in that time.
- Optimizes subscriptions by first checking for available events that match the provided filters, retrieving those events instead of creating a new subscription request to the Nostr relay, reducing network overhead. If there are no available events that match the provided filters, a new subscription will be created and the new events will be added to the cache.
- Minimizes re-renders by updating only the events that have changed, improving application performance.
- Accepts an options object, allowing users to configure various options such as whether the subscription is enabled, whether to force immediate subscription, whether to invalidate existing events, whether to stay connected to the relay after the subscription ends, and the batching interval.
- Automatically cleans up subscriptions and garbage events when a component unmounts, preventing memory leaks.

## Installation

To install Nostr-Hooks, use npm:

```bash
npm install nostr-hooks
```

## Usage

### Subscribe to events

Here are some examples of how to use the `useSubscribe` hook:

#### Example 1: Basic usage:

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const { events, eose, invalidate } = useSubscribe({
    relays: ['wss://relay.damus.io'],
    filters: [{ authors: ['pubkey1'], kinds: [0] }],
  });

  if (!events && !eose) return <p>Loading...</p>;

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

The `useSubscribe` hook takes an object with three optional parameters:

- `filters`: An array of filters to apply to the subscription.
- `relays`: An array of Nostr relay URLs to use for the subscription.
- `options`: An optional object containing additional options for fine-tuning the subscription.

The hook returns an object with three properties:

- `events`: An array of Nostr events that match the filters and have been received from the relays.
- `eose`: A boolean flag indicating whether the subscription has ended.
- `invalidate`: A function that can be used to invalidate the existing events for the provided filters and create a new subscription. This can be useful for refreshing the events for a set of filters.

#### Example 2: Using Options object:

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const [toggle, setToggle] = useState(false);

  const { events, eose } = useSubscribe({
    relays: ['wss://relay.damus.io'],
    filters: [{ authors: ['pubkey1'], kinds: [1], limit: 10 }],
    options: {
      enabled: toggle,
      force: false,
      batchingInterval: 500,
      invalidate: false,
      closeAfterEose: true,
    },
  });

  if (!events && !eose) return <p>Loading...</p>;

  return (
    <>
      <button onClick={() => setToggle(!toggle)}>Toggle</button>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <p>{event.pubkey}</p>
            <p>{event.kind}</p>
            <p>{event.id}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
```

The optional `options` object accepts the following properties:

- `enabled`: A boolean flag indicating whether the subscription is enabled. If set to `false`, the subscription will not be created. This can be useful for toggling subscriptions on and off.

  ```
  Default is `true`
  ```

- `force`: A boolean flag indicating whether the subscription should be created immediately. If set to `false`, the subscription will be batched with other subscriptions and created at the next batching interval.

  ```
  Default is `false`
  ```

- `batchingInterval`: The interval in milliseconds at which the subscription should be batched.

  ```
  Default is `500`
  ```

- `invalidate`: A boolean flag indicating whether the existing events are invalidated and a new subscription should be created. This can be useful for refreshing the events for a set of filters.

  - If set to `true`, all the existing events for the provided filters will be purged from the cache and a new subscription will be created. This will cause a re-render for all components that are subscribed to the same filters.
  - If set to `false`, the subscription will be created if there is no existing events for the provided filters. If there are existing events, the subscription will not be created and the existing events will be returned.

  ```
  Default is `false`
  ```

- `closeAfterEose`: A boolean flag indicating whether the connection to the relay should be closed after the subscription ends. If set to `false`, the connection will remain open and future events will be received.

  ```
  Default is `true`
  ```

#### Example 3: Using multiple subscriptions in a single component:

```jsx
import { useSubscribe } from 'nostr-hooks';

const RELAYS = ['wss://relay.damus.io'];

const MyComponent = () => {
  const { events: metadataEvents } = useSubscribe({
    relays: RELAYS,
    filters: [{ authors: ['pubkey'], kinds: [0] }],
  });

  const { events: noteEvents } = useSubscribe({
    relays: RELAYS,
    filters: [{ authors: ['pubkey'], kinds: [1], limit: 10 }],
  });

  return (
    <>
      <ul>
        {metadataEvents.map((event) => (
          <li key={event.id}>
            <p>{event.pubkey}</p>
            <p>{event.content}</p>
          </li>
        ))}
      </ul>

      <ul>
        {noteEvents.map((event) => (
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

The `useSubscribe` hook can be used multiple times in a single component. Nostr-Hooks batches all subscriptions into a single subscription request, and delivers only the events that each hook needs.

#### Example 4: Using subscriptions in multiple components:

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
    relays: ['wss://relay.damus.io'],
    filters: [{ authors: ['pubkey'], kinds: [0] }],
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
    relays: ['wss://relay.damus.io'],
    filters: [{ authors: ['pubkey'], kinds: [1], limit: 10 }],
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

#### Example 5: Dependent subscriptions:

```jsx
import { useSubscribe } from 'nostr-hooks';

const MyComponent = ({ noteId }: Params) => {
  const { events } = useSubscribe({
    relays: ['wss://relay.damus.io'],
    filters: [{ ids: [noteId] }],
    options: {
      enabled: !!noteId,
    },
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

The `usePublish` hook is used to publish a new event to the provided relays.

#### Example 1: Publishing a new event using NIP-07

```jsx
import { usePublish } from 'nostr-hooks';

const RELAYS = ['wss://relay.damus.io'];

const MyComponent = () => {
  const [content, setContent] = useState('');

  const publish = usePublish(RELAYS);

  const handleSend = async () => {
    await publish({
      kind: 1,
      content,
    });
  };

  return (
    <>
      <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />

      <button onClick={handleSend}>Publish Note</button>
    </>
  );
};
```

The `usePublish` hook returns a function that can be used to publish a new event to the provided relays. This hook attach the current timestamp and then signs the event using [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) before publishing it to the relays.

#### Example 2: Publishing a new event using private key

```ts
const publish = usePublish(RELAYS, PRIVATE_KEY);
```

The `usePublish` hook accepts an optional private key as the second argument. If the private key is provided, the hook will sign the event using the provided private key before publishing it to the relays. If the private key is not provided, the hook will sign the event using [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md).

## Contributing

We welcome contributions from the community! If you'd like to contribute to Nostr-Hooks, please refer to the [CONTRIBUTING.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/CONTRIBUTING.md) file in the project's GitHub repository.

## Donations

If you'd like to support the development of Nostr-Hooks, please consider donating to the developer.

- ⚡ Zap sats to [sepehr@getalby.com](sepehr@getalby.com)

## License

Nostr-Hooks is licensed under the Public Domain License. For more information, see the [LICENSE.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/LICENSE.md) file in the project's GitHub repository.

## Contact

If you have any questions or concerns about Nostr-Hooks, please contact the developer at [npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7](https://nostribe.com/profile/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7).
