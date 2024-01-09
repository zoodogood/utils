interface IMethodsOptions {
  defaultValue?: any; // for get value
  allowSetFunctions?: boolean; // for set value: if true just set function,
}

export class DotNotatedInterface {
  declare target: Record<string, unknown>;

  constructor(target: DotNotatedInterface["target"]) {
    this.target = target;
  }

  getItem<T>(key: string, options: IMethodsOptions = {}): T | null {
    const { parent, lastSegment } = this.getParentAndlastSegmentByNotatedKey(
      key,
      { needFillIfParentNotExists: false },
    );

    if (!parent || lastSegment in parent === false) {
      return options.defaultValue ?? null;
    }

    // @ts-ignore
    return parent[lastSegment] as T;
  }

  setItem<T>(
    key: string,
    value: CallableFunction,
    options?: IMethodsOptions,
  ): T;
  setItem<T>(key: string, value: any, options: IMethodsOptions = {}): T {
    if (typeof value === "function" && !options.allowSetFunctions) {
      value = value(this.getItem(key, options));
    }

    const { parent, lastSegment } = this.getParentAndlastSegmentByNotatedKey(
      key,
      { needFillIfParentNotExists: true },
    );

    // @ts-ignore
    return (parent[lastSegment] = value);
  }

  hasItem(key: string, options: IMethodsOptions = {}): boolean {
    const { parent, lastSegment } = this.getParentAndlastSegmentByNotatedKey(
      key,
      { needFillIfParentNotExists: false },
    );

    if (parent === null) {
      return false;
    }
    return lastSegment in parent;
  }

  removeItem(key: string, options: IMethodsOptions = {}): boolean {
    const { parent, lastSegment } = this.getParentAndlastSegmentByNotatedKey(
      key,
      { needFillIfParentNotExists: false },
    );

    if (!parent) {
      return false;
    }

    // @ts-ignore
    return delete parent[lastSegment];
  }

  getParentAndlastSegmentByNotatedKey(
    key: string,
    { needFillIfParentNotExists = false },
  ): { parent: object | null; lastSegment: string } {
    const pathSegments = key.split(".");
    if (!pathSegments.length) {
      throw new Error("Empty path to property");
    }

    let parent = this.target;

    for (let segment of pathSegments.slice(0, -1)) {
      needFillIfParentNotExists &&
        (segment = this.fillIsNotExists({ parent, segment }));

      if (parent[segment] === undefined) {
        return { parent: null, lastSegment: segment };
      }

      parent = parent[
        segment as keyof DotNotatedInterface["target"]
      ] as DotNotatedInterface["target"];
    }

    return { parent, lastSegment: pathSegments.at(-1)! };
  }

  fillIsNotExists({
    parent,
    segment,
  }: {
    parent: {};
    segment: string;
  }): string {
    if (segment in parent === false) {
      // @ts-ignore
      parent[segment] = {};
    }

    return segment;
  }
}
