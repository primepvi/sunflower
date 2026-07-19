export interface UserModel {
  id: string;
}

export interface GuildModel {
  id: string;
  coinName: string;
  coinEmoji: string;
}

export interface GuildMemberModel {
  userId: string;
  guildId: string;
  coins: number;
}
