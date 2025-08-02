const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Command handler
client.on('messageCreate', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command.');
  }
});

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionsBitField
} = require('discord.js');

client.on('interactionCreate', async interaction => {
  // Log Ticket Button
  if (interaction.isButton() && interaction.customId === 'log') {
    const modal = new ModalBuilder()
      .setCustomId('logTicketModal')
      .setTitle('Log Ticket');

    const roleInput = new TextInputBuilder()
      .setCustomId('roleInput')
      .setLabel('Your Role')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const logsRoleInput = new TextInputBuilder()
      .setCustomId('logsRoleInput')
      .setLabel('Logs Role')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reasonInput')
      .setLabel('Reason for ticket')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const proofInput = new TextInputBuilder()
      .setCustomId('proofInput')
      .setLabel('Proof (link or description)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const modalComponents = [
      new ActionRowBuilder().addComponents(roleInput),
      new ActionRowBuilder().addComponents(logsRoleInput),
      new ActionRowBuilder().addComponents(reasonInput),
      new ActionRowBuilder().addComponents(proofInput)
    ];

    modal.addComponents(...modalComponents);
    await interaction.showModal(modal);
  }

  // Modal Submission Handling
  if (interaction.isModalSubmit() && interaction.customId === 'logTicketModal') {
    const role = interaction.fields.getTextInputValue('roleInput');
    const logsRole = interaction.fields.getTextInputValue('logsRoleInput');
    const reason = interaction.fields.getTextInputValue('reasonInput');
    const proof = interaction.fields.getTextInputValue('proofInput');

    const guild = client.guilds.cache.first(); // or use your server ID to be more specific
    const logsChannel = guild.channels.cache.find(c => c.name === 'ticket-logs');

    if (!logsChannel) {

      return interaction.reply({ content: 'Ticket logs channel not found.', ephemeral: true });
    }

    const embed = {
      color: 0x3498db,
      title: '🎟️ Ticket Logged',
      fields: [
        { name: 'Role', value: role, inline: true },
        { name: 'Logs Role', value: logsRole, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Proof', value: proof || 'No proof provided.' }
      ],
      timestamp: new Date(),
      footer: {
        text: `Logged by ${interaction.user.tag}`,
        icon_url: interaction.user.displayAvatarURL()
      }
    };

    await logsChannel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Ticket logged to #ticket-logs.', ephemeral: true });
  }
});

client.login(config.token);
