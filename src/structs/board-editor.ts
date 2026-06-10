import { ComponentType, ContainerBuilder, type ContainerComponentBuilder } from "discord.js";
import { ContainerEditor } from "./container-editor.js";
import { k } from "kompozr";
import type { BoardFieldData } from "../schemas/board.schema.js";

const DEFAULT_CONTAINER = k.container({
	color: "Yellow",
	components: ["Insira seu texto aqui."]
});

const MAX_COMPONENT_COUNT = 20;

export class BoardEditor {
	public cursor = -1;
	public containers: ContainerBuilder[] = [];
	public fields: BoardFieldData[] = [];
	public editor: ContainerEditor;

	public constructor(public name: string) {
		this.addContainer();
		this.editor = new ContainerEditor(this.selected());
	}

	public addContainer(container: ContainerBuilder = DEFAULT_CONTAINER) {
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

	public canAddComponent(componentType: ComponentType) {
		const components = this.containers
			.flatMap(c => c.components)
			.map(c => c.data.type!) as ComponentType[];
		components.push(componentType);

		const componentCount = components.reduce((acc, type) => acc + (type === ComponentType.Section ? 3 : 1), this.containers.length);
		return componentCount <= MAX_COMPONENT_COUNT;
	}

	public canAddContainer(component: ContainerBuilder = DEFAULT_CONTAINER) {
		const components = this.containers.flatMap(c => c.components);
		components.push(...component.components);

		const componentCount = components.reduce((acc, curr) => acc + (curr.data.type === ComponentType.Section ? 3 : 1), this.containers.length + 1);
		return componentCount <= MAX_COMPONENT_COUNT;
	}

	public delete() {
		this.containers.splice(this.cursor, 1);
		this.cursor = Math.max(0, this.cursor - 1);
		return this;
	}

	public clone() {
		const container = this.containers[this.cursor];
		if (container) {
			this.containers.push(new ContainerBuilder(container.toJSON()));
			this.select(this.containers.length - 1);
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
