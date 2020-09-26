
/**
 * Includes
 */
const Discord = require("discord.js");
const ffmpeg = require('ffmpeg');
const { OpusEncoder } = require('@discordjs/opus');
  const encoder = new OpusEncoder(48000, 2);
const {prefix, token, giphytoken} = require('./config.json');
const client = new Discord.Client();

const GphApiClient = require('giphy-js-sdk-core');
giphy = GphApiClient(giphytoken);

const fs = require('fs');

//Bot variables:
var isReady = false;
var currentChannel = "";
var timeAllowed = -1;
var rpsQueue = "";
var rpsChoice;

/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const Player = require("./player.js");
const playerList = new Array();
var commandList = new Array();//Holds objects which should be single functions named by their !command 
commandList.push({"hello":function(){console.log("I was declared in index");}});
//commandList[0]["hello"]();

function checkForPlayer(checkTag){//returns player or creates new and returns
  for(i=0;i<playerList.length;i++){
   if(playerList[i].playerTag == checkTag)
    return playerList[i];
  }

  var playerToAdd = {playerTag: checkTag};//object to feed class constructor
  playerList.push(new Player(playerToAdd));
          console.log(`New player added ${checkTag} playerList Index: ${(playerList.length-1)}`);
  return (playerList[playerList.length-1]);
}

loadExternals();

//load players from file during startup
fs.readFile('./playerData.json', function(errLoad,data){//Doing it with the callback waits to ensure file loaded
  if(errLoad){}
  else{
    loadList = JSON.parse(data);//data = stringify array
    loadList.forEach(element => {
      playerList.push(new Player(element));
     // console.log(JSON.stringify(playerList[playerList.length-1]));//NOT stringifyig members added via assign to the prototype???!?!
     
    });
    console.log("Loaded players:"+playerList.length);

    //loadExternals();
    //need to conver to player class;
  };
});//readFile
function savePlayers(){//Write each player to individual file? would make saving easier
  fs.writeFile('./playerData.json', JSON.stringify(playerList), function(err){});//TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)
}

function loadExternals(){
  //These 5 lines couldfurther be modularized they shold be the same for every import
  const Fishing = require("./Extensions/fishing.js");
  var protoFishing = Fishing.importProperties();// imports all player related properties
  Object.assign(Player.prototype,protoFishing);
  var tempArray = commandList.concat(Fishing.importCommands());// imports commands which likely call the added functions above
  commandList = tempArray;
}





/*
*  static functions
*/
function playAudio(voiceChannel, audioFile){
  //console.log(voiceChannel.id);
  isReady = false;
        if(!voiceChannel){
          isReady = true;
          return; // Messager is not in a voice channel
        }
        
        if(voiceChannel.id == currentChannel.id){//Bot is alrleady in the correct channel
          connection =>{
            const dispatcher = connection.play(audioFile);

            dispatcher.on("finish", () => { isReady = true});
          }
        }

        voiceChannel.join().then(connection =>{//Bot needs to join first
          const dispatcher = connection.play(audioFile);

          dispatcher.on("finish", () => { isReady = true});
        }).catch(err => console.log(err));

        //Setup leaving and cleanup:
        currentChannel = voiceChannel;
        timeAllowed = Date.now() + 3600000;
        //setTimeout(() => { message.delete(); }, 350);
}

function channelTimeout(){//Called on interval
  if(Date.now() > timeAllowed && currentChannel != ""){
    currentChannel.leave();
    currentChannel = "";

  }
}


/*
* Client callbacks
*/

client.on("ready", function() {
  console.log("Ready");
  isReady = true;
  setInterval(channelTimeout, 60000);//Check every 1m
});

//Called on channel change, mute, or deafen, but I think not on user name changes 
client.on("voiceStateUpdate", (oldUserState, newUserState) => {
 if( newUserState.id == 742609957148557374) return;//ignore the bot itself
  //console.log(oldUserState.channelID);
  //console.log(newUserState);

  //The user event was a channel change and the new channel is the same the bot is currently in
  if((oldUserState.channelID != newUserState.channelID) && newUserState.channelID == currentChannel.id){
    if(isReady)
      setTimeout(() => { playAudio(currentChannel, './Audio/beta.mp3'); }, 350);
  }


})

