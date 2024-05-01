# CreateMessage
function justSendMessage(target, MessagePayload): Message

**Description:**  
Provide reactions and delete options for more control. Uses [CreateMessage](./CreateMessage.md).
Cam reply for modal or edit target message

### `options`
```ts
interface MessagePayload = {  
	...CreateMessageOptions,
	// ms, timeout for () => message.delete()
	delete: number,
	edit: boolean,
	reactions: Resolable[]
}
```


## Example
```js
justSendMessage(channel, {
	title: "Ciao!",
	description: "Tu sei simpatico",
	components: justButtonComponents({label: "Si! Grazie"}),
	delete: SECOND * 15,
})

```

### Real example
```js
export async function pushMessage(options) {

  options.color ||= config.development ? "#000100" : "#23ee23";

  const target =
    this instanceof InteractionResponse
      ? this.interaction
      : this instanceof Message && !options.edit
        ? this.channel
        : this;

  const message = (async () => {
    try {
      return await justSendMessage(target, options);
    } catch (error) {
      if (!error.message.includes("Invalid Form Body")) {
        console.error(options);
        throw error;
      }
      await sendErrorInfo({
        description: "Оригинальное сообщение не было доставлено",
        channel: target,
        error,
      });
      throw new Error(error.message, { cause: error });
    }
  })();

  return message;
}

}

```

