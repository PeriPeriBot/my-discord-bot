require('dotenv').config(); 

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
// Remove the next line if you move prefix to hardcoded or .env
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Command handler
client.on('messageCreate', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return; // Using config.prefix here

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

// Interaction handling (modal/ticket system)
// ... your unchanged modal/ticket code here ...

// Welcome message code here...

// Goodbye message code here...

// Login with token from .env
client.login(process.env.DISCORD_TOKEN);
