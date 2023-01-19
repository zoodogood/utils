# CreateModal
function CreateModal({title, customId, components}): {title, customId, components} implements Modal

**Description:**  
Use [simplify components](./SimplifyComponents.md) and transform through ModalBuilder.

### `options`
```ts
interface options = {  
	title: string,
	customId: string,
	components: Array<Component> | Array<ActionRow> | Component
}
```


## Example
```js
const customId = "@command/.example/create-content";
const title = "Укажите текстовое содержимое";
const components = {};
const modal = CreateModal({customId, title, components});

interaction.showModal(modal);
```

### Real example
```js
const askColor = async (user, interaction) => {
	
	const components = {type: ComponentType.TextInput, customId: "color-field", requied: true, label: "Цвет в формате HEX", maxLength: 7};
	const modal = CreateModal({
		customId: "get-color-modal",
		title: "Укажите цвет",
		components
	});

	interaction.showModal(modal);

	const filter = (interaction) => interaction.user === user;
	const fields = (await interaction.message.awaitMessageComponent({filter, time: 200_000}))?.fields;
	if (!fields){
		return null;
	}

	const color = fields.getField("color-field").value;
	const isColor = color.match(/#*([0-9a-f]{3}|[0-9a-f]{6})/i);
	if (isColor){
		return color;
	}
}

```

