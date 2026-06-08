import { ComponentType, TextDisplayBuilder, type BaseMessageOptions, type User } from "discord.js";
import { View } from "../../structs/view.js";
import type { ContainerEditor } from "../../structs/container-editor.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { e } from "../../utils/emojis.js";

export type BoardEditorViewPageType = "home" | "edit-text-display" | "edit-separator" | "edit-section";

export interface BoardEditorViewState {
	user: User;
	editor: ContainerEditor;
}

export class BoardEditorView extends View<BoardEditorViewState> {
	public render(state?: BoardEditorViewState): BaseMessageOptions {
		switch (this.ensureCurrentPage()) {
			case "home": return this.renderHomePage();
			case "edit-section":
			case "edit-text-display": return this.renderTextDisplayEditPage();
			case "edit-separator": return this.renderSeparatorEditPage();
		}
	}

	private ensureCurrentPage(): BoardEditorViewPageType {
		const component = this.state.editor
			.selected();

		switch (component?.data?.type) {
			case ComponentType.TextDisplay: return "edit-text-display";
			case ComponentType.Separator: return "edit-separator";
			case ComponentType.Section: return "edit-section";
			default: return "home";
		}
	}

	private renderHomePage(): BaseMessageOptions {
		const container = this.state.editor.component;
		const addTextBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/text`,
			label: "Adicionar Texto",
			emoji: e.icon_text_display
		});

		const addSeparatorBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/separator`,
			label: "Adicionar Separador",
			emoji: e.icon_separator
		});

		return { components: [container, this.prepareComponentMenu(), k.row(addTextBtn, addSeparatorBtn)] };
	}

	private renderTextDisplayEditPage(): BaseMessageOptions {
		const container = this.state.editor.component;
		const editContentBtn = k.button.secondary({
			cid: `bd_edit_content/${this.state.user.id}`,
			label: "Editar Conteúdo",
			emoji: e.icon_edit_text
		});

		const editThumbnailBtn = k.button.secondary({
			cid: `bd_edit_thumbnail/${this.state.user.id}`,
			label: "Editar Thumbnail",
			emoji: e.icon_image
		});

		return { components: [container, this.prepareComponentMenu(), k.row(editContentBtn, editThumbnailBtn), this.prepareComponentActions()] };
	}

	private renderSeparatorEditPage(): BaseMessageOptions {
		const container = this.state.editor.component;
		const toggleVisibilityBtn = k.button.secondary({
			cid: `bd_edit_separator/${this.state.user.id}/visibility`,
			label: "Mudar Visibilidade",
			emoji: e.icon_opacity
		});

		const toggleSpacingBtn = k.button.secondary({
			cid: `bd_edit_separator/${this.state.user.id}/spacing`,
			label: "Mudar Espaçamento",
			emoji: e.icon_spacing
		});

		return { components: [container, this.prepareComponentMenu(), k.row(toggleVisibilityBtn, toggleSpacingBtn), this.prepareComponentActions()] };
	}

	private prepareComponentActions() {
		const deleteBtn = k.button.secondary({
			cid: `bd_delete_component/${this.state.user.id}`,
			label: "Deletar",
			disabled: this.state.editor.component.components.length <= 1,
			emoji: e.icon_trash.toString()
		});

		const moveUpBtn = k.button.secondary({
			cid: `bd_move_component/${this.state.user.id}/up`,
			disabled: this.state.editor.cursor <= 0,
			emoji: e.icon_up.toString()
		});

		const moveDownBtn = k.button.secondary({
			cid: `bd_move_component/${this.state.user.id}/down`,
			disabled: this.state.editor.cursor >= this.state.editor.component.components.length - 1,
			emoji: e.icon_down.toString()
		});

		const cloneBtn = k.button.secondary({
			cid: `bd_clone_component/${this.state.user.id}`,
			label: "Clonar",
			emoji: e.icon_clone
		});

		const homeBtn = k.button.secondary({
			cid: `bd_home/${this.state.user.id}`,
			label: "Menu",
			emoji: e.icon_home
		});

		return k.row(moveUpBtn, moveDownBtn, deleteBtn, cloneBtn, homeBtn);
	}

	private prepareComponentMenu() {
		const componentMenu = k.select.string({
			cid: `bd_component_menu/${this.state.user.id}`,
			options: this.prepareComponentMenuOptions()
		});

		return componentMenu;
	}

	private prepareComponentMenuOptions(): StringSelectMenuOptionData[] {
		const container = this.state.editor.component;
		return container.components.map((c, i) => {
			switch (c.data.type) {
				case ComponentType.TextDisplay:
					return { label: `${i} | Texto`, value: `${i}/text`, description: "Clique aqui para editar este texto.", default: this.state.editor.cursor == i, emoji: e.icon_text_display } satisfies StringSelectMenuOptionData;
				case ComponentType.Separator:
					return { label: `${i} | Separador`, value: `${i}/separator`, description: "Clique aqui para editar este separador.", default: this.state.editor.cursor == i, emoji: e.icon_separator } satisfies StringSelectMenuOptionData;
				case ComponentType.Section:
					return { label: `${i} | Seção`, value: `${i}/section`, description: "Clique aqui para editar esta seção.", default: this.state.editor.cursor == i, emoji: e.icon_section } satisfies StringSelectMenuOptionData;
				default:
					return null;
			}
		}).filter(Boolean) as StringSelectMenuOptionData[];
	}
}
