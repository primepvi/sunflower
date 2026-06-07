import type { APIContainerComponent } from "discord.js";
import { Schema, model } from "mongoose";

export type BoardFieldType = "user" | "channel" | "role" | "string" | "number";

export interface BoardFieldData {
	key: string;
	label: string;
	type: BoardFieldType;
};

export interface BoardData {
	name: string;
	fields: BoardFieldData[];
	guildId: string;
	containers: APIContainerComponent[];
};

const boardFieldSchema = new Schema<BoardFieldData>({
	key: { type: String, required: true },
	label: { type: String, required: true },
	type: { type: String, enum: ["user", "channel", "role", "string", "number"], required: true },
}, { _id: false })

const boardSchema = new Schema<BoardData>({
	name: { type: String, required: true },
	fields: { type: [boardFieldSchema], default: [] },
	guildId: { type: String, required: true },
	// @ts-ignore
	containers: { type: [Schema.Types.Mixed], default: [] }
});

boardSchema.index({ guildId: 1, name: 1 }, { unique: true });
export const Board = model<BoardData>("boards", boardSchema);
