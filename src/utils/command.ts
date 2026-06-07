import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type ApplicationCommandOptionData,
	type ApplicationCommandSubCommandData,
	type ApplicationCommandSubGroupData,
	type ChatInputCommandInteraction,
} from "discord.js";

export type CommandExecute = (interaction: ChatInputCommandInteraction) => void | Promise<void>;
export type SubcommandOptionData = Exclude<
	ApplicationCommandOptionData,
	ApplicationCommandSubGroupData | ApplicationCommandSubCommandData
>;

export interface CommandOptions {
	type: ApplicationCommandType.ChatInput;
	name: string;
	description: string;
	options?: readonly ApplicationCommandOptionData[];
	execute?: CommandExecute;
}

export interface SubcommandOptions {
	name: string;
	description: string;
	options?: readonly SubcommandOptionData[];
	execute: CommandExecute;
}

export interface SubcommandGroupOptions {
	name: string;
	description: string;
}

export function createCommand(options: Omit<CommandOptions, "type">): CommandOptions {
	return {
		type: ApplicationCommandType.ChatInput,
		...options,
	};
}

export function createSubcommand(options: SubcommandOptions) {
	return options;
}

export function createSubcommandGroup(options: SubcommandGroupOptions) {
	return options;
}

export function createSubcommandOption(subcommand: SubcommandOptions): ApplicationCommandSubCommandData {
	const option: ApplicationCommandSubCommandData = {
		type: ApplicationCommandOptionType.Subcommand,
		name: subcommand.name,
		description: subcommand.description,
	};

	if (subcommand.options)
		option.options = subcommand.options;

	return option;
}

export function createSubcommandGroupOption(
	group: SubcommandGroupOptions,
	subcommands: SubcommandOptions[],
): ApplicationCommandSubGroupData {
	return {
		type: ApplicationCommandOptionType.SubcommandGroup,
		name: group.name,
		description: group.description,
		options: subcommands.map(createSubcommandOption),
	};
}
