import { ButtonInteraction, ComponentType, MediaGalleryBuilder, ModalBuilder, ModalSubmitInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { e } from "../../utils/emojis.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_gallery_edit_image",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const component = board.editor.selected<MediaGalleryBuilder>();

		const imageOptionsMenu = component.items.map((m, i) => ({
			value: i.toString(),
			label: `${i} | Imagem`,
			emoji: e.icon_image.id,
			description: "Clique aqui para selecionar esta imagem.",
		} as StringSelectMenuOptionData));

		const imageMenu = k.select.string({
			cid: `bd_gallery_edit_image_menu/${interaction.user.id}`,
			max: 1,
			placeholder: "Clique aqui para selecionar imagens.",
			options: imageOptionsMenu,
			min: 1,
		});

		const modal = new ModalBuilder({
			custom_id: `bd_gallery_edit_image_modal`,
			title: "Editar Imagem",
		}).addLabelComponents(
			k.label({
				label: "Imagens",
				description: "Selecione aqui a imagem que será editada.",
				component: imageMenu,
			}),
			k.input.short({
				label: "Novo URL",
				description: "Insira aqui o novo URL da imagem",
				cid: "url",
				required: true
			})
		);

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_gallery_edit_image_modal` && i.user.id === interaction.user.id;

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

		const selectedImage = response.fields.getStringSelectValues(`bd_gallery_edit_image_menu/${interaction.user.id}`)[0]!;
		const newURL = response.fields.getTextInputValue("url")!;
		component.items[parseInt(selectedImage)]!.setURL(newURL);

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		});

		await interaction.message.edit(view.render());
		await response.reply({ content: "Você editou a imagem com sucesso.", flags: ["Ephemeral"] });
	}
});
