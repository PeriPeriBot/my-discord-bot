module.exports = {
  name: 'shift',
  async execute(message) {
    const member = message.member;

    // Replace these with your actual role names or IDs
    const managementRole = message.guild.roles.cache.find(r => r.name === 'Management'); // or use .get('ROLE_ID')
    const minRank = 10;

    const userRankRole = member.roles.cache.find(role => {
      const match = role.name.match(/^Role (\d+)$/);
      return match && parseInt(match[1]) >= minRank;
    });

    if (!userRankRole || !member.roles.cache.has(managementRole.id)) {
      return message.reply('❌ You must be Role 10+ and in Management to use this command.');
    }

    message.channel.send(`📢 @everyone ${message.author} has started a shift!\nWhy don't you visit our restaurant and enjoy yourself?`);
  }
};
