import { ButtonInteraction, ComponentType, MediaGalleryBuilder, MediaGalleryItemBuilder, ModalSubmitInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_gallery_add_image",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const component = board.editor.selected<MediaGalleryBuilder>();

		const modal = k.modal({
			cid: `bd_gallery_add_image_modal`,
			title: "Adicionar Imagem",
			inputs: [k.input.short({
				cid: "url",
				label: "URL",
				description: "Insira abaixo a url da imagem:",
				required: true,
				min: 1,
			})]
		});

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_gallery_add_image_modal` && i.user.id === interaction.user.id;

		try {
			const response = await interaction.awaitModalSubmit({
				time: 1000 * 60,
				filter
			});

			const url = response.fields.getTextInputValue("url");
			component.addItems(new MediaGalleryItemBuilder().setURL(url));

			const view = new BoardEditorView({
				user: interaction.user,
				editor: board
			});

			await interaction.message.edit(view.render());
			await response.reply({ content: "Você adicionou a imagem com sucesso.", flags: ["Ephemeral"] });
		} catch (error) { console.error(error) }
	}
});
