import { ContainerBuilder } from "discord.js";
import { ContainerEditor } from "./container-editor.js";
import { k } from "kompozr";

export class BoardEditor {
	public cursor = -1;
	public containers: ContainerBuilder[] = [];
	public editor: ContainerEditor;

	public constructor(public name: string) {
		this.addContainer();
		this.editor = new ContainerEditor(this.selected());
	}

	public addContainer(container?: ContainerBuilder) {
		container ??= k.container({
			color: "Yellow",
			components: ["Insira seu texto aqui."]
		});

		this.containers.push(container);
		this.cursor += 1;
		return this;
	}

	public select(index: number) {
		if (index >= 0 && index < this.containers.length) {
			this.cursor = index;
			this.editor.component = this.containers[this.cursor]!;
			this.editor.cursor = -1;
		}
		return this;
	}

	public selected() { return this.containers[this.cursor]!; }

	public delete() {
		this.containers.splice(this.cursor, 1);
		this.cursor = Math.max(0, this.cursor - 1);
		return this;
	}

	public clone() {
		const container = this.containers[this.cursor];
		if (container) {
			this.containers.push(new ContainerBuilder(container.toJSON()));
			this.cursor = this.containers.length - 1;
		}

		return this;
	}

	public moveUp() {
		if (this.cursor <= 0) return this;
		const aux = this.containers[this.cursor - 1]!;
		this.containers[this.cursor - 1] = this.containers[this.cursor]!;
		this.containers[this.cursor] = aux;

		this.cursor -= 1;
		return this;
	}

	public moveDown() {
		if (this.cursor >= this.containers.length - 1) return this;

		const aux = this.containers[this.cursor + 1]!;
		this.containers[this.cursor + 1] = this.containers[this.cursor]!;
		this.containers[this.cursor] = aux;

		this.cursor += 1;
		return this;
	}

}
