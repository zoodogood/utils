# normalize_to_integer
`function normalize_to_integer(number[]): number[]`

**Description:**  
Makes fractions integer, preserving the ratio between them as much as possible. However, converts the set to Number.MAX_SAFE_INTEGER.



## Example
```ts
const array = [1, 1 / 3];
const normalized = normalize_to_integer(array);

expect(normalized).toStrictEqual([
    10_000_000_000_000_000,
    3_333_333_333_333_333
]);
```

### Real example
```diff
const pull = resolve_attack_events_pull(context);
- // float digits is not allowed
- const associatedWeights = pull.map(base => base._weight);
+ const associatedWeights = normalize_to_integer(
+   pull.map((base) => base._weight),
+ );

const randomizer = RandomizerContext.from({ array: pull, associatedWeights });
for (let i = 0; i < attackContext.eventsCount; i++) {
  const base = randomizer.pickRandom((pickContext) => {
    const { item } = pickContext;
    item.beforeCheck(item, pickContext);
    const passed = item.filter(item, pickContext);
    if (!passed) {
      return false;
    }
    if (item.repeats) {
      pickContext.busy_preventable.preventDefault();
    }
    return true;
  });
  if (!base) {
    break;
  }
  attack_event_callback(base, context);
  attackContext.listOfEvents.push(base);
}
```