client.on("message", message => {
  if(!message.content.startsWith(prefix)) return;//not a command
  if(message.author.tag == "GoonBot#3603") return;//someone tricked bot into saying !something

  // !commandRead <commandModifier> //careful to check if no mods given
  //Todo See if anything missbehaves on untrimmed input
  var commandLength = message.content.indexOf(" ");//-1 if unfound 
  var commandRead = (message.content.substring(0, (commandLength == -1 ? message.content.length: commandLength)));//Whether var is found
  var commandModifier  = (commandLength == -1 ? "" : message.content.substring(message.content.indexOf(" ")+1)); //Might fail in the special case commandRead is 1 char long?

  if(commandRead == "!gif" && commandModifier == ""){
    //message.channel.send("Command seen");
    giphy.search('gifs', {"q":"random"})
      .then((response) => {
        var totalResponses = response.data.length;
        var responseIndex = Math.floor((Math.random()*10+1))%totalResponses;
        var responseFinal = response.data[responseIndex];

        message.channel.send("Random gif", {files:[responseFinal.images.fixed_height.url]});
      });
  }
  else if(commandRead == "!gif"){//else if -> modifers
    giphy.search('gifs', {"q":commandModifier})//TODO clear symbols from search query
      .then((response) => {
        var totalResponses = response.data.length;
        if(totalResponses==0){
          message.channel.send("No results ijjit dont be ptupid");
          return;
        }
        var responseIndex = Math.floor((Math.random()*10+1))%totalResponses;
        var responseFinal = response.data[responseIndex];

        message.channel.send(`${totalResponses} ${commandModifier} gifs found`, {files:[responseFinal.images.fixed_height.url]});

      });//then
    }//else if
    // giphy

  else if(commandRead == "!roll"){
    function roll(range){
      return Math.floor(Math.random()*range)+1;
    }
    if(commandModifier == ""){
      var rolled = roll(100);
      message.channel.send(`${message.author} rolled: \n ${rolled} (1-100)`);
      return;
    }
    commandModifier = commandModifier.trimEnd();
    var dice = commandModifier.split(" ", 20);

    var rollOutput = `${message.author} rolled: \n`;
    dice.forEach(element => {
      diceSize = parseInt(element, 10);
      if(!isNaN(diceSize) && diceSize > 0){
        rolled = roll(roll(diceSize));
        rollOutput += `${rolled} (1-${diceSize})\n`;
      }
    });
      message.channel.send(rollOutput);
      return;
  }
else if(commandRead == "!rps"){
  //Invalid selecetion:
  if(!(commandModifier == "rock" || commandModifier == "r" ||
  commandModifier == "paper" || commandModifier == "p" ||
  commandModifier == "scizzor" || commandModifier == "s" )){
    message.delete();
    message.channel.send("Invalid choice: rock/paper/scizzor/r/p/s");
    return;
  }
  //First player queues up:
  else if(rpsQueue == ""){//should probably be a per channel function?
    rpsQueue = message.author;
    message.channel.send(`RPS \n${rpsQueue} wants to play rock paper scizzors! Type !rps <rock/paper/scizzor/r/p/s>`);
    message.delete();

    rpsChoice = commandModifier;
    //Simplify for logic comparison later:
    if(rpsChoice == "rock") rpsChoice = "r";
    if(rpsChoice == "paper") rpsChoice = "p";
    if(rpsChoice == "scizzor") rpsChoice = "s";
    return;
  }
  //Else player 2 also w/ a valid input:
  else{

    var choice2 = commandModifier;
    if(choice2 == "rock") choice2 = "r";
    if(choice2 == "paper") choice2 = "p";
    if(choice2 == "scizzor") choice2 = "s";

    var outputStr = `RPS \n${rpsQueue}: ${rpsChoice} \n${message.author}: ${choice2}\n`;

    if(rpsChoice == choice2){
      message.channel.send(outputStr + `${rpsQueue} and ${message.author} tied`)

      message.delete();
      rpsQueue = "";
      rpsChoice = "";
      return;  
    }

    var p1Wins = true;//assume p1 wins and only check fail cases 
    //Jas you should do this with Ternary operator for shits
    if(rpsChoice == "r" && choice2 == "p"){
      p1Wins = false;
    }
    else if(rpsChoice == "p" && choice2 == "s"){
      p1Wins = false;
    }
    else if(rpsChoice == "s" && choice2 == "r"){
      p1Wins = false;
    }

    if(p1Wins) outputStr += `${rpsQueue} beats ${message.author}!`
    else outputStr += `${message.author} beats ${rpsQueue}!`
    message.channel.send(outputStr);

    message.delete();
    rpsQueue = "";
    rpsChoice = "";
    return;  
  }

}
else
    if(isReady)
    switch (commandRead) {
      case "!commandlist":
        var keyNames = "";
        commandList.forEach(element => {
          keyNames += (Object.keys(element) + '\n');
        });
        console.log("Commands found in commandList:"+'\n'+keyNames);
      break;

      case "!commands":
        message.channel.send("GoonBot know do these: \n !gif <search> \n !snickers \n !fish \n !stats \n");//!startQuest \n !stats");
      break;

      case "!devcommands":
        message.channel.send("Commands for smrt bois: !ram \n !time \n !addtestplayer");
      break;

      case "!stats":
        var player = checkForPlayer(message.author.tag);
        player.printStats(message);
      break;

      case "!snickers":{
        var player = checkForPlayer(message.author.tag);

        player.eatSnickers(message);

        savePlayers();//Do we want to update the whole savefile on every change?
        break;//snickers
      }

      case "!fish":
        var player = checkForPlayer(message.author.tag);
        player.fish(message);
        console.log(player.fishingMember);
      break;

      case "!cleanup":
        //clear useulss / old chat messages
      break;

      //Testing funcitons:
      case "!time":
        var currdate = Date.now();
        message.channel.send(currdate);
      break;

      case "!addtestplayer":
        var randomNumber = Math.floor(Math.random()*10000);
        playerList.push(new Player({playerTag: ("testplayer"+randomNumber)}));
        fs.writeFile('./playerData.json', JSON.stringify(playerList), function(err){});
      break;

      case "!ram":
        var ramUsage = process.memoryUsage();
        message.channel.send("Total process RSS: "+ Math.floor(ramUsage.rss/1024/1024) +"MB \n Total Heap: "+ Math.floor(ramUsage.heapUsed/1024/1024) +"MB" );
      break;

      case "!changeclass":
        var player = checkForPlayer(message.author.tag);
        player.setClass();
        savePlayers();
      break;


//audio
      case "!beta":    
        playAudio(message.member.voice.channel, './Audio/beta.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;    
      case "!amazin":    
        playAudio(message.member.voice.channel, './Audio/amazin.wav');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!brb":    
       playAudio(message.member.voice.channel, './Audio/brb.mp3');
       setTimeout(() => { message.delete(); }, 350);
      break;
      case "!interesting":    
        playAudio(message.member.voice.channel, './Audio/interesting.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!mexicans":    
        playAudio(message.member.voice.channel, './Audio/mexicans.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!ow":    
        playAudio(message.member.voice.channel, './Audio/ow.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!surprise":    
        playAudio(message.member.voice.channel, './Audio/surprise.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;

      default:
        message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
    }

    commandList.forEach(element => {//check dynamically loaded commands
      var keyName = Object.keys(element); // Based on how commandlist is intended to be used should only be one key one func
      if((prefix+keyName)==commandRead){

        var player = checkForPlayer(message.author.tag);
        element[keyName](player, message);//way to do player.() ? 
      }
    });


});//on message


client.login(token);
