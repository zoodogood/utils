# TextTableBuilder
class TextTableBuilder \{}

**Description:**  
\- Generate a table row by row




## Example
+++ Easy example
```js
const builder = new TextTableBuilder()
  .addRowWithElements(["1", "212", "3"], { align: CellAlignEnum.Left })
  .addRowWithElements(["1", "2", "3"], { align: CellAlignEnum.Right })
  .addRowSeparator()
  .addRowWithElements(["777", "555", "1999"], { align: CellAlignEnum.Center })



builder.generateTextContent();
/** Result: 
  1    |  212  |  3     
    1  |    2  |     3  
------------------------
  777  |  555  |  1999  
**/
```
+++ Big example
```ts
const builder = new TextTableBuilder()
    .setBorderOptions(
      ({ metadata }, index) =>
        metadata.separatorsIndexesInRow!.includes(index) ? "+" : "-",
      [BorderDirectionEnum.BorderTop]
    )
    .setBorderOptions(
      (_, index) => index + "",
      [BorderDirectionEnum.BorderLeft, BorderDirectionEnum.BorderRight]
    )
    .addRowWithElements(["1.", "2/", "3/"], {
      align: CellAlignEnum.Left,
      gapLeft: 0,
    })
    .addRowSeparator(({ metadata }, index) =>
      index === 0 || index === metadata.tableWidth! - 1 ? "+" : " "
    )
    .addMultilineRowWithElements(["1", "Пирожки\nс\nмясом", "3"], {
      align: CellAlignEnum.Center,
      removeNextSeparator: true,
    })
    .addRowWithElements(["1", "2", "3"], { align: CellAlignEnum.Right })
    .addRowSeparator(({ metadata }, index) =>
      metadata.separatorsIndexesInRow!.includes(index) ? "+" : "-"
    )
    .addRowWithElements(["777", "555", "1999"], { align: CellAlignEnum.Center })
    .addRowSeparator(({ metadata }, index) =>
      metadata.separatorsIndexesInRow!.includes(index) ? "^" : "-"
    );
    
/** Result:
+-------+-----------+--------+
01.     |2/         |3/      0
+                            +
2   1      Пирожки      3    2
3             с              3
4           мясом            4
5    1  |        2  |     3  5
+-------+-----------+--------+
7  777  |    555    |  1999  7
^-------^-----------^--------^
**/
```

+++ Real example
```js
const builder = new TextTableBuilder()
    .setBorderOptions()
    .addEmptyRow()
    .addCellAtRow(-1, "Слот 1.", {align: CellAlignEnum.Right, removeNextSeparator: true})
    .addCellAtRow(-1, "Слот 2.", {align: CellAlignEnum.Left});

while (list.length)
builder.addRowWithElements([list.shift(), list.shift() ?? ""]);

builder.generateTextContent();


```
+++

+++ Methods
## Methods
### `setBorderOptions()`
Sets the function to place each border symbol for the specified directions.

```ts
type callbackForEverySymbol = (
  context: ITextTableGeneratorContext,
  index: number
) => string;
type includeBorderDirections = BorderDirectionEnum[];

<TextTablesBuilder>.setBorderOptions(callbackForEverySymbol?, includeBorderDirections?): ThisType
```

### `addRowSeparator()`
Adds a line, uses a function to draw each character.
```ts
type callbackForEverySymbol = (
  context: ITextTableGeneratorContext,
  index: number
) => string;

<TextTablesBuilder>.addRowSeparator(callbackForEverySymbol: TCellSetSymbolCallback): ThisType
```

### `addRowWithElements()`
Places a row containing the listed values in the table.
```ts
type elements = ITableCell["value"][];
type optionsForEveryElement = Partial<ICellOptions>;

<TextTablesBuilder>.addRowWithElements(elements, optionsForEveryElement): ThisType
```

### `generateTextContent()`
Uses the TextTableGenerator and returns a text representation of the table.
```ts
<TextTablesBuilder>.generateTextContent(): string
```

***

### `addMultilineRowWithElements()`
Adds lines based on content that supports the `\n` character.
```ts
type elements = ITableCell["value"][];
type optionsForEveryElement = Partial<ICellOptions>;

<TextTablesBuilder>.addMultilineRowWithElements(elements, optionsForEveryElement): ThisType
```
+++ Interfaces
## Interfaces
```ts
interface ITextTableGeneratorContext {
  content: string;
  metadata: IContextMetadata;
  currentRow: number;
}

interface IContextMetadata {
  columns?: { largestLength: number }[];
  tableWidth?: number;
  separatorsIndexesInRow?: number[];
}

interface ICellOptions {
  gapLeft: number;
  gapRight: number;
  align: CellAlignEnum;
  removeNextSeparator?: boolean;
}

interface ITableCell {
  value: string;
  options: ICellOptions;
}

interface ITableOptions {
  borderLeft: null | TCellSetSymbolCallback;
  borderRight: null | TCellSetSymbolCallback;
  borderTop: null | TCellSetSymbolCallback;
  borderBottom: null | TCellSetSymbolCallback;
  separator: string;
}
```
+++ Enums
```ts
enum CellAlignEnum {
  Left,
  Right,
  Center,
}

enum BorderDirectionEnum {
  BorderLeft,
  BorderRight,
  BorderTop,
  BorderBottom,
}

enum SpecialRowTypeEnum {
  Default,
  Display,
}
```
+++

