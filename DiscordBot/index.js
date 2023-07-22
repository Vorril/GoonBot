/**
 * Includes
 */
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const ffmpeg = require("ffmpeg");
const { OpusEncoder } = require("@discordjs/opus");
const encoder = new OpusEncoder(48000, 2);
const { prefix, token } = require("./config.json");
const {generateDependancyReport, AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource} = require("@discordjs/voice")
//const { createDiscordJSAdapter } = require("adapter.ts")
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

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
var activeGuildId = 0; //Better way to do this but Im getting errors //Get from messages
var connection = 0;
const audioPlayer = createAudioPlayer();

audioPlayer.on('error', error => {
    console.error('Throw audio player error ');
});





/*
 *  static functions
 */
function playAudio(message, audioFile) {//should refactor into audihandler.js and set to return currentChannel that should work
    voiceChannel = message.member.voice.channel

    isReady = false;

      if (!voiceChannel) {
        isReady = true;
        return; // Messager is not in a voice channel//TODO better way exists
      }


    connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    })



          
    var resource = createAudioResource(audioFile);//Could predo these on load I guess

    audioPlayer.play(resource);

    const subscription = connection.subscribe(audioPlayer);
    if (subscription) {
        // Unsubscribe after 12 seconds (stop playing audio on the voice connection)
        setTimeout(() => subscription.unsubscribe(), 12_000);
    }

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        isReady = true;
    });



  //Setup leaving and cleanup:
  currentChannel = voiceChannel;
  timeAllowed = Date.now() + 3600000;//1 hr
  //setTimeout(() => { message.delete(); }, 350);
}



function playAudioCurrent(audioFile) {// play to the current channel bot is in without parsing it from a passed message first
    isReady = false;

    console.log("Attempting to play entry clip..." + audioFile);
    console.log(currentChannel);

    connection = joinVoiceChannel({//not checking if already exists, I think this is corrct way to do it
        channelId: currentChannel.id,
        guildId: currentChannel.guildId,
        adapterCreator: currentChannel.guild.voiceAdapterCreator
    })


    var resource = createAudioResource(audioFile);//Could predo these on load I guess


    audioPlayer.play(resource);

    const subscription = connection.subscribe(audioPlayer);

    if (subscription) {
        // Unsubscribe after 12 seconds (stop playing audio on the voice connection)
        setTimeout(() => subscription.unsubscribe(), 12_000);
    }

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        isReady = true;
    });
}



function channelTimeout() { //TODO probably not working since v14 update
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
    //console.log(oldUserState.channelId);
    //console.log(newUserState.channelId);
    //console.log(currentChannel.id);
    //console.log(currentChannel);

  //The user event was a channel change and the new channel is the same the bot is currently in
  if (
    oldUserState.channelId != newUserState.channelId &&
      newUserState.channelId == currentChannel.id
    ) {

      if (isReady)//Play personalized entry clip
          console.log("Attempting to play entry audio..." + newUserState.id);
        setTimeout(() => {
            handleEntryAudio(currentChannel, newUserState.id, playAudioCurrent);
        }, 350);
    }
});

client.on("messageCreate", (message) => {
    //console.log("Message event");
    //console.log(message);

  /**
   * Do nothing if command isn't valid or someone tricked bot into saying !something
   */
  if (
    !message.content.startsWith(prefix) ||
    message.author.tag == "GoonBot#3603"//todo more robust check
  )
    return;

    if(typeof(message.channel) == "DMChannel"){//message was DMd to goobot //I think there is a new event type for this
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


   // console.log("Echo command read: " + commandRead);

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
