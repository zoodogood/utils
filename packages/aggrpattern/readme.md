## Don't use it

aggrpattern api is currently bad. Maybe use just scripts for aggregation and transformations?

Explicit staticfull files allow you to get the best of both worlds:
- TypeScript has it easy with generated files 💪
- You see these files and you are pleased to know that they are participating in the flow 🌊
- Use it to have high cohesion instead of magic values in codebase 🐱‍👤

## Usage example
> agregator.q.ts ↴
```ts title="agregator.q.ts"
// Aggregates and transforms rest declarations for hono
defineAggregator({
	// 1. Design declarations
	pattern: '**/rest.q.ts',
	// 2. Just reader
	readMatched: (path) =>
		import(path)
			.then((x) => {
				// validate if needed 🛡️
				if (x.default instanceof MyType === false) {
					throw new TypeError(
						`Received ${x.default}, but expected MyType: https://${repo}/blob/${pathToDocs}`,
					)
				}
				return x.default
			})
			.catch((error) => {
				throw new Error(`Error caused when aggregator read ${path}`, {
					cause: error,
				})
			}),
	// 3. Design out format
	script: (ctx) => {
		/////////////////////////////////////////////////////////////////////
		//
		/* you're logic 🤖 */

		//
		/////////////////////////////////////////////////////////////////////
		return { 
			outfiles: { 
				'./routes.ts': importsData /* for example from you're logic */
			},
		}
	},
	// 4. Just configuration
	executionPayload: {
		agregation: { fs, baseUrl },
		flushOutfiles: {
			dir: join(import.meta.dirname, '_out'),
			fs,
			clean: true
		},
	},
})
```

## Quiz for you
```quiz
? The ".q." means qualified?
x[That's right! Qualified names are names that rely on conventions] Yes
-[Qualified names are names that rely on conventions] No

? Do qualified names is required?
-[No, you free don't use qualified names, but that recommended] Yes
x[…but recommended] No

? What is "hono"?
x[You don't necessarily need to know what this is to use aggregates. Hono is here for example] Popular (in Javascript ecosystem) web server framework
-[You don't necessarily need to know what this is to use aggregates. Hono is here for example] Someting else
```
