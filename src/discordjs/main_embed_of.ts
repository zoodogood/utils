import type { APIEmbed } from "discord-api-types/v10";
import type {
	Embed,
	JSONEncodable,
	Message,
	MessageCreateOptions,
} from "discord.js";

export function main_embed_of(
	message: Message | MessageCreateOptions,
): Embed | APIEmbed | undefined {
	return message.embeds?.[0] as Exclude<
		Embed | APIEmbed | undefined,
		JSONEncodable<APIEmbed>
	>;
}
