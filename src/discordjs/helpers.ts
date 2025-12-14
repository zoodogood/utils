import type { Emoji } from 'discord.js'

export function codeOfEmoji(emoji: Emoji) {
	return emoji.id || emoji.name
}
