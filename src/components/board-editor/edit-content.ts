import { ButtonInteraction, ComponentType, ModalSubmitInteraction, TextDisplayBuilder, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_edit_content",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const editor = bot.editors.get(interaction.user.id);
		if (!editor) {
			interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const index = parseInt(args[0]!);
		const component = editor.selected<TextDisplayBuilder>();

		const modal = k.modal({
			cid: `bd_edit_content_modal`,
			title: "Editar Conteúdo do Texto",
			inputs: [k.input.paragraph({
				cid: "content",
				label: "Texto",
				description: "Insira abaixo o novo conteúdo do texto:",
				required: true,
				value: component.data.content!,
				min: 1,
			})]
		});

		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_edit_content_modal` && i.user.id === interaction.user.id;

		try {
			const response = await interaction.awaitModalSubmit({
				time: 1000 * 60,
			});

			const content = response.fields.getTextInputValue("content");
			component.setContent(content);

			const view = new BoardEditorView({
				user: interaction.user,
				editor,
				page: "edit-text-display"
			});

			await interaction.message.edit(view.render());
			await response.reply({ content: "Você editou o conteudo com sucesso.", flags: ["Ephemeral"] });
		} catch {
			await interaction.followUp({ content: "Você demorou demais para editar o conteudo.", flags: ["Ephemeral"] });
		}

	}
});
