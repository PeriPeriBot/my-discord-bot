const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Open a support ticket',
  async execute(message, args, client) {
    const existingChannel = message.guild.channels.cache.find(
      c => c.name === `ticket-${message.author.username.toLowerCase()}`
    );
    if (existingChannel) {
      return message.reply('You already have an open ticket.');
    }

    let category = message.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === 4);
    if (!category) {
      try {
        category = await message.guild.channels.create({
          name: 'Tickets',
          type: 4,
        });
      } catch (err) {
        console.error(err);
        return message.reply('Could not create Tickets category.');
      }
    }

    try {
      // Get all roles that are "Management" or higher
      const staffRoles = message.guild.roles.cache
        .filter(role => role.name === 'Management' || role.position > message.guild.roles.cache.find(r => r.name === 'Management')?.position)
        .map(role => ({
          id: role.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }));

      const ticketChannel = await message.guild.channels.create({
        name: `ticket-${message.author.username.toLowerCase()}`,
        type: 0,
        parent: category.id,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: message.author.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          ...staffRoles
        ],
      });

      await ticketChannel.send(`Hello ${message.author}, thank you for opening a ticket! A staff member will be with you shortly. Use \`!close\` to close this ticket when you're done.`);
      message.reply(`Your ticket has been created: ${ticketChannel}`);
    } catch (err) {
      console.error(err);
      message.reply('There was an error creating your ticket.');
    }
  }
};
