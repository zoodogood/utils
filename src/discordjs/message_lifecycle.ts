import {
	type AttachmentBuilder,
	BaseChannel,
	BaseInteraction,
	EmbedBuilder,
	type Message,
	type MessageCreateOptions,
	type SendableChannels,
	type TextChannel,
	User,
	resolveColor,
} from "discord.js";
import assert from "node:assert";
import { chain_map } from "./chain/map.js";
import { move_partial_data_to_chain } from "./chain/move_partial_data_to_chain.js";

import { codeOfEmoji } from "./helpers.js";
import { justComponents } from "./message_components.js";
import { diagnosticLimits } from "./message_content_limits.js";
import type { MaySplitConfiguration } from "./mod.js";
function sendableOf(
	target: User | SendableChannels | { channel: SendableChannels },
): {
	send: (payload: MessageCreateOptions) => Promise<Message>;
} {
	if (
		target instanceof User ||
		(target instanceof BaseChannel && target.isSendable())
	) {
		return target;
	}
	if ("channel" in target) {
		return target.channel;
	}
	throw new Error("Invalid target");
}

export interface AdvancedPayload {
	content?: string;
	reference?: string;
	ephemeral?: boolean;
	fetchReply?: boolean;
	title?: string;
	url?: string;
	edit?: boolean;
	author?: { name: string; iconURL?: string };
	thumbnail?: string;
	color?: string;
	description?: string;
	fields?: { name: string; value: string; inline?: boolean }[];
	image?: string;
	video?: string;
	footer?: { text: string; iconURL?: string };
	timestamp?: string;
	delete?: number;
	reactions?: string[];
	maySplitMessage?: MaySplitConfiguration;
	chain_child?: AdvancedPayload;
	components?: ReturnType<typeof justComponents>;
	files?: AttachmentBuilder[];
}

export function isEmptyEmbed(embed: EmbedBuilder["data"]) {
	const DEFAULT_PROPERTIES = {
		title: undefined,
		author: undefined,
		thumbnail: undefined,
		description: undefined,
		fields: undefined,
		image: undefined,
		footer: undefined,
		timestamp: undefined,
		video: undefined,
	};
	// in isEmptyEmbed context is a good compare
	const isEveryPropertyDefault = Object.keys(DEFAULT_PROPERTIES).every(
		(key) =>
			String(embed[key as keyof EmbedBuilder["data"]]) ===
			String(DEFAULT_PROPERTIES[key as keyof typeof DEFAULT_PROPERTIES]),
	);

	return isEveryPropertyDefault;
}

export function createMessage(payload: AdvancedPayload) {
	const { maySplitMessage } = payload;
	maySplitMessage &&
		(() => {
			const diagnostic = diagnosticLimits(payload, maySplitMessage.fields);
			if (!diagnostic.isExceeding && !payload.chain_child) {
				return;
			}
			move_partial_data_to_chain(payload, maySplitMessage, diagnostic);
		})();
	let {
		content,
		title,
		url,
		author,
		thumbnail,
		description,
		color,
		fields,
		image,
		video,
		footer,
		timestamp,
		ephemeral,
		fetchReply,
		components,
		files,
		reference,
	} = payload;
	const message: MessageCreateOptions = {};

	thumbnail &&= { url: thumbnail };
	image &&= { url: image };
	video &&= { url: video };

	color = resolveColor(color ?? "Random");

	const embed = new EmbedBuilder({
		title,
		url,
		author,
		thumbnail,
		description,
		color,
		fields,
		image,
		video,
		footer,
		timestamp,
	});

	if (!isEmptyEmbed(embed.data)) {
		message.embeds = [embed];
	}

	if (files) {
		message.files = files;
	}

	if (reference)
		message.reply = {
			messageReference: reference,
		};

	message.components = components ? justComponents(components) : null;

	message.content = content;
	message.ephemeral = ephemeral;
	message.fetchReply = fetchReply;

	return message;
}

/**
 *
 * @param {Partial<APIBaseButton>[]} resolable
 */

export async function justSendMessage<InGuild extends boolean>(
	target: Parameters<typeof sendableOf>[0],
	payload: AdvancedPayload,
) {
	return sendMessage<InGuild>(target, createMessage(payload), payload);
}

export async function sendMessage<InGuild extends boolean>(
	target: Parameters<typeof sendableOf>[0],
	message_data: ReturnType<typeof createMessage>,
	payload: AdvancedPayload,
): Promise<Message<InGuild>> {
	const message: Message<InGuild> =
		target instanceof BaseInteraction
			? await (payload.edit
					? target.replied
						? target.editReply(message_data)
						: target.update(message_data)
					: target.reply(message_data))
			: await (payload.edit
					? target.edit(message_data)
					: target.send(message_data));

	if (payload.delete) {
		setTimeout(() => message.delete(), payload.delete);
	}

	chain_map.has(message.id) && (payload.chain_child ||= {});
	if (payload.chain_child) {
		assert(!payload.ephemeral);
		payload.chain_child.reference = message.id;
		let createdNow = false;
		const child_message: Message = await (async () => {
			return (
				message.chain_child ||
				(await (async () => {
					const parts = chain_map.get(message.id)?.slice(1);
					if (!parts) {
						return;
					}
					const channel = sendableOf(target);
					const index = parts.indexOf(message.id);
					if (index === -1) {
						return;
					}
					const child_message_id = parts[index + 1];
					return await (channel as TextChannel).messages.fetch(
						child_message_id,
					);
				})()) ||
				(await (async () => {
					const child_message = await justSendMessage(
						sendableOf(target),
						payload.chain_child!,
					);
					createdNow = true;
					child_message.chain_parent = payload;
					message.child_message = child_message;
					return child_message;
				})())
			);
			if (!createdNow) {
				await justSendMessage<InGuild>(child_message, payload.chain_child);
			}
		})();
	}

	if (payload.reactions) {
		payload.reactions
			.filter(Boolean)
			.filter(
				(react) =>
					!message.reactions?.cache.some(
						(compared) => codeOfEmoji(compared.emoji) === react,
					),
			)
			.forEach((react) => message.react(react));
	}

	return message;
}
