import { BaseInteraction, ButtonStyle, ComponentType } from "discord.js";
import { CreateMessage } from "./simplify.js";
const DEFAULTS_FOR_BUTTON = {
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
};
/**
 * @typedef {import("discord-api-types/v10").APIButtonComponentBase} APIBaseButton
 */

/**
 *
 * @param {Partial<APIBaseButton>[]} resolable
 */
function justButtonComponents(resolable) {
  const buttons = resolable.map((data, i) => ({
    ...DEFAULTS_FOR_BUTTON,
    customId: `button.${i + 1}`,
    ...data,
  }));

  return buttons;
}

async function justSendMessage(target, options) {
  const messagePayload = CreateMessage(options);

  const message =
    target instanceof BaseInteraction
      ? await (options.edit
          ? target.replied
            ? target.editReply(messagePayload)
            : target.update(messagePayload)
          : target.reply(messagePayload))
      : await (options.edit
          ? target.edit(messagePayload)
          : target.send(messagePayload));

  if (options.delete) {
    setTimeout(() => message.delete(), options.delete);
  }

  if (options.reactions) {
    options.reactions.filter(Boolean).forEach((react) => message.react(react));
  }

  return message;
}

export { justButtonComponents, justSendMessage };
