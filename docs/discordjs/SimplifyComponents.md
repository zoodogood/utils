# SimplifyComponents
`function SimplifyComponents(data: Array<ActionRow> | Array<Component> | Component): ActionRow<Component>`

**Description:**  
Replaces interactions with ActionRow with working with arrays. Or even narrows down to one object.

### `embed`
```ts
interface embed = {
	title?: string,
   author?: {name: string, iconURL?: string},
   thumbnail?: {url: string},
   description?: string,
   fields?: Array<{name: string, value: string, inline?: boolean}>,
   image?: {url: string},
   footer?: {text: string, iconURL?: string},
   timestamp?: Date,
   video?: {url: string}
}
```


## Example
```js
const components1 = {
	type: ComponentType.Button,
	label: "Some content",
	style: ButtonStyle.Primary,
	customId: "Some custom id"
};

const components2 = [
	{
		type: ComponentType.Button,
		label: "Some content",
		style: ButtonStyle.Primary,
		customId: "Some custom id - 1"
	},
	{
		type: ComponentType.Button,
		label: "Some content",
		style: ButtonStyle.Primary,
		customId: "Some custom id - 2"
	}
];

const components3 = [
	[
		{
			type: ComponentType.Button,
			label: "Some content",
			style: ButtonStyle.Primary,
			customId: "Some custom id - 1"
		},
		{
			type: ComponentType.Button,
			label: "Some content",
			style: ButtonStyle.Primary,
			customId: "Some custom id - 2"
		}
	],
	[
		{
			type: ComponentType.Button,
			label: "Some content in second row",
			style: ButtonStyle.Primary,
			customId: "Some custom id - 3"
		},
	]
];

SimplifyComponents(components1) // ActionRow<ActionRow>
SimplifyComponents(components2) // ActionRow<ActionRow>
SimplifyComponents(components3) // ActionRow<ActionRow>
```

### Real example
```js
const component = {
	type: ComponentType.Button,
	label: "Some content",
	style: ButtonStyle.Primary,
	customId: "Some custom id"
}

CreateMessage({components: SimplifyComponents(component)})
```

