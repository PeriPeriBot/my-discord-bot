module.exports = {
  name: 'ban',
  async execute(message, args) {
    if (!message.member.permissions.has('BanMembers')) return message.reply("❌ You don't have permission.");
    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Mention someone to ban.");
    const reason = args.slice(1).join(" ") || 'No reason provided';
    if (!target.bannable) return message.reply("❌ I can't ban that user.");
    await target.ban({ reason });
    message.channel.send(`✅ ${target.user.tag} has been banned. Reason: ${reason}`);
  }
};
