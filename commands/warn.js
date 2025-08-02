const fs = require('fs');
const warnsPath = './warns.json';

module.exports = {
  name: 'warn',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply("❌ You don't have permission.");
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(" ") || 'No reason';
    if (!target) return message.reply("❌ Mention someone to warn.");

    let warns = {};
    if (fs.existsSync(warnsPath)) warns = JSON.parse(fs.readFileSync(warnsPath));

    if (!warns[target.id]) warns[target.id] = [];
    warns[target.id].push({ reason, date: new Date(), warnedBy: message.author.tag });

    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
    message.channel.send(`⚠️ ${target.tag} has been warned. Reason: ${reason}`);
  }
};
