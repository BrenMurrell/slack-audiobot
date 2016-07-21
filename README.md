Welcome!

## What is Audiobot?
Audiobot is an audio feedback bot for Slack.  Slack Audiobot is written in node.js and plays MP3 files from it's /sound directory based on queues from Slack users. Audiobot now also features text-to-speech (TTS) for Mac and Windows.

## Why is Audiobot?
Audio feedback seemed like a great way to liven up the office, but can also be used to provide realtime feedback around events in Slack.

## How to Audiobot
1. Grab the repo and run npm install. This will install all of the dependencies Audiobot requires.
2. Add a bot integration in Slack [here](https://slack.com/services/new/bot)
3. Add your bot's API key to config.js
4. Run `node audiobot.js` from the command line
5. Invite your brand new bot into the channels you'd like it to watch.

## Commands
Here's a couple commands you might like to try:
* `play bell` - this will play the bell noise (comes with this package)
* `@BOTNAME help` - get a list of commands you can use with your bot (replace BOTNAME with your bot's name, obviously)
* `@BOTNAME list` - get a list of valid sound files. If you want more, just dump them in the sounds folder
* `@BOTNAME stop` - stop the bot listening to requests for sounds
* `@BOTNAME start` - start the bot listening to requests for sounds  (on by default)
* `@BOTNAME say MESSAGE` - Make the bot speak via TTS.

## Linux
To enable the 'say' command, install [espeak](http://espeak.sourceforge.net/):

    sudo apt-get install espeak
