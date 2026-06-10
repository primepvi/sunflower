import { ComponentType, ContainerBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";
import type { BoardData, BoardFieldType } from "../schemas/board.schema.js";

export interface BoardValidatorResponse {
	error: boolean;
	message?: string;
};

const fieldValidProperties: Record<BoardFieldType, string[]> = {
	user: ["name", "id"],
	channel: ["name", "id"],
	role: ["name", "id"],
	text: [],
	checkbox: []
};

export class BoardValidator {
	private containerIndex = -1;
	private containerComponentIndex = -1;

	public constructor(private board: BoardData) { }
	public validate(): BoardValidatorResponse[] {
		return this.board.containers.flatMap((rawContainer, i) => {
			const container = new ContainerBuilder(rawContainer);
			this.containerIndex = i;
			return this.validateFieldsUsage(container);
		}).filter(response => response.error);
	}

	private validateFieldsUsage(container: ContainerBuilder): BoardValidatorResponse[] {
		const responses: BoardValidatorResponse[] = [];

		this.containerComponentIndex = 0;
		for (const component of container.components) {
			switch (component.data.type) {
				case ComponentType.TextDisplay: {
					const response = this.validateTextDisplay(component as TextDisplayBuilder);
					responses.push(response);
					break;
				}

				case ComponentType.Section: {
					const response = this.validateSection(component as SectionBuilder);
					responses.push(response);
					break;
				}
				default: responses.push({ error: false });
			}

			this.containerComponentIndex++;
		}

		return responses;
	}

	private validateTextDisplay(component: TextDisplayBuilder): BoardValidatorResponse {
		const content = component.data.content!;
		const interpolations = content.matchAll(/\{\{(.*?)\}\}/g).toArray();
		for (const interpolationData of interpolations) {
			const interpolation = interpolationData[1]!;
			const [fieldName, fieldProperty, ..._rest] = interpolation.split(".") as [string, string?, string[]?];
			const fieldData = this.board.fields.find(f => f.key === fieldName.toLowerCase());
			if (!fieldData) {
				return { error: true, message: `O parâmetro "${fieldName}" utilizado no componente "${this.containerComponentIndex} | Texto" do "${this.containerIndex} | Container" não foi encontrado no board "${this.board.name}".` }
			}

			const fieldProperties = fieldValidProperties[fieldData.type];
			if (fieldProperty && !fieldProperties.includes(fieldProperty)) {
				return { error: true, message: `O parâmetro "${fieldName}" não possui a propriedade "${fieldProperty}" que foi acessada no componente "${this.containerComponentIndex} | Texto" do "${this.containerIndex} | Container" em board "${this.board.name}".` }
			}
		}

		return { error: false };
	}

	private validateSection(component: SectionBuilder): BoardValidatorResponse {
		const textComponent = component.components[0] as TextDisplayBuilder;
		const response = this.validateTextDisplay(textComponent);
		if (!response.error) return { error: false };
		else return { error: true, message: response.message.replace("| Texto", "| Seção") }
	}
}
