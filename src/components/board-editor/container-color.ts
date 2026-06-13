import { ButtonInteraction, ComponentType, LabelBuilder, ModalBuilder, ModalSubmitInteraction, SectionBuilder, TextDisplayBuilder, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { e } from "../../utils/emojis.js";

const colors = {
	blue: "#5865F2",
	grey: "#99AAB5",
	green: "#57F287",
	red: "#ED4245",
	yellow: "#FEE75C",
	purple: "#9B59B6",
	pink: "#E91E63",
	orange: "#E67E22",
	aqua: "#1ABC9C",
	white: "#FFFFFF",
	black: "#23272A",
	indigo: "#6366F1",
	cyan: "#06B6D4",
	emerald: "#10B981",
	amber: "#F59E0B",
	rose: "#F43F5E",
};

export default createComponent({
	type: ComponentType.Button,
	name: "bd_container_color",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const colorsMenuOptions = Object.keys(colors).map(name => ({
			value: colors[name as keyof typeof colors],
			label: name.charAt(0).toUpperCase() + name.slice(1),
			emoji: e[`icon_color_${name}` as keyof typeof e].id,
			description: "Clique aqui para selecionar esta cor.",
			default: name === "yellow"
		} as StringSelectMenuOptionData));

		const colorsMenu = k.select.string({
			cid: `bd_container_color_menu/${interaction.user.id}`,
			max: 1,
			placeholder: "Clique aqui para selecionar uma cor.",
			options: colorsMenuOptions,
			min: 1,
		});

		const modal = new ModalBuilder({
			custom_id: `bd_container_color_modal`,
			title: "Cor do Container",
		}).addLabelComponents(
			k.label({
				label: "Predefinição de Cor",
				description: "Selecione aqui uma predefinição de cor",
				component: colorsMenu,
			}),
			k.input.short({
				cid: "hex_color",
				label: "Código Hex",
				description: "Insira abaixo o código hex da cor:",
				min: 4,
				max: 7,
				required: false,
			})
		);


		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_container_color_modal` && i.user.id === interaction.user.id;

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

		const selectedColorPreset = response.fields.getStringSelectValues(`bd_container_color_menu/${interaction.user.id}`)[0]!;
		const hexColor = response.fields.getTextInputValue("hex_color");
		board.select(board.cursor);
		board.editor.setColor(hexColor || selectedColorPreset);

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		});

		await interaction.message.edit(view.render());
		await response.reply({ content: "Você editou a cor do container com sucesso.", flags: ["Ephemeral"] });
	}
});

