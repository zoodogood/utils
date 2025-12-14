import type { Client, Message, SendableChannels } from 'discord.js'
import { chain_map } from './map.js'

export const _chain_parent = Symbol('parent')
export const _chain_child = Symbol('child')

export async function get_chain_array(
	partId: string,
	client: Client,
): Promise<Array<Message | { id: string }>> {
	// В порядке от потомка к родителю
	const [channelId, ...parts] = chain_map.get(partId)!
	const channel = client.channels.cache.get(channelId)

	return await Promise.all(
		parts.map((id: string) =>
			(channel as SendableChannels).messages.fetch(id).catch((error) => {
				if (error.message !== 'Unknown Message') {
					throw error
				}
				return { id }
			}),
		),
	)
}
