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

type ItemOfActionRow<T> = { type: ComponentType } & { [key: string]: any };
type ActionRowSource<T> =
	| ItemOfActionRow<T>
	| ItemOfActionRow<T>[]
	| ItemOfActionRow<T>[][]
	| ActionRow<any>
	| ActionRow<any>[];

type SimpleActionRow<T> = {
	type: ComponentType.ActionRow;
	components: ItemOfActionRow<T>[];
}[];

// MARK: Components
export function justComponents<T>(
	state: ActionRowSource<T>,
): SimpleActionRow<T> {
	switch (true) {
		// isEmptyArray ↴ ➞ return []
		case Array.isArray(state) && state.length === 0:
			return [];
		// isSingleActionRow ↴ ➞ ActionRowArray ➞ return SimpleActionRow
		case isSingleActionRow(state):
			state = [state as ActionRow<any>];
		// fallthrough ¯\_(ツ)_/¯
		// isActionRowArray ↴ ➞ return SimpleActionRow
		case Array.isArray(state) && isSingleActionRow(state[0]):
			return state as SimpleActionRow<T>;
		// isSingleComponent ↴ ➞ ComponentsFlat ➞ ComponentsMatrix ➞ return ActionRowArray
		case isSingleComponent(state):
			state = [state as ItemOfActionRow<T>];
		// fallthrough ¯\_(ツ)_/¯
		// isComponentsFlat ↴
		case isComponentsFlat(state):
			state = [state as ItemOfActionRow<T>[]];
		// fallthrough ¯\_(ツ)_/¯
		// isComponentsMatrix ↴
		case Array.isArray(state) && isComponentsFlat(state[0]):
			return (state as ItemOfActionRow<T>[][]).map((row) => ({
				type: ComponentType.ActionRow,
				components: row,
			}));
		default:
			throw new TypeError("Unknown case");
	}

	function isSingleActionRow(component: unknown) {
		// @ts-expect-error
		return component.type === ComponentType.ActionRow;
	}

	function isSingleComponent(component: unknown) {
		// @ts-expect-error
		return "type" in component;
	}
	function isComponentsFlat(component: unknown) {
		return Array.isArray(component) && isSingleComponent(component[0]);
	}
}
