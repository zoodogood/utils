# getRandomElementFromArray
`function getRandomElementFromArray(array: TArray, {filter?, associatedWeights?}: IParams)<T>: T;`

**Description:**  
Returns a random element of the array with the ability to determine the probability of each element relative to the others

```ts
type TArray = T[];
interface IParams {
   filter: (item: T) => boolean;
   associatedWeights: number[]; // There must be a weight for each element of the array
}
```




## Example
```ts
const array = [artifact1, artifact2];
const associatedWeights = [30_000, Number.MAX_SAFE_INTEGER];

const artifact = getRandomElementFromArray(array, {associatedWeights});
artifact // Is always artifact2
array // [artifact1] — artifact2 is sliced
```


### Real example
***There are many events happening and we need to generate them according to the instantly changing context, with different probabilities for each one.***  
The confusing "event" has been replaced by "artifact".

```ts
interface IArtifactItem<M = {}> {
    id: ArtifactEnum;
    metadata?: IArtifactMetadata<M>;
}

interface IArtifactMetadata<M> {
    weight: number;
    canRepeat: boolean;
    ...M
}


const pull = [...ArtifactItemsCollection.values()]
    .map(item => ArtifactsCollection.get(item.id).fillItemWithMetadata(item, context))
    .filter(({id}) => ArtifactsCollection.get(id).isAvailableIn(item, context));

context.setPullData(pull, associatedWeights);

const associatedWeights = pull.map(item => item.metadata.weights);
for (let i = 0; i < context.userReceiveArtifactCount; i++){
    // Use typescript generic* for metadata
    const item = Util.getRandomElementFromArray<IArtifactItem>(pull, {associatedWeights});
    if (!item){
      continue;
    }

    if (!item.metadata.canRepeat){
        const index = pull.indexOf(event);
        if (~index){
            pull.splice(index, 1);
            associatedWeights.splice(index, 1);
        } 
    }

    const artifact = ArtifactsCollection.get(item.id);

    try {
        artifact.onReceived(item, context);
    }
    catch(error){
        ErrorHandler.write(error, {source: Errors.UserArtifactReceive, data: {itemId: item.id}});
    }


    context.user.artifacts.push(item);
}



```

## getRandomElementIndexInWeights
`function getRandomElementIndexInWeights(weights: TWeights): number[]`;

Params:
```ts
type TWeights = NonNullable<IParams["associatedWeights]>
```

**Description:**  
Returns the numeric index of the random element. The probability depends directly on the value of the element.

### Example
```ts
const tickets = [1, 5, 15, 50];
const index = getRandomElementIndexInWeights(tickets);

// index === 0: P = 1  / 71
// index === 1: P = 5  / 71
// index === 2: P = 15 / 71
// index === 3: P = 50 / 71
```

#### Real example
```ts
// from getRandomElementFromArray source
const index = associatedWeights
    ? getRandomElementIndexInWeights(associatedWeights)
    : getRandomNumberInRange({ max: array.length });
```