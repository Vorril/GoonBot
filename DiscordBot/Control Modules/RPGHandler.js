/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const Player = require("../player");
const fs = require("fs");


// Player Variables
let playerList = [];

 /***************************************
  *********    STARTUP LOAD     *********
  ***************************************/

//load players from file during startup
//ToDo implement restarting of long actions based on actionProgress
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

  }
}); //readFile

 /***************************************
  *********       SAVING        *********
  ***************************************/
function checkForSaveFlags(){
  let saveSomething = false;
  playerList.forEach(element => {
    if(element.needsSaved){
      saveSomething = true;
      element.needsSaved = false;
    }
  });
  if(saveSomething){
    console.log("Saved player data");
    savePlayers();
  }
}
setInterval(checkForSaveFlags, 60000);

function savePlayers() {
  let tempIntervalArr = [];
  playerList.forEach(element => {
    //temporary fix timeout objects cant be saved definitely need a better solution
    tempIntervalArr.push(element.activityTimeout);
    element.activityTimeout = "";
    if(element.currentAction != "None"){//Case where they are in the middle of trying to do something, will need to be fixed on loading
      element.actionProgress = Date.now()-element.lastActionTime;
    }
  });


  
  fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
    err
  ) {}) //TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)


  //temporary fix reload player objects and reassign any timeoutObjects. this way we avoid saving those:

playerList.forEach((element2,index) =>{//Will this ever asynchronously cause fuck ups? Assigning an outdated timer?
  element2.activityTimeout = tempIntervalArr[index];//relacing value that couldnt be saved
});


}

const checkForPlayer = (checkTag, playerList) => {
  //returns player or creates new and returns
  for (i = 0; i < playerList.length; i++) {
    if (playerList[i].playerTag == checkTag) return playerList[i];
  }

  let playerToAdd = { playerTag: checkTag }; //object to feed class constructor
  playerList.push(new Player(playerToAdd));
  console.log(
    `New player added ${checkTag} playerList Index: ${playerList.length - 1}`
  );
  return playerList[playerList.length - 1];
};


const handleRPGCommands = (commandRead, commandModifier, message) => {
  let player;
  switch (commandRead) {
    case "!stats":
      player = checkForPlayer(message.author.tag, playerList);
      player.printStats(message);
      break;


    case "!current":
    case "!activity":
    case "!busy":
      player = checkForPlayer(message.author.tag, playerList);
      player.checkActivity(message);

      break;

    case "!snickers": {
      player = checkForPlayer(message.author.tag, playerList);

      player.eatSnickers(message);

      break; //snickers
    }

    case "!fish":
      player = checkForPlayer(message.author.tag, playerList);
      player.fish(message);

      
      break;
    
      case "!explore":
        player = checkForPlayer(message.author.tag, playerList);
        player.explore(message);


      break;

      case "!travel":
        player = checkForPlayer(message.author.tag, playerList);
        player.travel(message, commandModifier);

      break;

    case "!addtestplayer":
      let randomNumber = Math.floor(Math.random() * 10000);
      playerList.push(new Player({ playerTag: "testplayer" + randomNumber }));
      fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
        err
      ) {});
      break;

    case "!getClass":
      player = checkForPlayer(message.author.tag, playerList);
      player.setClass(message);
      savePlayers(playerList);
      break;


    default:
      return "unfound";
      break;
  }

};

module.exports = { handleRPGCommands };
