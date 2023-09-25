# rangeToArray
function rangeToArray([number, number]): number[];

**Description:**  
Returns an array including all intermediate and extreme numbers




## Example
```js
rangeToArray([1, 1]) // [1]
rangeToArray([1, 3]) // [1, 2, 3]
rangeToArray([1, 0]) // Error
rangeToArray([1, "x"]) // NaN

for (const num of rangeToArray([0, 100])){
    console.info(num);
}

```

### Real example
```js
getEventsInRange(range){
    const days = Util.rangeToArray(range);
    const events = [];
    for (const day of days) {
        const todayEvents = this.at(day);
        todayEvents && events.push(...todayEvents);
    }

    return events;
}
```

