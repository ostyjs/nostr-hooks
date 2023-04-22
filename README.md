# Nostr-Hooks

React hooks for developing [Nostr](https://github.com/fiatjaf/nostr) clients.

Nostr-Hooks is a library of React hooks designed to simplify the process of interacting with the Nostr protocol in real-time web applications. It provides an easy-to-use interface with low bandwidth consumption and high performance, allowing developers to quickly integrate Nostr into their projects and build responsive, real-time applications.

## Features

- Provides a single instance of Nostr pool for the entire application, which is reused by all components.
- Creates a single connection to each Nostr relay at a time and reuses it for all subscriptions, reducing network overhead.
- Automatically manages subscriptions from multiple components and delivers only the events that each component needs.
- Automatically batches multiple subscriptions from different components into a single subscription request, further reducing network overhead.
- Inteligently merges filters into a unique set of filters, reducing the load on the Nostr relays.
- Minimizes re-renders by updating only the events that have changed, improving application performance.
- Accepts an options object, allowing users to configure various options such as whether the subscription is enabled, whether to force immediate subscription, and the batching interval.
- Automatically cleans up subscriptions and garbage events when a component unmounts, preventing memory leaks.

## Installation

To install Nostr-Hooks, use npm:

```bash
npm install nostr-hooks
```

## Usage

Here are some examples of how to use the `useNostrSubscribe` hook:

### Example 1: Basic usage:

```jsx
import { useNostrSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const { events, eose } = useNostrSubscribe({
    filters: [{ authors: ['pubkey1'], kinds: [0] }],
    relays: ['wss://relay.damus.io'],
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

The `useNostrSubscribe` hook takes an object with three optional parameters:

- `filters`: An array of filters to apply to the subscription.
- `relays`: An array of Nostr relay URLs to use for the subscription.
- `options`: An object containing additional options to pass to the Nostr client.

The hook returns an object with two properties:

- `events`: An array of Nostr events that match the filters and have been received from the relays.
- `eose`: A boolean flag indicating whether the subscription has ended.

### Example 2: Using Options object:

```jsx
import { useNostrSubscribe } from 'nostr-hooks';

const MyComponent = () => {
  const [toggle, setToggle] = useState(false);

  const { events, eose } = useNostrSubscribe({
    filters: [{ authors: ['pubkey1'], kinds: [1], limit: 10 }],
    relays: ['wss://relay.damus.io'],
    options: {
      enabled: toggle,
      force: false,
      batchingInterval: 500,
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

The `options` object accepts the following properties:

- `enabled`: A boolean flag indicating whether the subscription is enabled. If set to `false`, the subscription will not be created.

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

## Contributing

We welcome contributions from the community! If you'd like to contribute to Nostr-Hooks, please refer to the [CONTRIBUTING.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/CONTRIBUTING.md) file in the project's GitHub repository.

## License

Nostr-Hooks is licensed under the Public Domain License. For more information, see the [LICENSE.md](https://github.com/sepehr-safari/nostr-hooks/blob/master/LICENSE.md) file in the project's GitHub repository.

## Contact

If you have any questions or concerns about Nostr-Hooks, please contact the developer at [npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7](https://nostribe.com/profile/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7).
