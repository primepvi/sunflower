import { GatewayIntentBits } from "discord.js";
import { Bot } from "./structs/Bot.js";

export const bot = new Bot({
	token: process.env.BOT_TOKEN!,
	prefix: "s.",
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences
	]
});

bot.start();
