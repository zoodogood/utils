import type { DiscordContentLimites } from "../message_content_limits.js";

export interface MaySplitConfiguration {
	fields?: (keyof typeof DiscordContentLimites)[];
	separateBy?: string;
	splay?: "balanced" | "rest";
}
