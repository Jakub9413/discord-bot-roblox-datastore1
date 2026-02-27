const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('listitems')
    .setDescription('Lists all item IDs available to be given'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Available Item IDs')
            .setDescription('Existing item IDs')
            .addFields(
                { name: 'Sword', value: 'ID: 1' },
                { name: 'Bloxy Cola', value: 'ID: 2' },
                { name: 'Pizza', value: 'ID: 3' },
            )
            .setColor(0x00AE86)

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
}