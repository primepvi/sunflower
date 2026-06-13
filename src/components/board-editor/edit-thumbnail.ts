import { ButtonInteraction, ComponentType, ModalSubmitInteraction, SectionBuilder, TextDisplayBuilder, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_edit_thumbnail",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const component = board.editor.selected<TextDisplayBuilder | SectionBuilder>();

		const modal = k.modal({
			cid: `bd_edit_thumbnail_modal`,
			title: "Editar Thumbnail",
			inputs: [k.input.short({
				cid: "url",
				label: "URL",
				description: "Insira abaixo a url da imagem:",
				required: true,
				min: 1,
			})]
		});

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_edit_thumbnail_modal` && i.user.id === interaction.user.id;


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

		const url = response.fields.getTextInputValue("url");
		if (component.data.type === ComponentType.TextDisplay) {
			board.editor.delete();
			board.editor.addSection(component.data.content!, k.thumbnail({
				url
			}));
		} else if (component.data.type === ComponentType.Section) {
			(component as SectionBuilder).setThumbnailAccessory(k.thumbnail({
				url
			}));
		}

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		});

		await interaction.message.edit(view.render());
		await response.reply({ content: "Você editou a thumbnail com sucesso.", flags: ["Ephemeral"] });

	}
});
