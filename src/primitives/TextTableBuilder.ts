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

function getRowType(row: TTableRow): SpecialRowTypeEnum {
  if ("type" in row === false) {
    return SpecialRowTypeEnum.Default;
  }
  return (row as Exclude<TTableRow, ITableCell[]>).type;
}

function isCell(target: any) {
  return "value" in target && "options" in target;
}

function addPaddingByCellAlign(
  original: string,
  totalForAdd: number,
  align: CellAlignEnum
) {
  const addidableGapLeft =
    align === CellAlignEnum.Right
      ? totalForAdd
      : align === CellAlignEnum.Center
      ? Math.floor(totalForAdd / 2)
      : 0;

  const addidableGapRight =
    align === CellAlignEnum.Left
      ? totalForAdd
      : align === CellAlignEnum.Center
      ? Math.ceil(totalForAdd / 2)
      : 0;

  return `${" ".repeat(addidableGapLeft)}${original}${" ".repeat(
    addidableGapRight
  )}`;
}

function changeContentSetCellMinWidth(cell: ITableCell, minWidth: number) {
  const currentMin = calculateCellMinWidth(cell);
  if (minWidth <= currentMin) {
    return cell;
  }

  const {
    value,
    options: { align },
  } = cell;
  const lack = minWidth - currentMin;
  cell.value = addPaddingByCellAlign(value, lack, align);
  return cell;
}

function changeContentSetCellMaxWidth(cell: ITableCell, maxWidth: number) {
  const current = calculateCellMinWidth(cell);
  if (maxWidth >= current) {
    return cell;
  }

  let overage = current - maxWidth;

  const gapDirection =
    cell.options.align === CellAlignEnum.Left ? "gapRight" : "gapLeft";
  if (cell.options[gapDirection] > 1) {
    cell.options[gapDirection]--;
    overage--;
    if (overage === 0) {
      return;
    }
  }

  const suffix = "..";
  const sliced = cell.value.slice(0, -(overage + suffix.length));
  cell.value = sliced + suffix;
  return cell;
}

function calculateCellMinWidth(cell: ITableCell) {
  const { gapLeft, gapRight } = cell.options;
  return cell.value.length + gapLeft + gapRight;
}

class TextTableGenerator {
  private data: TTableRow[] = [];
  private options: ITableOptions;
  private context: ITextTableGeneratorContext = {
    content: "",
    metadata: {},
    currentRow: 0,
  };

  constructor(rows: TextTableGenerator["data"], options: ITableOptions) {
    this.data = rows;
    this.options = options;

    this.parseMetadata();
  }

  generateTextContent() {
    const context = this.context;

    if (this.options.borderTop !== null) {
      context.content += this.drawBlockBorder(BorderDirectionEnum.BorderTop);
      context.content += "\n";
    }

    for (const row of this.data) {
      context.currentRow = this.data.indexOf(row);
      context.content += this.drawRow(row);
      context.content += "\n";
    }

    if (this.options.borderBottom !== null) {
      context.content += this.drawBlockBorder(BorderDirectionEnum.BorderBottom);
    }

    return context.content;
  }

  getColumns() {
    const columns = [];
    const rows = this.data;
    const largestCellsCount = Math.max(
      ...rows
        .filter((row) => getRowType(row) === SpecialRowTypeEnum.Default)
        .map((row) => (row as ITableCell[]).length)
    );

    for (let index = 0; index < largestCellsCount; index++) {
      const column = rows.map((row) =>
        getRowType(row) === SpecialRowTypeEnum.Default
          ? (row as ITableCell[]).at(index)
          : { row }
      );

      columns.push(column);
    }

    return columns;
  }

  parseMetadata() {
    const metadata = this.context.metadata;

    const columns = this.getColumns();
    const columnsMetadata = columns.map((column) => ({
      largestLength: Math.max(
        ...column.map((element) =>
          isCell(element) ? calculateCellMinWidth(element as ITableCell) : 0
        )
      ),
    }));

    metadata.columns = columnsMetadata;

    metadata.tableWidth = this.calculateTableWidth();

    metadata.separatorsIndexesInRow = (() => {
      const indexes: number[] = [];
      let current = 0;
      if (!!this.options.borderLeft) {
        indexes.push(current);
      }
      for (const { largestLength } of columnsMetadata) {
        current += largestLength + 1;
        indexes.push(current);
      }

      if (!this.options.borderRight) {
        indexes.pop();
      }

      return indexes;
    })();
  }

