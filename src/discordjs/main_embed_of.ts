import type { Embed, Message } from "discord.js";

export function main_embed_of(message: Message): Embed {
	return message.embeds[0];
}
