module.exports = {
  name: 'ping',
  description: 'Replies with Hello!',
  execute(message, args, client) {
    message.channel.send('Hello!');
  }
};
