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

expect(result.groups).toHaveLength(4);
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
```js
// In future
```
+++
