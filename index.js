var Slack, autoMark, autoReconnect, slack, token;

const { App } = require('@slack/bolt');
Alex = require('alex');
var http = require('http');


// Initializes your app in socket mode with your app token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});


// slack.on('open', function() {
//   var channel, channels, group, groups, id, messages, unreads;
//   channels = [];
//   groups = [];
//   unreads = slack.getUnreadCount();
//   channels = (function() {
//     var ref, results;
//     ref = slack.channels;
//     results = [];
//     for (id in ref) {
//       channel = ref[id];
//       if (channel.is_member) {
//         results.push("#" + channel.name);
//       }
//     }
//     return results;
//   })();
//   groups = (function() {
//     var ref, results;
//     ref = slack.groups;
//     results = [];
//     for (id in ref) {
//       group = ref[id];
//       if (group.is_open && !group.is_archived) {
//         results.push(group.name);
//       }
//     }
//     return results;
//   })();
//   console.log("Welcome to Slack. You are @" + slack.self.name + " of " + slack.team.name);
//   console.log('You are in: ' + channels.join(', '));
//   console.log('As well as: ' + groups.join(', '));
//   messages = unreads === 1 ? 'message' : 'messages';
//   return console.log("You have " + unreads + " unread " + messages);
// });


// Listens to incoming messages that contain "hello"
app.message('', async (request) => {
  let { message, client,context } = request;
  let botInfoResp=await client.users.info({user:context.botUserId})
  let botInfo=botInfoResp.user
  // say() sends a message to the channel where the event was triggered
  var channelError, channelName, errors, response, text, textError, ts, type, typeError, userName;
  let userResp =await  client.users.info({user:message.user});
  let channelDetailResp= await client.conversations.info({
    "channel":message.channel
  })
  let channel=channelDetailResp.channel

  let user=userResp.user;
  response = '';
  type = message.type, ts = message.ts, text = message.text;
  channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
  channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
  userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";
  console.log("Received: " + type + " " + channelName + " " + userName + " " + ts + " \"" + text + "\"");
  if (type === 'message' && (text != null) && (channel != null)) {

    var a_messages = Alex(text).messages;

    if(a_messages.length) {
      for (var i = 0; i < a_messages.length; i++) {
        response += Alex(text).messages[i].reason + '\n';
      };

      client.chat.postMessage({text:response,channel:channel.id});
      return console.log("@" + botInfo.profile.real_name+ " responded with \"" + response + "\"");
    }
  } else {
    typeError = type !== 'message' ? "unexpected type " + type + "." : null;
    textError = text == null ? 'text was undefined.' : null;
    channelError = channel == null ? 'channel was undefined.' : null;
    errors = [typeError, textError, channelError].filter(function(element) {
      return element !== null;
    }).join(' ');
    return console.log("@" + botInfo.profile.real_name + " could not respond. " + errors);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();

// // Heroku requires the process to bind to this port within 60 seconds or it is killed
 http.createServer(function(req, res) {
   res.end('ALEX_SLACK_BOT');
 }).listen(process.env.PORT || 5000)
