# omit
function omit(...params): output as object  

**Description:**  
Creates copy of object without elements, that didn't pass a filter.

### `params`
```ts
params = [
    object: {[key]: any},
    filter: (key: string, value: any, i: number) => true | false | any
]
```


## Example
```js
const object = {
    _privatedKey: "some value",
    coins: undefined,
    level: 2
};
const isPrivate = (key) => key.startsWith("_");
const isExits = (value) => value !== undefined && value !== null;

const filter = (key, value) => !isPrivate(key) && isExits(value);

const output = omit(object, filter);
// {level: 2};
```

### Real example
```js
const userData = client.users.cache.get(userId);
const available = ["coins", "berry"];
return Util.omit(userData, (key) => available.includes(key));
```

