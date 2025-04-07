# randomNumberInRange
function getRandomNumberInRange({min?, max, needRound?}: IParams): number;

**Description:**  
Returns the value between min and max (inclusive)

```ts
interface IParams {
    min: number = 0;
    max: number;
    needRound?: boolean;
}
```




## Example
```js
getRandomNumberInRange({max: 1}); // x = 0 | 1
getRandomNumberInRange({max: 1, needRound: true}); // x є (0...1)
getRandomNumberInRange({min: 3, max: 10}); // x = 3 | 4 ... 10

getRandomNumberInRange({
    min: 3,
    max: 7,
    needRound: true
}); // x є (3...7)

if (getRandomNumberInRange({max: 2}) === 0){
    // Will occur with a probability of P = 1 / 3
}
```


