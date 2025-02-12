// declare state in file://./readme.md

import type { APIEmbed } from "discord.js";
import { DEFAULT } from "../../primitives/symbols.js";
import { main_embed_of } from "../main_embed_of.js";
import {
	DiscordContentLimites,
	type diagnosticLimits,
} from "../message_content_limits.js";
import {
	type AdvancedPayload,
	type createMessage,
	isEmptyEmbed,
} from "../message_lifecycle.js";
import type { MaySplitConfiguration } from "./configuration.js";

function tryMultipleMap<T>(callback: (iteration: number) => T, limit = 10) {
	let iteration = 0;
	while (true) {
		try {
			return callback(iteration++);
		} catch (error) {
			if (iteration >= limit) {
				throw error;
			}
			/* continue*/
		}
	}
}

export function move_partial_data_to_chain(
	mut_original: AdvancedPayload,
	splitConfigutation: MaySplitConfiguration,
	limitsDiagnostic: ReturnType<typeof diagnosticLimits>,
) {
	const chain_child: AdvancedPayload = {};
	mut_original._chain_child = chain_child;
	move_static_down(mut_original, chain_child);
	if (!limitsDiagnostic.isExceeding) {
		// Вернуть визуально пустые значения для рассматриваемых полей
		return void 0;
	}
	const exceeding = Object.entries(limitsDiagnostic.exceeding).filter(
		([_key, value]) => value > 0,
	);

	const { separateBy = "\n" } = splitConfigutation;
	const prepared = exceeding.map(([key]) => {
		switch (key) {
			case "content":
			case "description":
				return (() => {
					const chunks = (mut_original[key] as string)
						.split(separateBy)
						.map((chunk) => ({
							chunk,
							codeblock_lang: (() => {
								const markers = Array.from(chunk.matchAll(/```(?<lang>\S+)?/g));
								if (markers.length % 2 === 0) {
									return;
								}
								return markers.at(-1)!.groups!.lang || DEFAULT;
							})(),
						}));
					chunks.forEach(($) => {
						if ($.chunk.length > DiscordContentLimites[key]) {
							throw new Error(
								"As a result of splitting large text, spliceBy did not find any potential separation points (https://github.com/zoodogood/1119/issues/8)",
							);
						}
					});
					return [key, chunks];
				})();

			case "fields_count":
				return ["fields", mut_original.fields];

			default:
				return [key, mut_original[key as keyof AdvancedPayload]];
		}
	});

	const predicated_chain_length =
		Math.max(
			...exceeding.map(
				([key, value]) =>
					value /
					DiscordContentLimites[key as keyof typeof DiscordContentLimites],
			),
		) + 1;

	const [for_original, for_child] = tryMultipleMap((iteration) => {
		return resolve(predicated_chain_length + iteration);
	});
	Object.assign(chain_child, for_child);
	Object.assign(mut_original, for_original, {
		_chain_child: chain_child,
	});
	return void 0;

	function resolve(
		predicated_chain_length: number,
	): [AdvancedPayload, AdvancedPayload] {
		type PayloadItem<K extends keyof AdvancedPayload> = [
			K,
			[NonNullable<AdvancedPayload[K]>, NonNullable<AdvancedPayload[K]>],
		];

		return prepared
			.map(([key, value]) => {
				switch (key) {
					case "content":
					case "description":
						return [
							key,
							(() => {
								const average =
									(mut_original[key] as string).length /
									Math.ceil(predicated_chain_length);

								const chunks_to_keep = [] as string[];
								let remain_symbols_count = 0;
								let opened_codeblock: string | typeof DEFAULT | null = null;
								const pull = value as {
									chunk: string;
									codeblock_lang: string | undefined;
								}[];
								const CLOSE_CODEBLOCK = "\n```";
								const close_codeblock_length = CLOSE_CODEBLOCK.length;

								while (pull.length) {
									const { chunk, codeblock_lang } = pull[0]!;
									if (codeblock_lang) {
										opened_codeblock = opened_codeblock
											? null
											: (codeblock_lang as NonNullable<string>);
									}
									if (
										remain_symbols_count +
											chunk.length +
											(opened_codeblock ? close_codeblock_length : 0) >
											DiscordContentLimites[key] ||
										remain_symbols_count > average
									) {
										opened_codeblock && chunks_to_keep.push(CLOSE_CODEBLOCK);
										break;
									}
									pull.shift();
									chunks_to_keep.push(chunk);
									remain_symbols_count += chunk.length;
								}
								const chunks_to_shift = pull.map(({ chunk }) => chunk);
								opened_codeblock &&
									chunks_to_shift.unshift(
										// @ts-expect-error
										`\`\`\`${opened_codeblock === DEFAULT ? "" : opened_codeblock}\n`,
									);
								return [
									chunks_to_keep.join(separateBy),
									chunks_to_shift.join(separateBy),
								];
							})(),
						] as PayloadItem<"content" | "description">;

					case "fields":
						return [
							key,
							Object.values(
								Object.groupBy(
									value as AdvancedPayload["fields"][],
									(_value, index) =>
										String(
											index <
												(value as AdvancedPayload["fields"][]).length /
													Math.ceil(predicated_chain_length),
										),
								),
							) as [AdvancedPayload["fields"], AdvancedPayload["fields"]],
						] as PayloadItem<"fields">;

					default:
						throw new Error(`Unknown key: ${key}`);
				}
			})
			.reduce(
				(acc, item) => {
					const [key, [keep, move]] = item;
					// @ts-expect-error
					acc[0][key] = keep as AdvancedPayload[typeof key];
					// @ts-expect-error
					acc[1][key] = move as AdvancedPayload[typeof key];
					return acc;
				},
				[<AdvancedPayload>{}, <AdvancedPayload>{}],
			);
	}

	function move_static_down(from: AdvancedPayload, to: AdvancedPayload) {
		// components, footer, reactions, files: окажутся в последнем сообщении
		// color: скопируется
		// если в оригинальном сообщении есть description или content — во втором сообщении им на смену прийдут визуально пустые значения
		const is_started_as_empty = isEmptyEmbed(from);
		to.color = from.color;
		to.maySplitMessage = from.maySplitMessage;
		to.image = from.image;
		from.image = undefined;
		to.timestamp = from.timestamp;
		from.timestamp = undefined;
		to.components = from.components;
		from.components = undefined;
		to.footer = from.footer;
		from.footer = undefined;
		to.reactions = from.reactions;
		from.reactions = undefined;
		to.files = from.files;
		from.files = undefined;
		from.description && (to.description = "-# (пусто)");
		from.content && (to.content = "-# (пусто)");
		!is_started_as_empty &&
			isEmptyEmbed(from) &&
			(from.description = "-# (пусто)");
	}
}

// Решает прецендент когда целью становится сообщение в цепочке у которого есть потомки, и это выясняется только в момент отправки
// Хотя по хорошему данные сообщения должны быть собраны до отправки, этого невозможно сделать не целевого айди, а оно при редактировании не подразумевается
export function _rob_already_prepared(
	mut_message_data: ReturnType<typeof createMessage>,
	mut_payload: AdvancedPayload,
) {
	const embed = main_embed_of(mut_message_data) as APIEmbed | undefined;
	if (embed) {
		embed.footer = undefined;
		embed.image = undefined;
		embed.timestamp = undefined;
		embed.video = undefined;
	}
	mut_message_data.files = undefined;
	mut_message_data.components = undefined;
	mut_payload.reactions = undefined;
}
