/**
 * Includes
 */
const Discord = require("discord.js");
const ffmpeg = require("ffmpeg");
const { OpusEncoder } = require("@discordjs/opus");
const encoder = new OpusEncoder(48000, 2);
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

/**
 * Control Modules
 */
const {
  handleGifsRandom,
  handleGifsWithQuery,
} = require("./Control Modules/GifHandler.js");

const { handleDiceRoll } = require("./Control Modules/RollHandler.js");

const { handleRPS } = require("./Control Modules/RPSHandler.js");

const {
  handleHelperCommands,
} = require("./Control Modules/helperCommandHandler.js");

const {
  handleMiscCommands,
} = require("./Control Modules/miscCommandsHandler.js");

const { handleRPGCommands } = require("./Control Modules/RPGHandler.js");

const { handleAudioCommands, handleEntryAudio, submitAudio } = require("./Control Modules/audioHandler.js");

const { handleStockCommands } = require("./Control Modules/StockHandler.js");

//Bot variables:
var isReady = false;
var currentChannel = "";
var timeAllowed = -1;

/*
 *  static functions
 */
function playAudio(voiceChannel, audioFile) {//should refactor but it mentions a static var in this js
  //console.log(voiceChannel.id);
  isReady = false;
  if (!voiceChannel) {
    isReady = true;
    return; // Messager is not in a voice channel
  }

  if (voiceChannel.id == currentChannel.id) {
    //Bot is alrleady in the correct channel
    (connection) => {
      const dispatcher = connection.play(audioFile);

      dispatcher.on("finish", () => {
        isReady = true;
      });
    };
  }

  voiceChannel
    .join()
    .then((connection) => {
      //Bot needs to join first
      const dispatcher = connection.play(audioFile);

      dispatcher.on("finish", () => {
        isReady = true;
      });
    })
    .catch((err) => console.log(err));

  //Setup leaving and cleanup:
  currentChannel = voiceChannel;
  timeAllowed = Date.now() + 3600000;//1 hr
  //setTimeout(() => { message.delete(); }, 350);
}

function channelTimeout() {
  //Called on interval
  if (currentChannel != "" && currentChannel.members.size < 2 && Date.now() > timeAllowed ) {
    currentChannel.leave();
    currentChannel = "";
  }
}

/*
 * Client callbacks
 */

client.on("ready", function () {
  console.log("Ready");
  isReady = true;
  setInterval(channelTimeout, 60000); //Check every 1m
});

//Called on channel change, mute, or deafen, but I think not on user name changes
client.on("voiceStateUpdate", (oldUserState, newUserState) => {
  if (newUserState.id == 742609957148557374) return; //ignore the bot itself //Should double check this value on startup not ure if it's immutable
  //console.log(oldUserState.channelID);
  //console.log(newUserState);

  //The user event was a channel change and the new channel is the same the bot is currently in
  if (
    oldUserState.channelID != newUserState.channelID &&
    newUserState.channelID == currentChannel.id
    ) {

      if (isReady)//Play personalized entry clip
        setTimeout(() => {
        handleEntryAudio(currentChannel, newUserState.id, playAudio);
        }, 350);
    }
});

client.on("message", (message) => {
  /**
   * Do nothing if command isn't valid or someone tricked bot into saying !something
   */
  if (
    !message.content.startsWith(prefix) ||
    message.author.tag == "GoonBot#3603"//todo more robust check
  )
    return;

    if(typeof(message.channel) == "DMChannel"){//message was DMd to goobot
      //handleDM() should probably refactor this...
      if(message.attachments.first()){//Messageattachments is a map of messageattachment obects check api
        if(message.attachments.first().name.endsWith(".mp3")){
          if(message.attachments.first().size < 300000){//300kb max
            //submitAudio(message);
          }
        }
      }

      return;// Potential to cause problems if not done... should actually check DM, vs voice, vs text
    }//if DMd

  //Typical syntax: !commandRead commandModifier
  //Check if modifier was given and split the two:
  var commandLength = message.content.indexOf(" "); //-1 if unfound
  var commandRead = message.content.substring(
    0,
    commandLength == -1 ? message.content.length : commandLength
  ); 

  var commandModifier =
    commandLength == -1
      ? ""
      : message.content.substring(message.content.indexOf(" ") + 1); //Might fail in the special case commandRead is 1 char long?

  /***************************************
   ********     HANDLE GIFS     **********
   ***************************************/
  if (commandRead == "!gif" && commandModifier == "") {
    /**
     * If search query IS NOT provided, generate a random gif
     * todo: setup a random dictionary to use
     */
    const randomGif = handleGifsRandom(message);
  } else if (commandRead == "!gif") {
    /**
     * If search query IS provided, generate the appropriate gif
     */
    const queriedGif = handleGifsWithQuery(commandModifier, message);
  } else if (commandRead == "!roll") {
    /***************************************
     ********     HANDLE ROLLS     *********
     ***************************************/
    const rollOutput = handleDiceRoll(commandModifier, message.author, message);//todo inconsistent messaging syntax
    message.channel.send(rollOutput);
    return;
    
  } else if (commandRead == "!rps") {
    /***************************************
     *****  HANDLE ROCK PAPER SCISSOR  *****
     ***************************************/
    handleRPS(commandModifier, message);// TODO look into await messages function
  } else if (isReady) {
    /***************************************
     *****       HANDLE HELPERS        *****
     ***************************************/
    let helperRes = handleHelperCommands(commandRead, message);

    /***************************************
     *****       HANDLE RPG GAME       *****
     ***************************************/
    let rpgRes = handleRPGCommands(commandRead, commandModifier, message);

    /***************************************
     *****    HANDLE MISC COMMANDS     *****
     ***************************************/
    let miscRes = handleMiscCommands(commandRead, commandModifier, message, process);

    /***************************************
     *****   HANDLE AUDIO COMMANDS     *****
     ***************************************/
    let audioRes = handleAudioCommands(commandRead, commandModifier, message, playAudio);

    /***************************************
     *****   HANDLE Stock COMMANDS     *****
     ***************************************/
    let stockRes = handleStockCommands(commandRead, commandModifier, message);


    const resArr = [helperRes, rpgRes, miscRes, audioRes, stockRes];

    let allAreInvalid = true;
    resArr.forEach((res) => {
      if (typeof res === "undefined") {//Functions return nothing if they do something, a string if they do not
        allAreInvalid = false;
      }
    });
    if (allAreInvalid) {
      message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
    }
  }
}); //on message

/*
 * Client login
 */

client.login(token);
