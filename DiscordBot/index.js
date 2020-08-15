
/**
 * Includes
 */
const Discord = require("discord.js");
const {prefix, token, giphytoken} = require('./config.json');
const client = new Discord.Client();

const GphApiClient = require('giphy-js-sdk-core');
giphy = GphApiClient(giphytoken);


/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const fs = require('fs');
const Player = require("./player.js");
var playerList = new Array();
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
//load players from file during startup
fs.readFile('./playerData.json', function(errLoad,data){//Doing it with the callback waits to ensure file loaded
  if(errLoad){}
  else{
    loadList = JSON.parse(data);//data = stringify array
    loadList.forEach(element => {
      playerList.push(new Player(element));
    });
    console.log("Loaded players:"+playerList.length);
    //need to conver to player class;
  };
});//readFile
function savePlayers(){//Write each player to individual file? would make saving easier
  fs.writeFile('./playerData.json', JSON.stringify(playerList), function(err){});//TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)
}


function intervalFunc(){
  //console.log("Tick");
}
setInterval(intervalFunc, 60000);


client.on("ready", function() {
  console.log("Ready");
});


client.on("message", message => {
  if(message.author.tag == "GoonBot#3603") return;//someone tricked bot into saying !something

  if(message.content == (prefix+"gif")){
    //message.channel.send("Command seen");
    giphy.search('gifs', {"q":"random"})
      .then((response) => {
        var totalResponses = response.data.length;
        var responseIndex = Math.floor((Math.random()*10+1))%totalResponses;
        var responseFinal = response.data[responseIndex];

        message.channel.send("Random gif", {files:[responseFinal.images.fixed_height.url]});
      });
  }
  else if(message.content.startsWith(prefix+"gif ")&& message.content.length>5){//'!gif ' = 5
    var searchTerm = message.content.substring(5);
    //console.log(searchTerm);
    giphy.search('gifs', {"q":searchTerm})//TODO clear symbols from search query
      .then((response) => {
        var totalResponses = response.data.length;
        if(totalResponses==0){
          message.channel.send("No results ijjit dont be ptupid");
          return;
        }
        var responseIndex = Math.floor((Math.random()*10+1))%totalResponses;
        var responseFinal = response.data[responseIndex];

        message.channel.send(`${totalResponses} ${searchTerm} gifs found`, {files:[responseFinal.images.fixed_height.url]});

      });//then
    }//else if
    // giphy

else if(message.content.startsWith(prefix))
    switch (message.content.toLowerCase()) {
      case "!commands":
        message.channel.send("GoonBot know do these: \n !gif <search> \n !snickers \n !fish \n !stats \n");//!startQuest \n !stats");
      break;

      case "devcommands":
        message.channel.send("Commands for smrt bois: !ram \n !time \n !addtestplayer");
      break;

      case "!stats":
        var player = checkForPlayer(message.author.tag);
        player.printStats(message);
      break;

      case "!snickers":{
        var player = checkForPlayer(message.author.tag);

        player.eatSnickers(message);

        savePlayers();//Do we want to update the whole savvefile on every change?
        break;//snickers
      }

      case "!fish":
        var player = checkForPlayer(message.author.tag);
        player.fish(message);

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

      default:
        message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
    }



});//on message


client.login(token);
