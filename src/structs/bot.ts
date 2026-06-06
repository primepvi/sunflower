import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { CommandOptions } from "../utils/command.js";

export interface BotOptions {
	intents: GatewayIntentBits[];
	token: string;
}

export class Bot extends Client {
	public commands = new Collection<string, CommandOptions>();

	public constructor({ intents, token }: BotOptions) {
		super({ intents });
		this.token = token;
	}

	public async init() {
		await this.loadCommands();
		await this.loadEvents();
		await super.login();
	}

	private async loadCommands(path = "src/commands") {
		const files = this.loadFiles(path);
		for (const file of files) {
			const { default: command } = await import(file);
			this.commands.set(command.name, command);
			console.log(`[load:command] o comando "${command.name}" foi carregado com sucesso.`);
		}
	}

	private async loadEvents(path = "src/events") {
		const files = this.loadFiles(path);
		for (const file of files) {
			const { default: event } = await import(file);
			const registerMethod = event.once ? "once" : "on";
			super[registerMethod](event.name, event.execute);
			console.log(`[load:event] o evento "${event.name}" foi carregado com sucesso.`);
		}
	}

	private loadFiles(path: string, recursive = true) {
		const files = readdirSync(path, { withFileTypes: true, recursive })
			.filter(d => d.isFile() && (d.name.endsWith(".js") || d.name.endsWith(".ts")))
			.map(d => {
				const filePath = join(d.parentPath, d.name);
				const url = pathToFileURL(filePath);
				return fileURLToPath(url);
			});

		return files;
	}
}
