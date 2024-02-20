import { expect, test } from "vitest";
import { CliParser } from "../../src/primitives/CliParser.js";
import { BracketsParser } from "../../src/primitives/BracketsParser.js";

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
  console.log(values);
});
