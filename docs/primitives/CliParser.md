# CliParser
class CliParser \{}

**Description:**  
\- Capture groups and flags with values




## Example
+++ Mini
```js
const parsed = new CliParser()
	.setText("hello -h")
	.captureFlags([{
		name: "--help",
		capture: ["--help", "-h"],
		expectValue: false,
	}])
	.collect();
	
expect(parsed.captures.get("--help")?.toString())
	.toBe("-h");
```
+++ With groups
```js
const parser = new CliParser();

const result = parser
	.setText("pay 200 --resourcegroup (coins {he-he}) Hello, World!")
	.processBrackets()
	.captureByMatch({ name: "command", regex: /^[a-zа-яёъ]+/i })
	.captureFlags([
		{
			name: "--help",
			capture: ["--help", "-h"],
		},
		{
			capture: ["--resourceGroup"],
			expectValue: true,
		},
	])
	.captureByMatch({ regex: /\d+/, name: "value" })
	.captureResidue({ name: "message" })
	.collect();

const resolver = (
	capture: InstanceType<typeof CliParser.CapturedContent> | null,
) =>
	(capture &&
	(capture.isBracketGroupStamp()
		? capture.toGroupElement()
		: capture.toString())) ||
	null;
const values = result.resolveValues(resolver);

expect(values.get("--help")).equal(null);
expect(values.get("command")).equal("pay");
expect(values.get("--resourceGroup")!.full).equal("(coins {he-he})");

const group = values.get("--resourceGroup");
if (group instanceof BracketsParser.GroupElement) {
	expect(group.content).equal("coins {he-he}");
	expect(group.subgroups.length).toBe(1);
}
```
+++ Real example
```ts
// > run()
const parsed = new CliParser()
	.setText(context.params)
	.captureFlags(this.options.cliParser.flags)
	.collect();
	
const values = parser.resolveValues(capture => capture?.toString());
context.setCliParsed(parsed, values);

// > processHelp()
const hasHelpFlag = context.getCliParsed()
	.at(1)
	.get("--help");

if (!hasHelpFlag){
	return;
}
```
+++


## Methods
+++ processBrackets()
##### Description:  
Replace patterns like `<reg>Hello [world]</reg>` to `[Group*n]` and save group metadata to parsed.groups .
You don't have to think about reading them. The `<capture>.isBracketGroupStamp()` and `<capture>.toGroupElement()` methods will do it for you.  
```ts
// Will replace parser.input
parser.processBrackets();
```
  
See [BracketsParser](./BracketsParser) for understand how parse own patterns.
```ts
const parser = new CliParser();
parser.brackets.setBracketVariant(IBracketVariant[]);

interface IBracketVariant {
  key: string;
  start: TCompareSequence;
  end: TCompareSequence;
  isRegex?: boolean;
  isSequence?: boolean;
}
```
+++ captureFlags(flags)
##### Description 
Insensitive registry util for capture simple text like `--at=1`, `--at 1` or `-t 1`, (if some alias exists). In this example, `<capture>.toString()` will equal the value `1` because the expectValue parameter.
```ts
.captureFlags([{
	name: "--at",
	capture: ["--at", "-t"],
	expectValue: true
}])
```

##### Params 
```ts
// flags: IFlagCapture[]
interface IFlagCapture {
  name?: string;
  capture: string[];
  expectValue?: boolean;
}
```
+++ captureByMatch(params)
##### Description 
Used for capturing specific patterns from text.  
Syntactic sugar for `text = text.replace(regex, (full) => (match = full))` and more
```ts
.captureByMatch({
    name: "time",
    regex: /\d{2}:\d{2}/
})
	.collect()
	.captures.get("time");
```

##### Params
```ts
interface ITextMatch {
  regex: RegExp;
  name: string;
}
```

+++