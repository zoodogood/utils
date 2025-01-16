import type { APIModalInteractionResponseCallbackData } from "discord-api-types/v10";

import {
	ComponentType,
	ModalBuilder,
	type ModalSubmitInteraction,
	type RepliableInteraction,
	type TextInputComponent,
	type TextInputComponentData,
	TextInputStyle,
} from "discord.js";
import { assert } from "node:assert";
import { justComponents } from "./message_components.js";

export function createModal({
	title,
	customId,
	components,
}: {
	title: string;
	customId: string;
	components: Parameters<typeof justComponents>[0];
}): APIModalInteractionResponseCallbackData {
	components = justComponents(components);
	return new ModalBuilder({ title, customId, components }).toJSON();
}

export async function justModalQuestion({
	title,
	customId = "modal",
	components: _components,
	interaction,
	thanks = false,
}: {
	title: string;
	customId?: string;
	components: Parameters<typeof justComponents>[0];
	interaction: Exclude<RepliableInteraction, ModalSubmitInteraction>;
	thanks?: string | boolean;
}) {
	assert(
		!("type" in _components && _components.type === ComponentType.ActionRow),
	);
	!Array.isArray(_components) && (_components = [_components]);
	const components: TextInputComponent[] = _components.map(
		// @ts-expect-error
		(addable: Partial<TextInputComponentData>, i = 0) => ({
			type: ComponentType.TextInput,
			customId: `${customId}_content_${i}`,
			label: addable.label,
			style: addable.style || TextInputStyle.Paragraph,
			placeholder: addable.placeholder,
			maxLength: addable.maxLength,
		}),
	);

	const modal = createModal({
		components,
		customId,
		title,
	});

	await interaction.showModal(modal);
	const response = await interaction.awaitModalSubmit({
		filter: (interaction: ModalSubmitInteraction) =>
			customId === interaction.customId,
		time: 60_000 /*MINUTE*/ * 5,
	});

	thanks &&
		response?.msg({
			content: thanks !== true ? thanks : "Спасибо!",
			ephemeral: true,
		});

	return { response, fields: response?.fields.fields };
}
