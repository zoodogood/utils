import {
	type ActionRow,
	type BaseSelectMenuComponentData,
	ButtonStyle,
	ComponentType,
} from "discord.js";

const DEFAULTS_FOR_BUTTON = {
	type: ComponentType.Button,
	style: ButtonStyle.Secondary,
};

interface ButtonConfiguration {
	customId?: string;
	label?: string;
	emoji?: string;
	disabled?: boolean;
	url?: string;
	style?: ButtonStyle;
	type?: ComponentType.Button;
}

export function justButtonComponents(...resolable: ButtonConfiguration[]) {
	const buttons = resolable.map((data, i) => ({
		...DEFAULTS_FOR_BUTTON,
		customId: `button.${i + 1}`,
		...data,
	}));

	return buttons;
}

export function justSelectMenuComponent({
	placeholder,
	labels,
	addable = {},
}: {
	placeholder?: string;
	labels: string[];
	addable?: Partial<BaseSelectMenuComponentData>;
}) {
	return {
		type: ComponentType.StringSelect,
		placeholder,
		options: labels.map((label, index) => ({ label, value: String(index) })),
		...addable,
	};
}

type ItemOfActionRow = { type: ComponentType } & { [key: string]: any };
type ActionRowSource =
	| ItemOfActionRow
	| ItemOfActionRow[]
	| ItemOfActionRow[][]
	| ActionRow<any>
	| ActionRow<any>[];

type SimpleActionRow = {
	type: ComponentType.ActionRow;
	components: ItemOfActionRow[];
}[];

// MARK: Components
export function justComponents(state: ActionRowSource): SimpleActionRow {
	switch (true) {
		// isEmptyArray ↴
		case Array.isArray(state) && state.length === 0:
			return [];
		// isSingleActionRow ↴
		case isSingleActionRow(state):
			state = [state as ActionRow<any>];
		// fallthrough
		// isActionRowArray ↴
		case Array.isArray(state) && isSingleActionRow(state[0]):
			return state as SimpleActionRow;
		// isSingleComponent ↴
		case isSingleComponent(state):
			state = [state as ItemOfActionRow];
		// fallthrough
		// isComponentsFlat ↴
		case isComponentsFlat(state):
			state = [state as ItemOfActionRow[]];
		// fallthrough
		// isComponentsMatrix ↴
		case Array.isArray(state) && isComponentsFlat(state[0]):
			return (state as ItemOfActionRow[][]).map((row) => ({
				type: ComponentType.ActionRow,
				components: row,
			}));
		default:
			throw new TypeError("Unknown case");
	}

	function isSingleActionRow(component: any) {
		return component.type === ComponentType.ActionRow;
	}

	function isSingleComponent(component: any) {
		return "type" in component;
	}
	function isComponentsFlat(component: any) {
		return Array.isArray(component) && isSingleComponent(component[0]);
	}
}
