import { ComponentType, TextDisplayBuilder, type BaseMessageOptions, type User } from "discord.js";
import { View } from "../../structs/view.js";
import type { ContainerEditor } from "../../structs/container-editor.js";
import { k, type StringSelectMenuOptionData } from "kompozr";

export type BoardEditorViewPageType = "home" | "edit-text-display";

export interface BoardEditorViewState {
	user: User;
	editor: ContainerEditor;
	page: BoardEditorViewPageType;
}

export class BoardEditorView extends View<BoardEditorViewState> {
	public render(state?: BoardEditorViewState): BaseMessageOptions {
		switch (this.state.page) {
			case "home": return this.renderHomePage();
			case "edit-text-display": return this.renderTextDisplayEditPage();
		}
	}

	private renderHomePage(): BaseMessageOptions {
		const container = this.state.editor.component;
		return { components: [container, this.prepareComponentMenu()] };
	}

	private renderTextDisplayEditPage(): BaseMessageOptions {
		const container = this.state.editor.component;
		const editContentBtn = k.button.secondary({
			cid: `bd_edit_content/${this.state.user.id}`,
			label: "Editar Conteúdo"
		});

		return { components: [container, this.prepareComponentMenu(), k.row(editContentBtn)] };
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
					return { label: `${i} Texto`, value: `${i}/text`, description: "Clique aqui para editar este texto.", default: this.state.editor.cursor == i } satisfies StringSelectMenuOptionData;
				default:
					return null;
			}
		}).filter(Boolean) as StringSelectMenuOptionData[];
	}
}
