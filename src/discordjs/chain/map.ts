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
					this.delete(keys.next().value!);
				}
			},
			60 * 1000 * 30,
		);
	}
	update(parent: Message, child: Message, channelId: string) {
		if (this.has(parent.id)) {
			return;
		}
		if (!this.has(child.id)) {
			this.set(child.id, [channelId, child.id]);
		}
		const cell = this.get(child.id)!;
		cell.indexOf(parent.id) === -1 && cell.push(parent.id);
		this.set(parent.id, cell);
		return cell;
	}
}

export const chain_map = new Cache();
