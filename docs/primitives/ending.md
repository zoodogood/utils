# ending
function ending(...params): string  

**Description:**  
Sets the suffix depending on the numerator.

### `params`
```ts
params = [
    quantity: number = 0,
    base: string, // word root
    multiple: string, // for 5–9 and 0
    alone: string, // for 1
    double: string, // for 2, 3 and 4
    options?: options = {}
]
```

### `options`
```ts
interface options = {
    unite?: (quantity, word) => string // Determines how the final row will look like
};
```

## Example
```js
const quantity = getRandomValue(0, 1000);
const word = {
    full: "Банан",
    base: "Банан",
    suffixes: ["ов", "", "а"]
}

const output = ending(quantity, word.base, ...word.suffixes);
output // "Бананов", "Банан" or "Банана"
```

### Real example
```js
return `У вас ${ ending(quantity, "клубник", "", "а", "и") }`;
```