# CustomCollector
class CustomCollector \{}

> [!Warning]
> Unstable

**Description:**  
\- None

## `constructor(CollectorOptions)`


### `CollectorOptions`
```ts
interface CollectorOptions = {
	target: EventEmitter | object,
	event: string,
	filter?: (any) => true | false | any,
	time?: number = 0
}
```


## Example
```js
const target = new EventEmitter();
const eventName = "click";
document.addEventListener("click", () => target.emit(eventName));

const lessThatFive = (value) => value < 5;
const context = {
	clicks: 0
}
const collector = new CustomCollector({target, event: eventName, filter: lessThatFive, time: 10_000});
collector.setCallback(() => context.clicks++);
```

### Real example
```js
const isAuthor = (message) = message.author.id === user.id;
const collector = new Util.CustomCollector({target: client, event: "message", filter: isAuthor, time: 500_000});
collector.setCallback((message) => {
    collector.end();
    getCoinsFromMessage(user, message);
});
```

## Methods

### `setCallback((any) => any): void`
Initializes a callback function. It will be use when the event passed the filter is called.

### `end(): void`
Close event listeners
