import { Client, Collection, GatewayIntentBits } from "discord.js";
import path from "node:path";
import { readdirSync } from "node:fs";
import type { EventData } from "../utils/create-event.js";
import type { CommandData } from "../utils/create-command.js";
import type { SubCommandData } from "../utils/create-subcommand.js";
import { TwinDB } from "twin-db";

export interface BotConfig {
	token: string;
	prefix: string;
	intents: GatewayIntentBits[];
};

export class Bot extends Client {
	public declare token: string;
	public prefix: string;
	public commands: Collection<string, CommandData> = new Collection();
	public subCommands: Collection<string, SubCommandData> = new Collection();
	public db = new TwinDB("database/db.json");

	public constructor(config: BotConfig) {
		super({ intents: config.intents });

		this.token = config.token;
		this.prefix = config.prefix;
	}

	public async start() {
		await this.loadCommands();
		await this.loadSubCommands();
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

	private async loadCommands() {
		const files = readdirSync("src/commands", { recursive: true, withFileTypes: true })
			.filter(d => d.isFile() && d.name.endsWith(".command.ts"));

		for (const file of files) {
			const filePath = path.resolve(file.parentPath, file.name);
			const { default: command } = (await import(filePath)) as { default: CommandData };

			this.commands.set(command.name, command);
			console.log(`Command ${command.name} was loaded.`);
		}
	}

	private async loadSubCommands() {
		const files = readdirSync("src/commands", { recursive: true, withFileTypes: true })
			.filter(d => d.isFile() && d.name.endsWith(".subcommand.ts"));

		for (const file of files) {
			const filePath = path.resolve(file.parentPath, file.name);
			const { default: command } = (await import(filePath)) as { default: SubCommandData };

			this.subCommands.set(`${command.parent}_${command.name}`, command);
			console.log(`SubCommand ${command.name} of Command ${command.parent} was loaded.`);
		}
	}
}
