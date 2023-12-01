# SimplifyComponents
`function SimplifyComponents(ButtonData): ActionRow<Component>`

**Description:**  
Note: Sugar for [Simplify Components](./SimplifyComponents.md)
Allows you to Pass only personalized fields

### `ButtonData`
```ts
interface ButtonData = {
	label?: string;
	emoji?: 
}
```


## Example
```js
const components = Util.justButtonComponents(
	{ label: "Open now" },
   { emoji: "1068072988492189726" },
	{ label: "123", customId: "122" },
);

CreateMessage({components, content: "Watch, is me< Mario"});
// Action row with two buttons
// customId's will be button.1, button.2 and 122
```

### Real example
```js
const components = Util.justButtonComponents(
	{ label: "Open now" },
   { emoji: "1068072988492189726" },
);
```

