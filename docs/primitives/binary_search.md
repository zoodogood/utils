# binary_search
`function binary_search(number, (number) => <0 | 0 | >0): number`

**Description:**  
Helps you find a number that satisfies the search. 



## Example
```ts
// Check index biggest than target? Minify index in next step...
const target = 3;
const index = binary_search(20, (index) => index - target);
expect(index).toBe(target);
```

### Real example
```diff
- this.busy_areas.findLastIndex((area) => end > area[1]) + 1;

+ binary_search(this.busy_areas.length - 1, (index: number) => {
+	 const value = this.busy_areas[index]?.[1];
+	 const biggest = end < value;
+	 if (biggest) {
+	 	return 1;
+	 }
+	 return (
+	 	+(
+	 		(this.busy_areas[index + 1]?.[1] ?? Number.MAX_SAFE_INTEGER) > end
+	 	) - 1
+	 );
+ }) + 1;
```

