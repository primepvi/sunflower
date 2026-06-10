import { ButtonInteraction, ComponentType, MediaGalleryBuilder, ModalBuilder, ModalSubmitInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { e } from "../../utils/emojis.js";
import { boardFieldsEmojisRecord, boardFieldTypes, type BoardFieldType } from "../../schemas/board.schema.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_field_add",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const fieldMenuOptions = boardFieldTypes.map(f => ({
			value: f,
			label: f.charAt(0).toUpperCase() + f.slice(1),
			emoji: boardFieldsEmojisRecord[f].id,
		} as StringSelectMenuOptionData));

		const fieldMenu = k.select.string({
			cid: `bd_field_add_type_menu/${interaction.user.id}`,
			max: 1,
			placeholder: "Clique aqui para selecionar o tipo do parâmetro.",
			options: fieldMenuOptions,
			min: 1,
		});

		const modal = new ModalBuilder({
			custom_id: `bd_field_add_modal`,
			title: "Adicionar Parâmetro",
		}).addLabelComponents(
			k.label({
				label: "Tipo",
				description: "Selecione aqui o tipo do parâmetro.",
				component: fieldMenu,
			}),
			k.input.short({
				cid: "key",
				label: "Identificador",
				description: "Insira aqui o identificador do parâmetro.",
				required: true,
				min: 5,
				max: 25
			}),
			k.input.short({
				cid: "label",
				label: "Nome de Exibição",
				description: "Insira aqui o nome de exibição do parâmetro.",
				required: true,
				min: 5,
				max: 40
			}),
		);

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_field_add_modal` && i.user.id === interaction.user.id;

		try {
			const response = await interaction.awaitModalSubmit({
				time: 1000 * 60,
				filter
			});

			const type = response.fields.getStringSelectValues(`bd_field_add_type_menu/${interaction.user.id}`)[0] as BoardFieldType;
			const key = response.fields.getTextInputValue(`key`);
			const label = response.fields.getTextInputValue(`label`);

			board.fields.push({ type, key, label });

			const view = new BoardEditorView({
				user: interaction.user,
				editor: board
			});

			await interaction.message.edit(view.render({
				page: "edit-fields",
				user: interaction.user,
				editor: board
			}));
		  
			await response.reply({ content: "Você adicionou o parâmetro com sucesso.", flags: ["Ephemeral"] });
		} catch (error) { console.error(error) }
	}
});
