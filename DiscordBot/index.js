
/**
 * Includes
 */
const Discord = require("discord.js");
const ffmpeg = require('ffmpeg');
const { OpusEncoder } = require('@discordjs/opus');
  const encoder = new OpusEncoder(48000, 2);
const {prefix, token, giphytoken} = require('./config.json');
const client = new Discord.Client();
  var isReady = true;

const GphApiClient = require('giphy-js-sdk-core');
giphy = GphApiClient(giphytoken);

const fs = require('fs');

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

function playAudio(message, audioFile){
  isReady = false;
        var voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
          isReady = true;
          return; // Messager is not in a voice channel
        }

        voiceChannel.join().then(connection =>{
          const dispatcher = connection.play(audioFile);
          
          dispatcher.on("finish", () => {voiceChannel.leave(); isReady = true});
        }).catch(err => console.log(err));
}

function deleteMessage(message){
  message.delete();
}

client.on("ready", function() {
  console.log("Ready");
});



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
        playAudio(message, './Audio/beta.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;    
      case "!amazin":    
        playAudio(message, './Audio/amazin.wav');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!brb":    
       playAudio(message, './Audio/amazin.wav');
       setTimeout(() => { message.delete(); }, 350);
      break;
      case "!interesting":    
        playAudio(message, './Audio/interesting.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!mexicans":    
        playAudio(message, './Audio/mexicans.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!ow":    
        playAudio(message, './Audio/ow.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;
      case "!surprise":    
        playAudio(message, './Audio/surprise.mp3');
        setTimeout(() => { message.delete(); }, 350);
      break;

      default:
        message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
    }

    commandList.forEach(element => {
      var keyName = Object.keys(element); // Based on how commandlist is intended to be used should only be one key one func
      if((prefix+keyName)==commandRead){

        var player = checkForPlayer(message.author.tag);
        element[keyName](player, message);//way to do player.() ? 
      }
    });


});//on message


client.login(token);
