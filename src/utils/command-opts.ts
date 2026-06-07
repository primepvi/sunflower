import { ApplicationCommandOptionType, type ApplicationCommandStringOptionData } from "discord.js";

export interface StringCommandOption {
  name: string;
  description: string;
  required: boolean;
}

export const opts = {
  string({ name, description, required = false }: StringCommandOption): ApplicationCommandStringOptionData {
    return { type: ApplicationCommandOptionType.String, name, description, required };
  }
};
