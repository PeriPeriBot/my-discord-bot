const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const checkPermission = require('../utils/permissions');

module.exports = {
  name: 'close',
  description: 'Close the current ticket',
  async execute(message, args, client) {
    try {
      // Check user permission
      const allowed = checkPermission(message.member, 'Management');
      if (!allowed) {
        return message.reply("You don't have permission to use this command.");
      }

      // Check if inside a ticket channel
      if (!message.channel.name.startsWith('ticket-')) {
        return message.reply("You can only use this command inside a ticket channel.");
      }

      // Find the user from the channel name (assuming channel name ends with username)
      const user = message.guild.members.cache.find(m =>
        message.channel.name.endsWith(m.user.username.toLowerCase())
      );

      // Delete the ticket channel
      await message.channel.delete();

      // Send DM buttons to user who opened the ticket
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('transcript')
          .setLabel('📄 Ticket Transcript')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('report')
          .setLabel('🚨 Report Issue')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('log')
          .setLabel('📋 Log Ticket')
          .setStyle(ButtonStyle.Primary)
      );

      if (user) {
        await user.send({
          content: 'Your ticket has been closed. What would you like to do next?',
          components: [row],
        });
      }
    } catch (error) {
      console.error('[close] Error:', error);
      if (!message.deleted) {
        message.reply('Failed to close the ticket.');
      }
    }
  },
};
