import { Board, type BoardData } from "../schemas/board.js";

export interface BoardManagerCreateInput {
	guildId: string;
	name: string;
}

export interface BoardManagerGetInput {
	guildId: string;
	name: string;
}

export class BoardManager {
	public async create({ guildId, name }: BoardManagerCreateInput) {
		const existing = await Board.findOne({ guildId, name });
		if (existing) return existing;

		return await Board.create({
			guildId,
			name
		});
	}

	public async get({ guildId, name }: BoardManagerGetInput): Promise<BoardData | null> {
		const board = await Board.findOne({ guildId, name });
		if (!board) return null;
		return board.toObject();
	}
}


