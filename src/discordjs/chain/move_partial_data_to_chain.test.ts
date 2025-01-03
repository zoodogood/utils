import { test } from "vitest";
import { type AdvancedPayload, diagnosticLimits } from "../mod";
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
		false,
	);
});
