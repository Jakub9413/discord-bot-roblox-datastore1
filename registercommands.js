const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
	console.error('Missing required environment variables: DISCORD_BOT_TOKEN and/or DISCORD_CLIENT_ID.');
	process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) command(s).`);

		if (guildId) {
			const data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);

			console.log(`Successfully reloaded ${data.length} guild application (/) command(s).`);
		} else {
			const data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);

			console.log(`Successfully reloaded ${data.length} global application (/) command(s).`);
		}
	} catch (error) {
		console.error(error);
	}
})();
