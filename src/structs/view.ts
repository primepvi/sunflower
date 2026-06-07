import { MessageFlags, type AnySelectMenuInteraction, type BaseMessageOptions, type ButtonInteraction, type ChatInputCommandInteraction, type InteractionReplyOptions } from "discord.js";

export type ViewInteraction = ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction;

export abstract class View<T> {
	protected state: T;

	public constructor(initialState: T) {
		this.state = initialState;
	}

	public setState(newState: Partial<T>) {
		this.state = { ...this.state, ...newState };
	}

	public abstract render(state?: T): BaseMessageOptions;

	public async open(interaction: ViewInteraction, ephemeral = false) {
		const flags = ephemeral ? [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] : [MessageFlags.IsComponentsV2];
		const options = { ...this.render(this.state), flags } as InteractionReplyOptions;
		await interaction.reply(options);
	}

	public async update(interaction: ButtonInteraction | AnySelectMenuInteraction) {
		await interaction.update!(this.render(this.state));
	}
}
