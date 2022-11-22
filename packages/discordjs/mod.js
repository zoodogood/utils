import { EmbedBuilder, ModalBuilder, resolveColor } from 'discord.js';
import { ComponentType } from 'discord-api-types/v10';



function isEmptyEmbed(embed){

  const DEFAULT_PROPERTIES = {
    title: null,
    author: null,
    thumbnail: null,
    description: null,
    fields: [],
    image: null,
    footer: null,
    timestamp: Number.NaN,
    video: null
  }


  // in isEmptyEmbed context is a good compare
  const isEqualDefault = (key) => String(embed[key]) === String(DEFAULT_PROPERTIES[key]);

  const isEveryPropertyDefault = Object.keys(DEFAULT_PROPERTIES)
    .every(isEqualDefault);

  return isEveryPropertyDefault;
}


function CreateMessage({
  content,
  title, url, author, thumbnail, description, color, fields, image, video, footer, timestamp,
  ephemeral, fetchReply,
  components, files

}){
	const message = {};

	thumbnail &&= { url: thumbnail };
	image     &&= { url: image };
	video     &&= { url: video };


	color = resolveColor(color ?? "Random");

	const embed = new EmbedBuilder({
		title, url, author, thumbnail,
		description, color, fields,
		image, video, footer, timestamp
	});

	if (!isEmptyEmbed(embed)){
		message.embeds = [embed];
	}

	if (files){
		message.files = files;
	}

	message.components = components ? SimplifyComponents(components) : null;


	message.content    = content;
	message.ephemeral  = ephemeral;
	message.fetchReply = fetchReply;

	return message;
}

function CreateModal({title, customId, components}){
	components = SimplifyComponents(components);
  	return new ModalBuilder({title, customId, components});
}



function SimplifyComponents(data){

  	if (data instanceof Array && data.length === 0)
    	return [];

  	const isComponent  = (component) => "type" in component;
  	const isActionRow  = (component) => component instanceof Array && isComponent(component.at(0)) || component instanceof MessageActionRow;
  	const isComponents = (component) => component.length && isActionRow(component.at(0));

  	const argumentType = [
    	isComponent(data),
    	isActionRow(data),
    	isComponents(data)
  	].findIndex(Boolean);

  	if (argumentType === -1)
    	throw new TypeError("expected component");

  	const inArray = (component) => [component];
  	const arrayToActionRow = (componentsArray) => {
    	if (componentsArray.type === ComponentType.ActionRow)
      	return componentsArray;

    	return { type: ComponentType.ActionRow, components: componentsArray };
  	}
  	const actionRowInArray = (actionRow) => [actionRow];


  	if (argumentType <= 0)
    	data = inArray(data);

  	if (argumentType <= 1)
    	data = actionRowInArray(data)

  	data = data.map(arrayToActionRow);
  	return data;

}

export default {
  CreateMessage,
  CreateModal,
  SimplifyComponents,
  isEmptyEmbed
};