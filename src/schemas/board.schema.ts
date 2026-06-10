import type { APIContainerComponent } from "discord.js";
import { Schema, model } from "mongoose";
import { e } from "../utils/emojis.js";
import type { KompozrEmoji } from "kompozr";

export type BoardFieldType = "user" | "channel" | "role" | "text" | "checkbox";
export const boardFieldTypes = ["user", "channel", "role", "text", "checkbox"] as const satisfies readonly BoardFieldType[];
export const boardFieldsEmojisRecord: Record<BoardFieldType, KompozrEmoji> = {
	user: e.icon_user,
	role: e.icon_mention,
	channel: e.icon_hashtag,
	text: e.icon_text_display,
	checkbox: e.icon_ok
};

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
	type: { type: String, enum: boardFieldTypes, required: true },
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
