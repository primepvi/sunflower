import type { Message } from "discord.js";


export type CommandFlags = Record<string, string | boolean>;
export interface CommandData {
	name: string;
	aliases: string[];
	execute(message: Message, args: string[], flags: CommandFlags): Promise<unknown> | unknown;
}

export function createCommand(data: CommandData): CommandData {
	return data;
}
