import type { APIModalInteractionResponseCallbackData } from "discord-api-types/v10";

import {
	ComponentType,
	type Interaction,
	ModalBuilder,
	type TextInputComponentData,
	TextInputStyle,
} from "discord.js";
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
	components,
	interaction,
	thanks = false,
}: {
	title: string;
	customId?: string;
	components: Parameters<typeof justComponents>[0];
	interaction: Interaction;
	thanks?: string | boolean;
}) {
	components = components.map(
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
		filter: (interaction) => customId === interaction.customId,
		time: MINUTE * 5,
	});

	thanks &&
		response?.msg({
			content: thanks !== true ? thanks : "Спасибо!",
			ephemeral: true,
		});

	return { response, fields: response?.fields.fields };
}
