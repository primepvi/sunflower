import { Client, GatewayIntentBits } from "discord.js";
import path from "node:path";
import { readdirSync } from "node:fs";
import type { EventData } from "../utils/create-event.js";

export interface BotConfig {
	token: string;
	prefix: string;
	intents: GatewayIntentBits[];
};

export class Bot extends Client {
	public declare token: string;
	public prefix: string;

	public constructor(config: BotConfig) {
		super({ intents: config.intents });

		this.token = config.token;
		this.prefix = config.prefix;
	}

	public async start() {
		await this.loadEvents();
		await super.login(this.token);
	}

	private async loadEvents() {
		const files = readdirSync("src/events", { recursive: true, withFileTypes: true })
			.filter(d => d.isFile() && d.name.endsWith(".ts"));

		for (const file of files) {
			const filePath = path.resolve(file.parentPath, file.name);
			const { default: event } = (await import(filePath)) as { default: EventData };

			const registerMethod = event.once ? "once" : "on";
			super[registerMethod](event.name, event.execute);
			console.log(`Event ${event.name} was loaded.`);
		}
	}
}
