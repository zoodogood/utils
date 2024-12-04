# normalize_to_max_coefficient
`function normalize_to_max_coefficient(number[]): number[]`

**Description:**  
Makes fractions integer, preserving the ratio between them as much as possible. However, converts the set to Number.MAX_SAFE_INTEGER.



## Example
```ts
const array = [0.1, 0.2, 0.3];
normalize_to_max_coefficient(array);
expect(normalized).toStrictEqual([
  1501199875790165,
  3002399751580330,
  4503599627370495,
]);
```

### Real example
```diff
const pull = resolve_attack_events_pull(context);
- // float digits is not allowed
- const associatedWeights = pull.map(base => base._weight);
+ const associatedWeights = normalize_to_max_coefficient(
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
    if (!item.repeats) {
      pickContext.busy_preventable.require_insert();
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

