import { ComponentType } from 'discord.js';
import * as Util from '../../src/discordjs/mod';

import { expect, test } from "vitest";

test("Create message", () => {
	const message = Util.CreateMessage({
		
		components: [[{type: ComponentType.Button, label: "123"}], [{type: ComponentType.Button, label: "123"}]],
		content: "123"
	})

	throw new Error(JSON.stringify(message));
	
});