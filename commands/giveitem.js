const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveitem')
        .setDescription('Gives an item to a user')
        .addIntegerOption(option =>
            option.setName('itemid')
                .setDescription('The ID of the item to give')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('userid')
                .setDescription('The ID of the user to give the item to')
                .setRequired(true)),
    async execute(interaction) {
        const itemId = interaction.options.getInteger('itemid');
        const userId = interaction.options.getInteger('userid');

        const endpoint = `https://apis.roblox.com/datastores/v1/universes/${process.env.UNIVERSE_ID}/standard-datastores/datastore/entries/entry`;
        const requestConfig = {
            params: {
                datastoreName: 'playerItems',
                entryKey: userId.toString(),
            },
            headers: {
                'x-api-key': process.env.ROBLOX_CLOUD_API_TOKEN,
                'content-type': 'application/json',
            },
        };

        let currentItems = [];

        try {
            const response = await axios.get(endpoint, requestConfig);
            const rawValue = response.data?.value ?? response.data;

            if (Array.isArray(rawValue)) {
                currentItems = rawValue;
            } else if (typeof rawValue === 'string') {
                const trimmed = rawValue.trim();

                if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                    currentItems = trimmed
                        .slice(1, -1)
                        .split(',')
                        .map((part) => part.trim())
                        .filter((part) => part.length > 0)
                        .map((part) => Number(part))
                        .filter((num) => Number.isFinite(num));
                } else {
                    const parsed = JSON.parse(trimmed);
                    currentItems = Array.isArray(parsed) ? parsed : [];
                }
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Failed to fetch existing datastore entry:', error.response?.data || error.message);
                await interaction.reply({
                    content: 'Could not read the existing datastore entry.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        const normalizedItems = currentItems
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value));

        const itemAlreadyExists = normalizedItems.includes(itemId);
        const updatedItems = itemAlreadyExists ? normalizedItems : [...normalizedItems, itemId];

        try {
            await axios.post(
                endpoint,
                updatedItems,
                requestConfig,
            );
        } catch (writeError) {
            await axios.post(
                endpoint,
                { value: updatedItems },
                requestConfig,
            );
        }

        const asCurlySet = `{${updatedItems.join(',')}}`;
        await interaction.reply({
            content: itemAlreadyExists
                ? `Item ${itemId} was already in user ${userId}'s items: ${asCurlySet}`
                : `Added item ${itemId} for user ${userId}. New items: ${asCurlySet}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};