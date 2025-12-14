import { EventEmitter } from 'node:events'
import { Message } from 'discord.js'
import { get_chain_array } from './get_chain_array.js'
import { chain_map } from './map.js'

export const propogate = new EventEmitter()
export async function onMessageDelete(message: Message) {
	const messages =
		chain_map.has(message.id) &&
		(await get_chain_array(message.id, message.client))

	if (!chain_map.has(message.id)) {
		return
	}

	for (const message of messages as Awaited<
		ReturnType<typeof get_chain_array>
	>) {
		chain_map.delete(message.id)
		message instanceof Message && message.delete()
	}
}

export async function onPropogableEvent(
	eventType: string,
	direct_target: Message,
	rest: unknown,
) {
	const chain =
		chain_map.has(direct_target.id) &&
		(await get_chain_array(direct_target.id, direct_target.client))
	if (!chain) return
	for (const message of chain) {
		propogate.emit(eventType, message, rest, direct_target, chain)
	}
}
