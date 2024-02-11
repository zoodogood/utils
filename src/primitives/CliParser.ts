/* eslint-disable @typescript-eslint/no-namespace */
import { BracketsParser } from "./BracketsParser.js";

interface ITextMatch {
  regex: RegExp;
  name: string;
}

namespace BracketsNamespace {
  export type Context = InstanceType<typeof BracketsParser.ParseContext>;
  export type GroupElement = InstanceType<typeof BracketsManager.GroupElement>;
}
class BracketsManager extends BracketsParser {
  primary: BracketsNamespace.GroupElement[] = [];
  constructor() {
    super();
    this.addBracketVariant(...BracketsParser.defaultBracketVariants);
  }

  parse(): BracketsNamespace.Context {
    throw new Error("Use parseSafe instead");
  }

  parseSafe(text: string): {
    context: BracketsNamespace.Context;
    indexes: number[];
  } {
    const context = super.parse(text);
    const { indexes } = this.useWriteToPrimaryProtocol(context);
    return { indexes, context };
  }

  useWriteToPrimaryProtocol(context: BracketsNamespace.Context) {
    const primary = this.findPrimaryGroups(context);
    const indexes = [...new Array(primary.length)].map(
      (_, index) => this.primary.length + index,
    );
    this.primary.push(...primary);
    return { indexes };
  }

  toStringGroup(index: number) {
    return `[Group*${index}]`;
  }

  findPrimaryGroups(
    context: BracketsNamespace.Context,
  ): BracketsNamespace.GroupElement[] {
    return context.groups.filter((group) => group.depth === 0);
  }

  findBracketStamp(text: string) {
    return text.trim().match(/^\[Group\*(?<index>\d+)\]$/);
  }

  processBracketGroupFromStringStamp(
    raw: string,
  ): BracketsNamespace.GroupElement | null {
    const match = this.findBracketStamp(raw);
    if (!match) {
      return null;
    }

    const { index } = match.groups!;
    return this.primary.at(+index)!;
  }
}

interface IFlagCapture {
  name?: string;
  capture: string[];
  expectValue?: boolean;
}
class FlagsManager {
  unhandledFlags?: Array<RegExpMatchArray>;

  captureResidueFlags(context: CliParserRunContext) {
    let match;
    const { parser } = context;
    while ((match = parser.replaceByMatch(/-{1,2}\w/))) {
      this.unhandledFlags ||= [];
      this.unhandledFlags.push(match);
    }
    return this;
  }

  captureFlags(flags: IFlagCapture[], context: CliParserRunContext) {
    for (const { name, capture, expectValue } of flags) {
      for (const flag of capture) {
        const regex = `(?<=^|\\s)${flag}${
          expectValue ? "(?:(?:\\s+|=)(?<value>[^\\s]+))" : ""
        }`;

        const { parser } = context;
        const captureName = name || flag;

        const match = parser.replaceByMatch(RegExp(regex, "i"));
        if (!match) {
          context.captures.set(`${captureName}`, null);
          continue;
        }

        context.captures.set(
          `${captureName}`,
          new CapturedContent(match).setContextInstance(context),
        );
      }
    }
    return this;
  }
}

type TCaptureValue = string | RegExpMatchArray;
class CapturedContent {
  content: TCaptureValue;
  context?: CliParserRunContext;

  constructor(content: TCaptureValue) {
    this.content = content;
  }

  setContextInstance(context: CapturedContent["context"]) {
    this.context = context;
    return this;
  }

  isRegexMatchArray() {
    return CapturedContent.contentIsRegExpMatchArray(this.content);
  }

  isString() {
    return CapturedContent.contentIsString(this.content);
  }

  isBracketGroupStamp() {
    const { content, context } = this;
    if (!context) {
      throw new Error("context is undefined or null");
    }

    return CapturedContent.contentIsBracketGroupStamp(content, context);
  }

  toGroupElement(): BracketsNamespace.GroupElement | null {
    const { content, context } = this;
    if (!context) {
      throw new Error("context is undefined or null");
    }
    return CapturedContent.contentToGroupElement(content, context);
  }

  toString(addable: { trim?: boolean; smart?: boolean } = {}) {
    return CapturedContent.contentToString(this.content, this.context, addable);
  }

  regexArrayOrStringToString() {
    return CapturedContent.regexArrayOrStringToString(this.content);
  }

