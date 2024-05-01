# CreateMessage
function CreateMessage(MessagePayload): MessagePayload

**Description:**  
Takes and transform MessagePayload

### `options`
```ts
interface MessagePayload = {  
	content,
  	...embed,
  	ephemeral, fetchReply,
  	components, files, reference
}
```


## Example
```js
const payload = CreateMessage({
	content: "Message content",
	title: "Message embed title"
});
```

### Real example
```js
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
    options.reactions
      .filter(Boolean)
      .filter(
        (react) =>
          !message.reactions?.cache.some(
            (compared) => compared.emoji.code === react,
          ),
      )
      .forEach((react) => message.react(react));
  }

  return message;
}


```

