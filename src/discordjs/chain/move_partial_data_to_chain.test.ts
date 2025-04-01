import { expect, test } from "vitest";
import { type AdvancedPayload, createMessage, diagnosticLimits } from "../mod";
import { move_partial_data_to_chain } from "./move_partial_data_to_chain";

test("move_partial_data_to_chain", () => {
	const payload: AdvancedPayload = {
		description: `${"x".repeat(3000)}\n${"y".repeat(3000)}`,
		footer: { text: "123" },
	};
	const diagnostic = diagnosticLimits(payload);
	move_partial_data_to_chain(
		payload,
		{ separateBy: "\n", splay: "balanced" },
		diagnostic,
	);
});

test("Atomic chunk too big", () => {
	const payload: AdvancedPayload = {
		content: `${"x".repeat(3_000)}\n${"y".repeat(3_000)}`,
	};
	const diagnostic = diagnosticLimits(payload);
	expect(() =>
		move_partial_data_to_chain(
			payload,
			{ separateBy: "\n", splay: "balanced" },
			diagnostic,
		),
	).toThrow();
});

test("Content and description different behavior?", () => {
	const ALPHABET_A_CODE = 97;
	const description = `${Array.from(
		new Array(8),
		(_, i) => `${String.fromCharCode(i + ALPHABET_A_CODE).repeat(1000)}\n`,
	).join("")}\n\`\`\` а эта часть должна оказаться вне код блока`;
	createMessage({
		maySplitMessage: {
			separateBy: "\n",
			splay: "balanced",
		},
		footer: { text: "i18n is not defined" },
		content: description,
	});
});

test("Real example #1", () => {
	//
	const input =
		"```js\nТут такое было.. ого-го\nᅠ\n1..puzzle_1(2.44)%                  2..board_1(2.44)%                  \n3..embeds_2(4.88)%                  4..setlogs_3(7.32)%                \n5..welcomer_3(7.32)%                6..role_3(7.32)%                   \n7..invites_3(7.32)%                 8..embed_5(12.2)%                  \n9..youtube_5(12.2)%                 10.giveaway_6(14.63)%              \n11.localization_6(14.63)%           12.delete_8(19.51)%                \n13.guildcommand_8(19.51)%           14.clan_10(24.39)%                 \n15.emojis_11(26.83)%                16.avatar_15(36.59)%               \n17.editserver_16(39.02)%            18.mute_18(43.9)%                  \n19.partners_18(43.9)%               20.charity_22(53.66)%              \n21.setchat_23(56.1)%                22.warn_27(65.85)%                 \n23.clear_33(80.49)%                 24.bug_35(85.37)%                  \n25.task_37(90.24)%                  26.birthdays_39(95.12)%            \n27.level_50(121.95)%                28.execute_65(158.54)%             \n29.setprofile_98(239.02)%           30.ball_98(239.02)%                \n31.quests_103(251.22)%              32.rob_131(319.51)%                \n33.praises_159(387.8)%              34.help_161(392.68)%               \n35.commandinfo_172(419.51)%         36.bot_233(568.29)%                \n37.server_234(570.73)%              38.idea_249(607.32)%               \n39.bank_320(780.49)%                40.praise_357(870.73)%             \n41.curses_428(1043.9)%              42.seed_513(1251.22)%              \n43.chilli_519(1265.85)%             44.top_581(1417.07)%               \n45.iq_670(1634.15)%                 46.berry_792(1931.71)%             \n47.casino_798(1946.34)%             48.chest_832(2029.27)%             \n49.anon_987(2407.32)%               50.witch_1431(3490.24)%            \n51.remind_1594(3887.8)%             52.pay_2121(5173.17)%              \n53.grempen_2339(5704.88)%           54.thing_3137(7651.22)%            \n55.eval_3190(7780.49)%              56.bag_4962(12102.44)%             \n57.user_6197(15114.63)%             58.boss_6320(15414.63)%            \n\nᅠ\n```";
	createMessage({
		content: input,
		maySplitMessage: {
			separateBy: "\n",
		},
	});
});
