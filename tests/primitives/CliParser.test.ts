import { expect, test } from "vitest";
import { BracketsParser } from "../../src/primitives/BracketsParser.js";
import { CliParser } from "../../src/primitives/CliParser.js";

test("Slice command, parse groups and flags", () => {
  const result = new CliParser()
    .setText("pay 200 --resourcegroup (coins {he-he}) Hello, World!")
    .processBrackets()
    .captureByMatch({ name: "command", regex: /^[a-zа-яёъ]+/i })
    .captureFlags([
      {
        capture: ["--help"],
      },
      {
        capture: ["--resourceGroup"],
        expectValue: true,
      },
    ])
    .captureByMatch({ regex: /\d+/, name: "value" })
    .captureResidue({ name: "message" })
    .collect();

  const resolver = (
    capture: InstanceType<typeof CliParser.CapturedContent> | null,
  ) =>
    (capture &&
      (capture.isBracketGroupStamp()
        ? capture.toGroupElement()
        : capture.toString())) ||
    null;

  const values = result.resolveValues(resolver);

  const group = values.get("--resourceGroup");

  expect(values.get("--help")).equal(null);
  expect(values.get("command")).equal("pay");
  expect(values.get("--resourceGroup")!.full).equal("(coins {he-he})");

  if (group instanceof BracketsParser.GroupElement) {
    expect(group.content).equal("coins {he-he}");
    expect(group.subgroups.length).toBe(1);
  }
});

test("Only flag", () => {
  const parser = new CliParser();
  const result = parser
    .setText("--help")
    .processBrackets()
    .captureFlags([
      {
        name: "--help",
        capture: ["-h", "--help"],
      },
      {
        name: "--list",
        capture: ["-l", "--list"],
      },
      {
        name: "--at",
        capture: ["--at"],
        expectValue: true,
      },
    ])
    .collect();
  const values = result.resolveValues((capture) => capture?.toString());
  expect(values.get("--help")).equal("--help");
});

test("Fix residue", () => {
  const result = new CliParser()
    .setText("Hello, World! (Mamma-mia)")
    .processBrackets()
    .captureResidue({ name: "phrase" })
    .collect();

  const capture = result.captures.get("phrase")!;
  capture.content = result.brackets.replaceBracketsStamps(
    capture.content as string,
    (group) => String(group.full),
  );

  expect(capture.toString()).equal("Hello, World! (Mamma-mia)");
});

test("New residue flag semantic behavior", () => {
  const texts = {
    oops: "--unknown Hello, World",
    stop_hyphen: "--unknown - Hello, World",
    use_group: "--unknown 'Hello, World'",
    perfect: "--unknown - 'Hello, World'",
  };
  const results = Object.fromEntries(
    Object.entries(texts).map(([name, text]) => {
      const result = new CliParser()
        .setText(text)
        .processBrackets()
        .captureResidueFlags()
        .captureResidue({ name: "rest" })
        .collect();
      const { captures, flags } = result;
      return [
        name,
        {
          captures: captures
            .values()
            .map((capture) => capture?.toString())
            .toArray(),
          flags: flags.unhandledFlags?.map((match) => match[0]) || [],
        },
      ];
    }),
  );

  expect(results).toStrictEqual({
    oops: { captures: ["World"], flags: ["--unknown Hello,"] },
    stop_hyphen: { captures: ["Hello, World"], flags: ["--unknown"] },
    use_group: { captures: [""], flags: ["--unknown [Group*0]"] },
    perfect: { captures: ["Hello, World"], flags: ["--unknown"] },
  });
});
