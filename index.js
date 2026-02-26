const { Client } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [],
});

client.once('ready', () => {
    console.log('Bot activated');
});

client.login(process.env.DISCORD_BOT_TOKEN);