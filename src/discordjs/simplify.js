import {
  EmbedBuilder,
  ModalBuilder,
  resolveColor,
  ActionRow,
} from "discord.js";
import { ComponentType } from "discord-api-types/v10";

/**
 *
 * @param {*} embed
 * @returns {boolean}
 */
function isEmptyEmbed(embed) {
  const DEFAULT_PROPERTIES = {
    title: undefined,
    author: undefined,
    thumbnail: undefined,
    description: undefined,
    fields: undefined,
    image: undefined,
    footer: undefined,
    timestamp: undefined,
    video: undefined,
  };

  // in isEmptyEmbed context is a good compare
  const isEqualDefault = (key) =>
    String(embed[key]) === String(DEFAULT_PROPERTIES[key]);

  const isEveryPropertyDefault =
    Object.keys(DEFAULT_PROPERTIES).every(isEqualDefault);

  return isEveryPropertyDefault;
}

/**
 * Create a message object for Discord.
 *
 * @param {Object} params = Parameters for creating the message.
 * @param {string} [params.content] - The message content.
 * @param {string} [params.title] - The title of the embed.
 * @param {string} [params.url] - The URL of the embed.
 * @param {Object} [params.author] - The author of the embed.
 * @param {string} [params.thumbnail] - The thumbnail URL of the embed.
 * @param {string} [params.description] - The description of the embed.
 * @param {string} [params.color] - The color of the embed.
 * @param {Object[]} [params.fields] - The fields of the embed.
 * @param {string} [params.image] - The image URL of the embed.
 * @param {string} [params.video] - The video URL of the embed.
 * @param {Object} [params.footer] - The footer of the embed.
 * @param {string} [params.timestamp] - The timestamp of the embed.
 * @param {boolean} [params.ephemeral] - Whether the message should be ephemeral.
 * @param {boolean} [params.fetchReply] - Whether to fetch the message reply.
 * @param {Object[] | Object} [params.components] - The message components.
 * @param {Object[] | Object[]} [params.files] - The message files.
 * @param {string} [params.reference] - The message reference.
 * @returns {Object} - The message object.
 */
function CreateMessage({
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
}) {
  const message = {};

  thumbnail &&= { url: thumbnail };
  image &&= { url: image };
  video &&= { url: video };

  color = resolveColor(color ?? "Random");

  const embed = new EmbedBuilder({
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
  });

  if (!isEmptyEmbed(embed.data)) {
    message.embeds = [embed];
  }

  if (files) {
    message.files = files;
  }

  if (reference)
    message.reply = {
      messageReference: reference,
    };

  message.components = components ? SimplifyComponents(components) : null;

  message.content = content;
  message.ephemeral = ephemeral;
  message.fetchReply = fetchReply;

  return message;
}

function CreateModal({ title, customId, components }) {
  components = SimplifyComponents(components);
  return new ModalBuilder({ title, customId, components }).toJSON();
}

function SimplifyComponents(data) {
  if (data instanceof Array && data.length === 0) return [];

  const isComponent = (component) =>
    "type" in component && component.type !== ComponentType.ActionRow;
  const isActionRow = (component) =>
    (component instanceof Array && isComponent(component.at(0))) ||
    component instanceof ActionRow;
  const isComponents = (component) =>
    component instanceof Array && isActionRow(component.at(0));

  const argumentType = [
    isComponent(data),
    isActionRow(data),
    isComponents(data),
  ].findIndex(Boolean);

  if (argumentType === -1) throw new TypeError("expected component");

  const wrapToArray = (component) => [component];
  const arrayToActionRow = (componentsArray) => {
    const isActionRow =
      "type" in componentsArray &&
      componentsArray.type === ComponentType.ActionRow;

    if (isActionRow) return componentsArray;

    return { type: ComponentType.ActionRow, components: componentsArray };
  };

  if (argumentType <= 0) data = wrapToArray(data);

  if (argumentType <= 1) data = wrapToArray(data);

  data = data.map(arrayToActionRow);
  return data;
}

export { CreateMessage, CreateModal, SimplifyComponents, isEmptyEmbed };