  static contentIsRegExpMatchArray(content: TCaptureValue): boolean {
    return (
      content instanceof Array &&
      Object.prototype.hasOwnProperty.call(content, "index") &&
      Object.prototype.hasOwnProperty.call(content, "input")
    );
  }
  static contentIsString(content: TCaptureValue): boolean {
    return typeof content === "string";
  }
  static contentIsBracketGroupStamp(
    content: TCaptureValue,
    context: CliParserRunContext,
  ) {
    const { brackets } = context || {};
    if (!brackets) {
      return null;
    }
    if (!content) {
      return false;
    }
    content = this.regexArrayOrStringToString(content);

    return !!brackets.findBracketStamp(content);
  }
  static contentToGroupElement(
    content: TCaptureValue,
    context: CliParserRunContext,
  ): BracketsNamespace.GroupElement | null {
    content = this.regexArrayOrStringToString(content);
    const { brackets } = context || {};
    return brackets!.processBracketGroupFromStringStamp(content);
  }

  static regexArrayOrStringToString(content: TCaptureValue): string {
    if (this.contentIsString(content)) {
      return content as string;
    }
    return (content as RegExpMatchArray).groups?.value || content[0];
  }

  static contentToString(
    content: TCaptureValue,
    context?: CliParserRunContext,
    { trim = true, smart = true } = {},
  ) {
    let value = ((content: TCaptureValue) => {
      if (!smart) {
        return String(content);
      }
      if (this.contentIsRegExpMatchArray(content)) {
        content = this.regexArrayOrStringToString(content);
      }
      if (context && this.contentIsBracketGroupStamp(content, context)) {
        return this.contentToGroupElement(content, context)?.full || content;
      }
      return content;
    })(content) as string | undefined;
    if (trim) {
      value = value?.trim();
    }

    return value;
  }
}

class CliParserRunContext {
  parser: CliParser;
  input = "";
  captures: Map<string, CapturedContent | null> = new Map();
  brackets = new BracketsManager();
  flags = new FlagsManager();

  constructor(parser: CliParser) {
    this.parser = parser;
  }

  resolveValues<T = unknown>(
    resolver: (captured: CapturedContent | null) => T,
  ) {
    const map = new Map<string, T>();
    const captures = this.captures;
    for (const key of captures.keys()) {
      const value = resolver(captures.get(key)!);
      map.set(key, value);
    }
    return map;
  }
}

export class CliParser {
  context: CliParserRunContext;
  constructor() {
    this.context = new CliParserRunContext(this);
  }
  // replace brackets to [Bracket*n]
  processBrackets() {
    const { context } = this;
    const { context: bracketsContext, indexes } = context.brackets.parseSafe(
      context.input,
    );
    const groups = context.brackets.findPrimaryGroups(bracketsContext);
    let offset = 0;
    for (const index in groups) {
      const group = groups[index];
      const replacement = context.brackets.toStringGroup(indexes[index]);
      const length = group.length;
      this.replaceTextByIndexes(
        group.indexInText! - offset,
        length,
        () => replacement,
      );

      offset += length - replacement.length;
    }
    return this;
  }

  captureFlags(flags: IFlagCapture[]) {
    const { context } = this;
    context.flags.captureFlags(flags, context);
    return this;
  }

  captureResidueFlags() {
    const { context } = this;
    context.flags.captureResidueFlags(context);
    return this;
  }

  setText(text: string) {
    const { context } = this;
    context.input = text;
    return this;
  }

  captureResidue({ name }: { name: string }) {
    const { context } = this;
    const text = context.input;
    this.replaceTextByIndexes(0, text.length, () => "");
    context.captures.set(
      name,
      new CapturedContent(text).setContextInstance(context),
    );
    return this;
  }

  replaceByMatch(regex: RegExp) {
    const { context } = this;
    const matched = context.input.match(regex);
    if (!matched) {
      return null;
    }

    const [indexInText, full] = [matched.index, matched[0]];

    if (indexInText === undefined) {
      throw new Error("Match without index");
    }
    this.replaceTextByIndexes(indexInText, full.length, () => "");
    return matched;
  }

  captureByMatch({ regex, name }: ITextMatch) {
    const { context } = this;
    const matched = this.replaceByMatch(regex);
    context.captures.set(
      name,
      matched ? new CapturedContent(matched).setContextInstance(context) : null,
    );
    return this;
  }

  replaceTextByIndexes(
    start: number,
    length: number,
    replacer: (string: string) => string,
  ) {
    const { context } = this;
    const before = context.input.slice(0, start);
    const after = context.input.slice(start + length);
    const replaced = replacer(context.input.slice(start, start + length));
    context.input = `${before}${replaced}${after}`;
  }

  collect() {
    return this.context;
  }

  static CliParserRunContext = CliParserRunContext;
  static CapturedContent = CapturedContent;
  static BracketsManager = BracketsManager;
  static FlagsManager = FlagsManager;
}
