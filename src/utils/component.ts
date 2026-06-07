import type { ButtonInteraction, ComponentType, StringSelectMenuInteraction } from "discord.js";

export type ComponentInteraction<T extends ComponentType> = T extends ComponentType.Button ? ButtonInteraction : StringSelectMenuInteraction;

export interface ComponentOptions<T extends ComponentType = ComponentType> {
	type: T;
	name: string;
	authorOnly: boolean;
	execute: (interaction: ComponentInteraction<T>, args: string[]) => void | Promise<void>;
}

export function createComponent<T extends ComponentType>(options: ComponentOptions<T>) {
	return options;
}
