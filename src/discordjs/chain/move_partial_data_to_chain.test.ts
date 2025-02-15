import { expect, test } from "vitest";
import { type AdvancedPayload, createMessage, diagnosticLimits } from "../mod";
import { move_partial_data_to_chain } from "./move_partial_data_to_chain";

test("move_partial_data_to_chain", () => {
	const payload: AdvancedPayload = {
		description: `${"x".repeat(3000)}\n${"y".repeat(3000)}`,
		footer: { text: "123" },
	};
	const diagnostic = diagnosticLimits(payload);
	move_partial_data_to_chain(
		payload,
		{ separateBy: "\n", splay: "balanced" },
		diagnostic,
	);
});

test("Atomic chunk too big", () => {
	const payload: AdvancedPayload = {
		content: `${"x".repeat(3000)}\n${"y".repeat(3000)}`,
	};
	const diagnostic = diagnosticLimits(payload);
	expect(() =>
		move_partial_data_to_chain(
			payload,
			{ separateBy: "\n", splay: "balanced" },
			diagnostic,
		),
	).toThrow();
});

test("Content and description different behavior?", () => {
	const ALPHABET_A_CODE = 97;
	const description = `${Array.from(
		new Array(8),
		(_, i) => `${String.fromCharCode(i + ALPHABET_A_CODE).repeat(1000)}\n`,
	).join("")}\n\`\`\` а эта часть должна оказаться вне код блока`;
	createMessage({
		maySplitMessage: {
			separateBy: "\n",
			splay: "balanced",
		},
		footer: { text: "i18n is not defined" },
		content: description,
	});
});
