import type { AdvancedPayload } from "./mod.js";

export const DiscordContentLimites = {
	content: 2000,
	description: 4096,
	field_count: 25,
};

export function diagnosticLimits(
	payload: AdvancedPayload,
	watchOnly = ["content", "description", "field_count"],
): {
	isExceeding: boolean;
	exceeding: { [key in keyof typeof DiscordContentLimites]?: number };
} {
	let watchOnlyLocal = watchOnly;
	!Array.isArray(watchOnlyLocal) && (watchOnlyLocal = [watchOnlyLocal]);
	const diagnostic = watchOnlyLocal.map((field) => [
		field,
		exceeding_field(field),
	]) as [string, number][];
	return {
		exceeding: Object.fromEntries(diagnostic),
		isExceeding: diagnostic
			.map(($) => $[1])
			.some((exceeding: number) => exceeding > 0),
	};

	function exceeding_field(field: string) {
		switch (field) {
			case "content":
				return (payload.content?.length ?? 0) - DiscordContentLimites.content;
			case "description":
				return (payload[field]?.length ?? 0) - DiscordContentLimites[field];
			case "field_count":
				return (payload.fields?.length ?? 0) - DiscordContentLimites[field];
		}
	}
}