  drawRow(row: TTableRow) {
    let content = "";
    const context = this.context;
    const metadata = context.metadata;

    if (getRowType(row) === SpecialRowTypeEnum.Default) {
      row = row as ITableCell[];
      content += this.options.borderLeft?.(context, context.currentRow) ?? "";

      for (const cellIndex of Object.keys(row)) {
        const cell = row.at(+cellIndex)!;

        const expectedWidth = metadata.columns!.at(+cellIndex)!.largestLength;
        content += this.drawCell(cell, expectedWidth);

        if (+cellIndex !== row.length - 1) {
          content += !cell.options.removeNextSeparator
            ? this.options.separator
            : " ";
        }
      }

      content += this.options.borderRight?.(context, context.currentRow) ?? "";
      return content;
    }

    if (getRowType(row) === SpecialRowTypeEnum.Display) {
      row = row as ITableSpecialDisplayRow;
      content += this.drawLine(row.display);
    }

    return content;
  }

  drawCell(cell: ITableCell, expectedWidth: number) {
    const { gapLeft, gapRight, align } = cell.options;
    const { value } = cell;

    const minContentLength = calculateCellMinWidth(cell);
    const lack = expectedWidth - minContentLength;

    const contentWithPadding = addPaddingByCellAlign(value, lack, align);

    return `${" ".repeat(gapLeft)}${contentWithPadding}${" ".repeat(gapRight)}`;
  }

  drawLine(setSymbol: TCellSetSymbolCallback) {
    let content = "";
    const context = this.context;
    const length = this.calculateTableWidth();

    for (const index of [...new Array(length)].map((_, index) => index)) {
      const symbol = setSymbol!(context, +index);
      content += symbol;
    }

    return content;
  }

  drawBlockBorder(
    borderDirection: Exclude<
      BorderDirectionEnum,
      BorderDirectionEnum.BorderLeft | BorderDirectionEnum.BorderRight
    >
  ) {
    const callback =
      borderDirection === BorderDirectionEnum.BorderTop
        ? this.options.borderTop
        : this.options.borderBottom;

    return this.drawLine(callback!);
  }

  calculateTableWidth() {
    const { columns } = this.context.metadata;
    if (!columns) {
      throw new Error(
        "No columns field; Tip: Use <this>.parseMetadata() previous"
      );
    }

    const cells = columns.reduce(
      (acc, current) => current.largestLength + acc,
      0
    );
    const separators = columns.length - 1;
    const borders = +!!this.options.borderLeft + +!!this.options.borderRight;
    return cells + separators + borders;
  }
}

enum CellAlignEnum {
  Left,
  Right,
  Center,
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

const DEFAULT_CELL_OPTIONS: ICellOptions = {
  gapLeft: 2,
  gapRight: 2,
  align: CellAlignEnum.Left,
};

type TCellSetSymbolCallback = (
  context: ITextTableGeneratorContext,
  index: number
) => string;

interface ICellBuilderOptions {
  minWidth?: number;
  maxWidth?: number;
}

interface ITableOptions {
  borderLeft: null | TCellSetSymbolCallback;
  borderRight: null | TCellSetSymbolCallback;
  borderTop: null | TCellSetSymbolCallback;
  borderBottom: null | TCellSetSymbolCallback;
  separator: string;
}

enum BorderDirectionEnum {
  BorderLeft,
  BorderRight,
  BorderTop,
  BorderBottom,
}

const DEFAULT_TABLE_OPTIONS = {
  borderLeft: null,
  borderRight: null,
  borderTop: null,
  borderBottom: null,
  separator: "|",
};

enum SpecialRowTypeEnum {
  Default,
  Display,
}

interface ITableSpecialDisplayRow {
  type: SpecialRowTypeEnum.Display;
  display: TCellSetSymbolCallback;
}

type TTableRow = ITableCell[] | ITableSpecialDisplayRow;

class TextTableBuilder {
  public rows: TTableRow[] = [];

