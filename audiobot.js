var exec = require('child_process').exec;
var Slack = require('slack-client');
var fs = require('fs');
var config = require('./config/config.js');

//use this to set whether feedback bot is listening. If he's not, feedback will not be given - on at start.

var started = true;
var slack = new Slack(config.token, true, true);

var makeMention = function(userId) {
    return '<@' + userId + '>';
};

var isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);
    return messageText &&
           messageText.length >= userTag.length &&
           messageText.substr(0, userTag.length) === userTag;
};

var getOnlineHumansForChannel = function(channel) {
    if (!channel) return [];

    return (channel.members || [])
        .map(function(id) { return slack.users[id]; })
        .filter(function(u) { return !!u && !u.is_bot && u.presence === 'active'; });
};

slack.on('open', function () {
    var channels = Object.keys(slack.channels)
        .map(function (k) { return slack.channels[k]; })
        .filter(function (c) { return c.is_member; })
        .map(function (c) { return c.name; });

    var groups = Object.keys(slack.groups)
        .map(function (k) { return slack.groups[k]; })
        .filter(function (g) { return g.is_open && !g.is_archived; })
        .map(function (g) { return g.name; });

    console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

    if (channels.length > 0) {
        console.log('You are in: ' + channels.join(', '));
    }
    else {
        console.log('You are not in any public channels.');
    }

    if (groups.length > 0) {
       console.log('You are in the following private channels: ' + groups.join(', '));
    }
});

slack.on('message', function(message) {
    //get current time
    currentTime = Math.floor(Date.now()/1000);
    if(currentTime - message.ts > 10) {
        //current message is older than 10 seconds, so ignore this - this is to stop the bot from spamming the channel like it did that time.
        return false;
    }


    //console.log('started = ' + started);
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);

    if(message.type === 'message') {
        //get message text
        var messageText = message.text;

        if(messageText) {
            //pick output device 1 = headphones, 2 = speakers (default)
            var hasTest = message.text.indexOf("test");
            if(hasTest > -1) {
                outputDevice = 1;
            } else {
                outputDevice = 2;
            }


            var hasPlay = message.text.indexOf("play"); //search for play trigger
            if((hasPlay > -1) && (started === true)) {
                //if message has the word play in then try and play a message
                var toPlay = message.text.substring(hasPlay + 5);
                var toPlayWav = 'sounds/' + toPlay + '.wav'; //allow for mp3 and wav versions (consider creating an array of supported filetypes instead)
                var toPlayMp3 = 'sounds/' + toPlay + '.mp3';


                fs.exists(toPlayMp3,function(existsMp3) { //mp3 version of loop
                    if(existsMp3) {
                        exec('mplayer -ao dsound:device=' + outputDevice + ' ' + toPlayMp3);
                        played = 'played';
                        channel.send('Played sound: "' + toPlay + '"');
                        console.log('playing: ' + toPlayMp3);
                    }
                });
                fs.exists(toPlayWav,function(existsWav) { //wav version of loop
                    if(existsWav) {
                        exec('mplayer -ao dsound:device=' + outputDevice + ' ' + toPlayWav);
                        channel.send('Played sound: "' + toPlay + '"');
                        console.log('playing: ' + toPlayWav);
                    }
                });
            }

            if(isDirect(slack.self.id, message.text)) {
                //handle telling bot to start listening
                var trimmedMessage = message.text.substr(makeMention(slack.self.id).length).trim();
                if(trimmedMessage === 'start' || trimmedMessage === ': start') {
                    started = true;
                    channel.send('I am now listening.');
                }
                //handle telling bot to stop listening
                if(trimmedMessage === 'stop' || trimmedMessage === ': stop') {
                    started = false;
                    channel.send('I stopped listening.');
                }
                //spit out a list of valid sounds that bot can play
                if((trimmedMessage === 'list' || trimmedMessage === ': list') && (started === true)) {
                    fileList = fs.readdir('sounds/',function(err,data) {
                        if(err) throw err;
                        var responseText = 'Valid sounds are: ';
                        for (i = 0; i < data.length; i++) {
                            responseText += data[i].replace(".mp3","").replace(".wav","") + ", ";
                        }
                        channel.send('@' + user.name + ': ' + responseText);
                    });

                }
                //spit out a list of help commands
                if((trimmedMessage === 'help' || trimmedMessage === ': help') && (started === true)) {
                    channel.send('Type _play_ and then a valid sound name to make me play that sound');
                    channel.send('For a list of valid sound names, type _@' + slack.self.name + ' list_');
                    channel.send('To stop me listening for play events,  type  _@' + slack.self.name + ' stop_');
                    channel.send('To start me listening for play events,  type  _@' + slack.self.name + ' start_ (I\'m _on_ by default)');

                }
            }
        }

    }
});

slack.login();
