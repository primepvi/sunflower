import type { Message } from "discord.js";
import { createCommand } from "../../utils/create-command.js";
import { bot } from "../../bot.js";
import { emojis } from "../../utils/emojis.js";

export default createCommand({
	name: "ping",
	aliases: [],
	execute(message: Message, args: string[]) {
	  return message.reply(`> ${emojis.icon_pong} **| Pong!** ${message.author}, minha **latência** atual é de **${bot.ws.ping} ms**.`);
	}
});
