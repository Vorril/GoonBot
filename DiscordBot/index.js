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

const fs = require("fs");

//Bot variables:
var isReady = false;
var currentChannel = "";
var timeAllowed = -1;
var rpsQueue = "";
var rpsChoice;

loadExternals();

// Player Variables
let playerList = [];

//load players from file during startup
fs.readFile("./playerData.json", function (errLoad, data) {
  //Doing it with the callback waits to ensure file loaded
  if (errLoad) {
  } else {
    loadList = JSON.parse(data); //data = stringify array
    loadList.forEach((element) => {
      playerList.push(new Player(element));
      // console.log(JSON.stringify(playerList[playerList.length-1]));//NOT stringifyig members added via assign to the prototype???!?!
    });
    console.log("Loaded players:" + playerList.length);

    //loadExternals();
    //need to conver to player class;
  }
}); //readFile

function loadExternals() {
  //These 5 lines couldfurther be modularized they shold be the same for every import
  const Fishing = require("./Extensions/fishing.js");
  var protoFishing = Fishing.importProperties(); // imports all player related properties
  Object.assign(Player.prototype, protoFishing);
  var tempArray = commandList.concat(Fishing.importCommands()); // imports commands which likely call the added functions above
  commandList = tempArray;
}

/*
 *  static functions
 */
function playAudio(voiceChannel, audioFile) {
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
  timeAllowed = Date.now() + 3600000;
  //setTimeout(() => { message.delete(); }, 350);
}

function channelTimeout() {
  //Called on interval
  if (Date.now() > timeAllowed && currentChannel != "") {
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
  if (newUserState.id == 742609957148557374) return; //ignore the bot itself
  //console.log(oldUserState.channelID);
  //console.log(newUserState);

  //The user event was a channel change and the new channel is the same the bot is currently in
  if (
    oldUserState.channelID != newUserState.channelID &&
    newUserState.channelID == currentChannel.id
  ) {
    if (isReady)
      setTimeout(() => {
        playAudio(currentChannel, "./Audio/beta.mp3");
      }, 350);
  }
});

client.on("message", (message) => {
  /**
   * Do nothing if command isn't valid or someone tricked bot into saying !something
   */
  if (
    !message.content.startsWith(prefix) ||
    message.author.tag == "GoonBot#3603"
  )
    return;
  // !commandRead <commandModifier> //careful to check if no mods given

  //Todo See if anything misbehaves on untrimmed input
  var commandLength = message.content.indexOf(" "); //-1 if unfound
  var commandRead = message.content.substring(
    0,
    commandLength == -1 ? message.content.length : commandLength
  ); //Whether var is found

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
     */
    const randomGif = handleGifsRandom();
    message.channel.send(...randomGif);
  } else if (commandRead == "!gif") {
    /**
     * If search query IS provided, generate the appropriate gif
     */
    const queriedGif = handleGifsWithQuery(commandModifier);
    message.channel.send(...queriedGif);
  } else if (commandRead == "!roll") {
    /***************************************
     ********     HANDLE ROLLS     *********
     ***************************************/

    const rollOutput = handleDiceRoll(commandModifier, message.author);
    message.channel.send(rollOutput);
    return;
  } else if (commandRead == "!rps") {
    /***************************************
     *****  HANDLE ROCK PAPER SCISSOR  *****
     ***************************************/
    handleRPS(commandModifier, message, rpsQueue, rpsChoice);
  } else if (isReady) {
    /***************************************
     *****       HANDLE HELPERS        *****
     ***************************************/

    handleHelperCommands(commandRead, message);

    /***************************************
     *****       HANDLE RPG GAME       *****
     ***************************************/
    handleRPGCommands(commandRead, message, playerList);

    /***************************************
     *****    HANDLE MISC COMMANDS     *****
     ***************************************/
    handleMiscCommands(commandRead, message, process);

    /***************************************
     *****   HANDLE AUDIO COMMANDS     *****
     ***************************************/
    handleAudioCommands(commandRead, message, playAudio);
  }

  commandList.forEach((element) => {
    //check dynamically loaded commands
    var keyName = Object.keys(element); // Based on how commandlist is intended to be used should only be one key one func
    if (prefix + keyName == commandRead) {
      var player = checkForPlayer(message.author.tag);
      element[keyName](player, message); //way to do player.() ?
    }
  });
}); //on message

client.login(token);
