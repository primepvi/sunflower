import { Client, Collection, GatewayIntentBits, type ChatInputCommandInteraction } from "discord.js";
import {
	createSubcommandGroupOption,
	createSubcommandOption,
	type CommandExecute,
	type CommandOptions,
	type SubcommandGroupOptions,
	type SubcommandOptions,
} from "../utils/command.js";
import mongoose from "mongoose";
import type { ComponentOptions } from "../utils/component.js";
import { FileLoader } from "./file-loader.js";
import type { EventOptions } from "../utils/event.js";

export interface BotOptions {
	intents: GatewayIntentBits[];
	token: string;
}

export class Bot extends Client {
	public commands = new Collection<string, CommandOptions>();
	public commandHandlers = new Collection<string, CommandExecute>();
	public components = new Collection<string, ComponentOptions>();
	private fileLoader = new FileLoader();

	public constructor({ intents, token }: BotOptions) {
		super({ intents });
		this.token = token;
	}

	public async init() {
		await this.loadComponents();
		await this.loadCommands();
		await this.loadEvents();
		await this.connectToDatabase();
		await super.login();
	}

	private async connectToDatabase() {
		try {
			await mongoose.connect(process.env.DATABASE_URL!);
			console.log("[loader:database] database conectada com sucesso.");
		} catch {
			console.log("[loader:database] não foi possível conectar a database.");
		}
	}

	private async loadComponents(path = "src/components") {
		const files = this.fileLoader.loadFiles(path);
		for (const file of files) {
			const component = await this.fileLoader.importDefault<ComponentOptions>(file);
			this.components.set(component.name, component);
			console.log(`[load:component] o componente "${component.name}" foi carregado com sucesso.`);
		}
	}

	private async loadCommands(path = "src/commands") {
		const commandRoots = this.fileLoader.getCommandRoots(path);

		for (const commandRoot of commandRoots) {
			await this.loadCommandRoot(commandRoot);
		}
	}

	private async loadEvents(path = "src/events") {
		const files = this.fileLoader.loadFiles(path);
		for (const file of files) {
			const event = await this.fileLoader.importDefault<EventOptions<any>>(file);
			const registerMethod = event.once ? "once" : "on";
			super[registerMethod](event.name, event.execute);
			console.log(`[load:event] o evento "${event.name}" foi carregado com sucesso.`);
		}
	}

	private async loadCommandRoot(path: string) {
		const indexFile = this.fileLoader.getIndexFile(path);
		if (!indexFile)
			return;

		const command = await this.fileLoader.importDefault<CommandOptions>(indexFile);
		const subcommands = await this.loadSubcommands(path, command.name);
		const groups = await this.loadSubcommandGroups(path, command.name);
		const options = [
			...subcommands.map(createSubcommandOption),
			...groups,
		];

		const loadedCommand = options.length ? { ...command, options } : command;
		this.commands.set(command.name, loadedCommand);

		if (command.execute)
			this.commandHandlers.set(command.name, command.execute);

		console.log(`[load:command] o comando "${command.name}" foi carregado com sucesso.`);
	}

	private async loadSubcommands(path: string, commandName: string) {
		const subcommands: SubcommandOptions[] = [];

		for (const file of this.fileLoader.loadDirectFiles(path).filter(file => !this.fileLoader.isIndexFile(file))) {
			const subcommand = await this.fileLoader.importDefault<SubcommandOptions>(file);
			const key = this.createCommandHandlerKey(commandName, undefined, subcommand.name);
			this.commandHandlers.set(key, subcommand.execute);
			subcommands.push(subcommand);
			console.log(`[load:subcommand] o subcomando "${key}" foi carregado com sucesso.`);
		}

		return subcommands;
	}

	private async loadSubcommandGroups(path: string, commandName: string) {
		const groups: ReturnType<typeof createSubcommandGroupOption>[] = [];

		for (const directory of this.fileLoader.loadDirectDirectories(path)) {
			const groupIndex = this.fileLoader.getIndexFile(directory);
			if (!groupIndex)
				continue;

			const group = await this.fileLoader.importDefault<SubcommandGroupOptions>(groupIndex);
			const subcommands: SubcommandOptions[] = [];

			for (const file of this.fileLoader.loadDirectFiles(directory).filter(file => !this.fileLoader.isIndexFile(file))) {
				const subcommand = await this.fileLoader.importDefault<SubcommandOptions>(file);
				const key = this.createCommandHandlerKey(commandName, group.name, subcommand.name);
				this.commandHandlers.set(key, subcommand.execute);
				subcommands.push(subcommand);
				console.log(`[load:subcommand] o subcomando "${key}" foi carregado com sucesso.`);
			}

			groups.push(createSubcommandGroupOption(group, subcommands));
			console.log(`[load:subcommand-group] o grupo "${commandName}/${group.name}" foi carregado com sucesso.`);
		}

		return groups;
	}

	public getCommandHandler(interaction: ChatInputCommandInteraction) {
		const group = interaction.options.getSubcommandGroup(false) ?? undefined;
		const subcommand = interaction.options.getSubcommand(false) ?? undefined;
		const key = this.createCommandHandlerKey(interaction.commandName, group, subcommand);

		return this.commandHandlers.get(key);
	}

	private createCommandHandlerKey(command: string, group?: string, subcommand?: string) {
		return [command, group, subcommand].filter(Boolean).join("/");
	}
}
