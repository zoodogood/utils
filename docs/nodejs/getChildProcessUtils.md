# getChildProcessUtils
function omit(...params): output as {run: TRun, info: TInfo, _npm: "npm" | "npm.cmd"}

**Description:**  
Collect utilities for solve tiny problems and spawn child processes

### `params`
```ts
interface IParams {
	root: string;
	logger?: boolean;
}
```

### `run, info, _npm`
```ts
type TRun = (command: string, params: string[]) => IContext;
type TInfo = (log: string) => void;

interface IContext {
	exitter: { resolve: any; reject: any };
	whenEnd: Promise<unknown>;
	child: ChildProcessWithoutNullStreams;
	emitter: EventsEmitter;
	outString: string;
}
```


## Example
```js
const { run, info, _npm } = getChildProcessUtils({ root: process.cwd(), logger: true });
info("Start"); // just styled log into console

run(_npm, ["run", "script:build"]);

```

### Real example
```js
const { run } = getChildProcessUtils({ root: process.cwd() });
await run("mv", ["build/main.css", "build/styles.css"]).whenEnd;
await run("cp", ["manifest.json", "build/manifest.json"]).whenEnd;
```


### Second example
```js
const {run, info, _npm} = get({root, logger: true});
const node = "node";

info("Node version:");
await run(node, ["-v"]).whenEnd;

info("Install modules:");
await run(_npm, ["install"]).whenEnd;

info("Check files:");
await run(node, ["./folder/scripts/checkFiles.js"]).whenEnd;

info("Build bundle:");
await run(_npm, ["run", "site-build"]).whenEnd;

await info("Success");
```
