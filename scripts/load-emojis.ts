import type { APIApplicationEmoji } from "discord.js";
import { writeFileSync } from "node:fs";

const DISCORD_API_URL = "https://discord.com/api/v10";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_APP_ID = process.env.DISCORD_APP_ID;

interface ApplicationEmojisPayload {
  items: Array<APIApplicationEmoji>
}

if (!DISCORD_BOT_TOKEN || !DISCORD_APP_ID) {
	console.error("Invalid environment variables was provided.");
	process.exit(1);
}

const response = await fetch(`${DISCORD_API_URL}/applications/${DISCORD_APP_ID}/emojis`, {
	headers: {
		Authorization: `Bot ${DISCORD_BOT_TOKEN}`
	}
});

const data = (await response.json()) as ApplicationEmojisPayload;

if (!response.ok) {
	console.error(`Cannot get application emojis.\nError: ${data}`)
	process.exit(1);
}

const emojiMap = Object.create({});

for (const emoji of data.items) {
  emojiMap[emoji.name] = {
    id: emoji.id,
    name: emoji.name,
    animated: emoji.animated
  };
}

writeFileSync("emojis.json", JSON.stringify(emojiMap, null, 2), "utf8");

console.log(`${data.items.length} emojis was loaded.`);

