import type { Client, TextChannel } from "discord.js";
import { chain_map } from "./map.js";

export async function get_chain_array(partId: string, client: Client) {
	const [channelId, parts] = chain_map.get(partId);
	const channel = client.channels.cache.get(channelId);
	return Promise.all(
		parts.map((id: string) => (channel as TextChannel).messages.fetch(id)),
	);
}
