# BracketsParser
class BracketsParser \{}

**Description:**  
\- Resolve groups from text




## Example
+++ Easy example
```js
const text = '({}[{"nested"}])';
const parser = new BracketsParser();
const result = parser
	.addBracketVariant(...BracketsParser.defaultBracketVariants)
	.parse(text);

expect(result.groups).toHaveLength(5);
```
+++ Custom brackets
```ts
parser.addBracketVariant([
	{
		key: "****", 
		start: "**",
		end: "**",
		isSequence: true
	},
	{
		key: ">>>",
		start: /^>>>\s/,
		end: /(?<=^.?)$/m,
		isSequence: true,
		isRegex: true
	},
])

```

+++ Real example
```ts
const context = this.BracketsManager.parse(this.text);
const groups = context.groups.filter((group) => group.depth === 0);
let offset = 0;
for (const index in groups) {
	const group = groups[index];
	const replacement = `[Group*${index}]`;
	const length = group.length;
	this.replaceTextByIndexes(
		group.indexInText! - offset,
		length,
		() => replacement,
	);

	offset += length - replacement.length;
}
return this;
```
+++
