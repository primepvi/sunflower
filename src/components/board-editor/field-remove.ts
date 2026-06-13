import { ButtonInteraction, ComponentType, MediaGalleryBuilder, ModalBuilder, ModalSubmitInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { e } from "../../utils/emojis.js";
import { boardFieldsEmojisRecord, boardFieldTypes, type BoardFieldType } from "../../schemas/board.schema.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_field_remove",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const fieldMenuOptions = board.fields.map((f, i) => ({
			value: i.toString(),
			label: f.label,
			emoji: boardFieldsEmojisRecord[f.type].id,
		} as StringSelectMenuOptionData));

		const fieldMenu = k.select.string({
			cid: `bd_field_remove_menu/${interaction.user.id}`,
			max: fieldMenuOptions.length,
			placeholder: "Clique aqui para selecionar os parâmetro a serem removidos.",
			options: fieldMenuOptions,
			min: 1,
		});

		const modal = new ModalBuilder({
			custom_id: `bd_field_remove_modal`,
			title: "Remover Parâmetros",
		}).addLabelComponents(
			k.label({
				label: "Parâmetros",
				description: "Selecione aqui os parâmetros que deseja remover.",
				component: fieldMenu,
			}),
		);

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_field_remove_modal` && i.user.id === interaction.user.id;

		const response = await interaction.awaitModalSubmit({
			time: 1000 * 60,
			filter
		}).catch(() => null);
		if (!response) {
			interaction.followUp({
				content: `O modal expirou, tente novamente.`,
				flags: ["Ephemeral"]
			});
			return;
		}

		const keys = response.fields.getStringSelectValues(`bd_field_remove_menu/${interaction.user.id}`);
		for (const key of keys)
			board.fields.splice(parseInt(key!), 1);

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		});

		await interaction.message.edit(view.render({
			page: "edit-fields",
			user: interaction.user,
			editor: board
		}));

		await response.reply({ content: "Você removeu os parâmetros com sucesso.", flags: ["Ephemeral"] });
	}
});
