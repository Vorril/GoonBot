/*
* FISHING CLASS AND DATA
*/
const fs = require("fs");

class FishingDataChunk{
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
    }

    playerID = -1;
    fishingLvl = 1; 
    fishingXP = 0; 
    fishCaught = 0;
    activityTimeout = "";


}//class

const playerFishingData = [];

   
//STARUP LOAD:
fs.readFile("./Save Files/playerFishingData.json", function (errLoad, data) {
    if (errLoad) {
        console.log(`Fishingdata failed to load`);
    } else {
      let loadList = JSON.parse(data); //data = stringify array
      loadList.forEach((element) => {
        playerFishingData.push(new FishingDataChunk(element));
        });
      console.log("Loaded fishing data for players: " + playerFishingData.length);
  
    }
  }); //readFile

  function saveFishingData(){
    //Can only safely save once the last person has finished fishing ie no one is currently fishing
   let busy = false;
   
    playerFishingData.forEach(element => {
        if(element.activityTimeout != ""){
            busy = true;
        }
    });

    if(busy) return;

    fs.writeFile("./Save Files/playerFishingData.json", JSON.stringify(playerFishingData),
     function (err) {}) 
   
     return;
  }//savedata

  const getPlayerFishingData = (checkID) => {
    for (i = 0; i < playerFishingData.length; i++) {
      if (playerFishingData[i].playerID == checkID) return playerFishingData[i];
    }//found

    //Unfound, add new:
    let playerToAdd = { playerID: checkID }; 
    playerFishingData.push(new FishingDataChunk(playerToAdd)); // Constructor calls .assign

    return playerFishingData[playerFishingData.length - 1];

}


  

/* **************************
***** FISHING FUNCTIONS *****
*/// ************************

   const start = (message, mainPlayer) => {
       //playerMain is the base Player class object
       //Fishing data is sort of like an extension of the player class but handled and saved here
       //and kept track of in parrallel using the playerID

       let fishingPlayer = getPlayerFishingData(mainPlayer.playerID);
       let timeCatch = (Math.random() * 1000 * 30) + 5000;//5 - 35s evenly distributed

       //As elsewhere probably should just pass channel instead of message here!
       //Also, could just say screw it to tracking the timeout
       fishingPlayer.activityTimeout = setTimeout(function(){catchFish(message, mainPlayer, fishingPlayer)}, timeCatch);//
       mainPlayer.currentAction = "Fishing";

       message.channel.send(`${mainPlayer.playerUsername} started fishing...`);

       return;
   }//start fishing



//Periodically attempts to catch a fish
 const catchFish = (message, mainPlayer, fishingPlayer) => {
        //TODO inventory
        let caughtFish = getFish(fishingPlayer.fishingLvl);
        message.channel.send(`${mainPlayer.playerUsername} caught a fish! A ${caughtFish.type} :fishing_pole_and_fish: +${caughtFish.xp}XP`);
            
        //Cleanup action tracking
        fishingPlayer.activityTimeout = "";
        mainPlayer.currentAction = "None";

        //XP and leveling
        fishingPlayer.fishCaught++;
        fishingPlayer.fishingXP += caughtFish.xp;
 
        if(fishingPlayer.fishingXP >= (fishingPlayer.fishingLvl*100)){
            fishingPlayer.fishingXP -= fishingPlayer.fishingLvl*100;
            fishingPlayer.fishingLvl++;
            message.channel.send(`${mainPlayer.playerUsername} has leveled up! Fishing level ${fishingPlayer.fishingLvl}! :fireworks: :shark:`);
        }
 
             saveFishingData();//Only an attempt may not if others are simultaneously fishing
         
     }//fish loop

   
   //Returns a fish based on players level
   function getFish(level, location = ""){
    let fish = {};
    let catchPower = level*100 * Math.random();//From 1 to 100*level

    if(catchPower < 80){
        fish.type = "shrimp";
        fish.xp = 15;
        return fish;
    }
    else if(catchPower < 160){
        fish.type = "bass";
        fish.xp = 30;
        return fish;
    }
    else if(catchPower < 240){
        fish.type = "cod";
        fish.xp = 45;
        return fish;
    }
    else if(catchPower < 320){
        fish.type = "tuna";
        fish.xp = 60;
        return fish;
    }

};//catchfish()

function getStats(mainPlayer){
    let fishingPlayer = getPlayerFishingData(mainPlayer.playerID);
    return `Fishing lvl: ${fishingPlayer.fishingLvl} XP: ${fishingPlayer.fishingXP} \n`;
}

module.exports = {start, getStats};// add getStats 