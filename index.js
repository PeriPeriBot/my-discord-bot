const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // Needed for join/leave events
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

// Interaction (Modal) Handling for Tickets
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


// 🎉 Welcome Embed System
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(
    ch => ch.name === 'main-chat' && ch.isTextBased()
  );

  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle('🍗 Welcome to PeriPeri | Chicken Grill!')
    .setDescription(`Hey <@${member.id}>! We're glad to have you here.\n\n**📜 Don’t forget to check out the #guidelines channel to help us keep things respectful and friendly.**`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: 'Enjoy your stay!', iconURL: member.guild.iconURL() })
    .setTimestamp();

  const sentMsg = await channel.send({ embeds: [welcomeEmbed] });

  try {
    await sentMsg.react('👋');
    await sentMsg.react('🔥');
    await sentMsg.react('🍗');
  } catch (error) {
    console.error('Failed to react to welcome message:', error);
  }
});


// 👋 Goodbye Embed System
client.on('guildMemberRemove', async member => {
  const channel = member.guild.channels.cache.find(
    ch => ch.name === 'main-chat' && ch.isTextBased()
  );

  if (!channel) return;

  const goodbyeEmbed = new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('👋 A Member Has Left')
    .setDescription(`We’re sad to see <@${member.id}> go.\n\n**Thanks for being a part of PeriPeri | Chicken Grill. We hope to see you again someday!**`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: 'Farewell from the PeriPeri Team!', iconURL: member.guild.iconURL() })
    .setTimestamp();

  const sentMsg = await channel.send({ embeds: [goodbyeEmbed] });

  try {
    await sentMsg.react('😢');
    await sentMsg.react('👋');
  } catch (error) {
    console.error('Failed to react to goodbye message:', error);
  }
});

client.login(config.token);
