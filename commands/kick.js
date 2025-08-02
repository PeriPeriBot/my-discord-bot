module.exports = {
  name: 'kick',
  async execute(message, args) {
    if (!message.member.permissions.has('KickMembers')) return message.reply("❌ You don't have permission.");
    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Mention someone to kick.");
    const reason = args.slice(1).join(" ") || 'No reason provided';
    if (!target.kickable) return message.reply("❌ I can't kick that user.");
    await target.kick(reason);
    message.channel.send(`✅ ${target.user.tag} has been kicked. Reason: ${reason}`);
  }
};
