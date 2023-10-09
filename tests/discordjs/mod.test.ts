import { ComponentType } from 'discord.js';
import * as Util from '../../src/discordjs/mod';

import { expect, test } from "vitest";

test('Should return true for an empty embed', () => {
	const emptyEmbed = Util.CreateMessage({reference: "0000000000000000"})
	expect(Util.isEmptyEmbed(emptyEmbed)).toBe(true);
 });

test("Create message.", () => {
	const message = Util.CreateMessage({
		content: "123"
	})

	expect(message.content).toBe("123");
});