import {
	type AttachmentBuilder,
	BaseInteraction,
	type ColorResolvable,
	EmbedBuilder,
	Message,
	type MessageCreateOptions,
	type PartialGroupDMChannel,
	type SendableChannels,
	User,
	resolveColor,
} from "discord.js";

import assert from "node:assert";
import { chain_map } from "./chain/map.js";
import {
	_rob_already_prepared,
	move_partial_data_to_chain,
} from "./chain/move_partial_data_to_chain.js";
import { codeOfEmoji } from "./helpers.js";
import { justComponents } from "./message_components.js";
import { diagnosticLimits } from "./message_content_limits.js";
import {
	onMessageDelete as ChainLifecycleOnMessageDelete,
	type MaySplitConfiguration,
	_chain_child,
	_chain_parent,
} from "./mod.js";

function sendableOf<
	T extends
		| User
		| SendableChannels
		| Message
		| ({} & { channel: SendableChannels })
		| ({} & { send: (payload: MessageCreateOptions) => Promise<Message> }),
>(
	target: T,
): {
	send: (payload: MessageCreateOptions) => Promise<Message>;
} {
	if (target instanceof User || target.isSendable?.()) {
		return target;
	}
	if ("channel" in target) {
		return target.channel as Exclude<
			typeof target.channel,
			PartialGroupDMChannel
		>;
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
	color?: ColorResolvable;
	description?: string;
	fields?: { name: string; value: string; inline?: boolean }[];
	image?: string;
	video?: string;
	footer?: { text: string; iconURL?: string };
	timestamp?: string;
	delete?: number;
	reactions?: string[];
	maySplitMessage?: MaySplitConfiguration;
	_chain_child?: AdvancedPayload;
	components?: ReturnType<typeof justComponents>;
	files?: AttachmentBuilder[];
}

export function isEmptyEmbed(
	embed: { [key in keyof EmbedBuilder["data"]]: unknown },
) {
	const EMBED_PROPERTIES = [
		"title",
		"author",
		"thumbnail",
		"description",
		"fields",
		"image",
		"footer",
		"timestamp",
		"video",
	];
	// in isEmptyEmbed context is a good compare
	const isEveryPropertyDefault = EMBED_PROPERTIES.every(
		(key) => Boolean(embed[key as keyof typeof embed]) === false,
	);

	return isEveryPropertyDefault;
}

export function createMessage(mut_payload: AdvancedPayload) {
	const { maySplitMessage } = mut_payload;
	maySplitMessage &&
		(() => {
			const diagnostic = diagnosticLimits(mut_payload, maySplitMessage.fields);
			if (!diagnostic.isExceeding && !mut_payload._chain_child) {
				return;
			}

			move_partial_data_to_chain(mut_payload, maySplitMessage, diagnostic);
		})();
	const {
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
	} = mut_payload;
	const message: MessageCreateOptions = {
		// @ts-expect-error
		components: components ? justComponents(components) : null,
		content,
		ephemeral,
		fetchReply,
		files,
		reply: reference ? { messageReference: reference } : undefined,
	};

	const embed = new EmbedBuilder({
		title,
		url,
		author,
		thumbnail: thumbnail ? { url: thumbnail } : undefined,
		description,
		color: resolveColor(color ?? "Random"),
		fields,
		image: image ? { url: image } : undefined,
		video: video ? { url: video } : undefined,
		footer,
		timestamp,
	});

	if (!isEmptyEmbed(embed.data)) {
		message.embeds = [embed];
	}

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
	const _payload = { ...payload };
	return sendMessage<InGuild>(target, createMessage(_payload), _payload);
}

export async function sendMessage<InGuild extends boolean>(
	target: Parameters<typeof sendableOf>[0],
	message_data: ReturnType<typeof createMessage>,
	mut_payload: AdvancedPayload,
): Promise<Message<InGuild>> {
	const { maySplitMessage } = mut_payload;
	maySplitMessage &&
		mut_payload.edit &&
		!mut_payload._chain_child &&
		(() => {
			const message =
				target instanceof Message
					? target
					: "message" in target && (target.message as Message);
			if (!message) {
				return;
			}
			const chain = chain_map.get(message.id)?.slice(1);

			const is_chain_last_item =
				chain && chain.indexOf(message.id) === chain.length - 1;
			if (!chain || is_chain_last_item) {
				return;
			}
			const diagnostic = diagnosticLimits(mut_payload, maySplitMessage.fields);
			move_partial_data_to_chain(mut_payload, maySplitMessage, diagnostic);
			_rob_already_prepared(message_data, mut_payload);
		})();

	const message: Message<InGuild> =
		target instanceof BaseInteraction
			? await (mut_payload.edit
					? target.replied
						? target.editReply(message_data)
						: target.update(message_data)
					: target.reply(message_data))
			: await (mut_payload.edit
					? target.edit(message_data)
					: target.send(message_data));

	if (mut_payload.delete) {
		setTimeout(() => {
			ChainLifecycleOnMessageDelete(message);
			message.delete();
		}, mut_payload.delete);
	}

	if (mut_payload._chain_child) {
		assert(!mut_payload.ephemeral);
		mut_payload._chain_child ||= {};
		mut_payload._chain_child.reference = message.id;
		let createdNow = false;

		const child_message: Message<InGuild> =
			message[_chain_child] ||
			(await (async () => {
				const chain = chain_map.get(message.id)?.slice(1);
				if (!chain) {
					return;
				}
				const channel = sendableOf(target);
				const index = chain.indexOf(message.id);
				if (index === 0) {
					return;
				}
				const child_message_id = chain[index + 1];
				if (!child_message_id) {
					return;
				}

				return await (channel as SendableChannels).messages.fetch(
					child_message_id,
				);
			})()) ||
			(await (async () => {
				const child_message = await justSendMessage(
					sendableOf(target),
					mut_payload._chain_child!,
				);
				createdNow = true;
				child_message[_chain_parent] = mut_payload;
				message[_chain_child] = child_message;
				return child_message;
			})());
		if (!createdNow) {
			await justSendMessage<InGuild>(
				child_message,
				Object.assign({}, mut_payload._chain_child, { edit: true }),
			);
		}
		chain_map.update(message, child_message, message.channelId);
	}

	if (mut_payload.reactions) {
		mut_payload.reactions
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
