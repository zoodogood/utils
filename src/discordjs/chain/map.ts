import type { Message } from "discord.js";

class Cache extends Map<string, string[]> {
	constructor() {
		super();
		setInterval(
			() => {
				const { size } = this;
				if (size < /* threshold */ 100) {
					return;
				}
				const keys = this.keys();
				for (
					let index = 0;
					index < Math.floor(size * /* strong */ 0.5);
					index++
				) {
					this.delete(keys.next().value);
				}
			},
			60 * 1000 * 30,
		);
	}
	update(parent: Message, child: Message, channelId: string) {
		if (!this.has(parent.id)) {
			this.set(parent.id, [channelId, parent.id]);
		}
		const cell = this.get(parent.id)!;
		cell.indexOf(child.id) === -1 && cell.push(child.id);
		this.set(child.id, cell);
		return cell;
	}
}

export const chain_map = new Cache();
