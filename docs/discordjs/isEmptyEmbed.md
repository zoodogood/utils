# isEmptyEmbed
function isEmptyEmbed(embed): boolean  

**Description:**  
Returns true if all embed parameters that specify content are equal to the default value.

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
embed = {};
output = isEmptyEmbed(embed);
// true

embed = {color: "#00ff00"};
output = isEmptyEmbed(embed);
// true

embed = {title: "Some content"};
output = isEmptyEmbed(embed);
// false
```

### Real example
```js
const embed = new EmbedBuilder({
    title, url, author, thumbnail,
    description, color, fields,
    image, video, footer, timestamp
});

if (!isEmptyEmbed(embed)){
	message.embeds = [embed];
}
```

