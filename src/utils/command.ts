import { ApplicationCommandType, type ChatInputCommandInteraction } from "discord.js";

export interface CommandOptions {
  name: string;
  description: string;
  execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
};

export function createCommand(options: CommandOptions) {
  return {
    type: ApplicationCommandType.ChatInput,
    ...options
  }
}
