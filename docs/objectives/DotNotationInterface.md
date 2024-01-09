# DotNotatedInterface
> [!Warning]
> Unstable

+++ Easy example
```js
const target = {a: {b: {c: {d: {e: {f: 15}}}}}};
const increment = (currentValue) => currentValue + 1;
new DotNotatedInterface(target).setItem("a.b.c.d.e.f", increment); // 16
```
+++ Real example
```js
const audit = {};
const auditInterface = new Util.DotNotatedInterface(audit);

auditInterface.setItem("actions", curse.values.counter);

for (const entry of curse.values.audit) {
	const { value, source, executor, resource } = entry;
	const box = auditInterface.setItem(
		`resources.${source}`,
		(prev) => prev || [],
	);

	const exists = box.find(
		(splited) =>
		splited.executor.id === executor.id &&
		Math.sign(splited.value) === Math.sign(value) &&
		splited.resource === resource,
	);
	if (exists) {
		exists.value += value;
	} else {
		box.push({
			resource,
			executor,
			value,
		});
	}
	box.sortBy("resource");
}
const document = new Util.yaml.Document(audit);
```
+++

+++ Constructor
```ts
new DotNotatedInterface(target);
```

+++ Methods
## Methods
### `getItem<T>(key: string, options: IMethodsOptions = {}): T | null`
Resolve key (path) in target; Return item or default value

### `setItem<T>(key: string, value: any | CallableFunction, options: IMethodsOptions = {}): T()`
Resolve key; Set or update item value

### `hasItem(key: string, options: IMethodsOptions = {}): boolean`
Resolve key; Check item;

### `removeItem(key: string, options: IMethodsOptions = {}): boolean`
Resolve key; Remove item

### `getParentAndlastSegmentByNotatedKey(key: string, { needFillIfParentNotExists = false }): { parent: object | null; lastSegment: string }`
Resolve key to segments, returns target partial with last segment key


+++ Interfaces
## Interfaces
```ts
interface IMethodsOptions {
  defaultValue?: any; // for get value
  allowSetFunctions?: boolean; // for set value: if true just set function,
}
```
+++