  protected options: ITableOptions = {...DEFAULT_TABLE_OPTIONS};

  setBorderOptions(
    callback: TCellSetSymbolCallback = () => "|",
    directions: BorderDirectionEnum[] = [
      BorderDirectionEnum.BorderLeft,
      BorderDirectionEnum.BorderRight,
    ]
  ) {
    
    for (const direction of directions) {
      switch (direction) {
        case BorderDirectionEnum.BorderLeft:
          this.options.borderLeft = callback;
          break;
        case BorderDirectionEnum.BorderRight:
          this.options.borderRight = callback;
          break;
        case BorderDirectionEnum.BorderTop:
          this.options.borderTop = callback;
          break;
        case BorderDirectionEnum.BorderBottom:
          this.options.borderBottom = callback;
          break;
      }
    }

    return this;
  }

  addRowWithElements(
    elements: ITableCell["value"][],
    optionsForEveryElement?: Partial<ICellOptions>,
    useOnAddingOptions?: ICellBuilderOptions
  ) {
    const row: ITableCell[] = [];
    for (const value of elements) {
      this.pushCellToArray(
        row,
        value,
        optionsForEveryElement,
        useOnAddingOptions
      );
    }

    this.pushRowToTable(row);
    return this;
  }

  addMultilineRowWithElements(
    elements: ITableCell["value"][],
    optionsForEveryElement?: Partial<ICellOptions>,
    useOnAddingOptions?: ICellBuilderOptions
  ) {
    const separatedElements: string[][] = elements.map((value) =>
      value.split("\n")
    );
    const largestHeight = Math.max(
      ...separatedElements.map((sub) => sub.length)
    );
    for (let index = 0; index < largestHeight; index++) {
      this.addRowWithElements(
        separatedElements.map((sub) => sub.at(index) ?? ""),
        optionsForEveryElement,
        useOnAddingOptions
      );
    }
    return this;
  }

  addEmptyRow() {
    this.pushRowToTable([]);
    return this;
  }

  addRowSeparator(setSymbol: TCellSetSymbolCallback = () => "-") {
    const row = {
      display: setSymbol,
      type: SpecialRowTypeEnum.Display,
    } as ITableSpecialDisplayRow;
    this.pushRowToTable(row);
    return this;
  }

  addCellAtRow(
    rowIndex: number,
    cellValue: ITableCell["value"],
    cellOptions: ICellOptions
  ) {
    const row = this.rows.at(rowIndex);
    if (!row) {
      throw new RangeError("");
    }

    if (getRowType(row) !== SpecialRowTypeEnum.Default) {
      throw new Error("Is not default row: without cells");
    }

    this.pushCellToArray<ITableCell>(
      row as ITableCell[],
      cellValue,
      cellOptions
    );
    return this;
  }

  private pushCellToArray<T = ITableCell>(
    array: (T | ITableCell)[],
    cellValue: ITableCell["value"],
    cellOptions: Partial<ICellOptions> = {},
    pushOptions?: ICellBuilderOptions
  ) {
    const options = Object.assign({}, DEFAULT_CELL_OPTIONS, cellOptions);
    const cell = { value: cellValue, options };

    const { minWidth, maxWidth } = pushOptions ?? {};

    minWidth && changeContentSetCellMinWidth(cell, minWidth);
    maxWidth && changeContentSetCellMaxWidth(cell, maxWidth);

    array.push(cell);
    return this;
  }

  private pushRowToTable(row: TTableRow) {
    this.rows.push(row);
    return this;
  }

  generateTextContent() {
    return new TextTableGenerator(
      this.rows,
      this.options
    ).generateTextContent();
  }
}

export { TextTableBuilder };
export { SpecialRowTypeEnum, CellAlignEnum, BorderDirectionEnum };
export type {
  ICellOptions,
  IContextMetadata,
  ITableCell,
  ITableOptions,
  ITextTableGeneratorContext,
  TTableRow,
};
