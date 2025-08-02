module.exports = {
  name: 'training',
  async execute(message) {
    const member = message.member;

    const managementRole = message.guild.roles.cache.find(r => r.name === 'Management');
    const minRank = 10;

    const userRankRole = member.roles.cache.find(role => {
      const match = role.name.match(/^Role (\d+)$/);
      return match && parseInt(match[1]) >= minRank;
    });

    if (!userRankRole || !member.roles.cache.has(managementRole.id)) {
      return message.reply('❌ You must be Role 10+ and in Management to host a training.');
    }

    const trainingChannel = message.guild.channels.cache.find(c => c.name.includes('training'));
    if (!trainingChannel) return message.reply('❌ Training channel not found.');

    trainingChannel.send(`📢 @everyone ${message.author} is hosting a training!\nCome down to the training center to get promoted and improve your skills!`);
  }
};
