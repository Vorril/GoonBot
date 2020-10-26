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
}

let playerFishingData = [];

   
//STARUP LOAD:
fs.readFile("./Save Files/playerFishingData.json", function (errLoad, data) {
    if (errLoad) {
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
    playerFishingData.forEach(element => {
        if(element.activityTimeout != ""){
            return "busy";
        }
    });

    fs.writeFile("./Save Files/playerFishingData.json", JSON.stringify(playerFishingData),
     function (err) {}) 
   
     return "saved";
  }

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

   function start(message, mainPlayer){
       //playerMain is the base Player class object
       //Fishing data is sort of like an extension of the player class but handled and saved here
       //and kept track of in parrallel using the playerID

       let fishingPlayer = getPlayerFishingData(mainPlayer.playerID);

       //As elsewhere probably should just pass channel instead of message here!
       fishingPlayer.activityTimeout = setInterval(function(){fishLoop(message, mainPlayer, fishingPlayer)}, 5000);//this way multiple people can do it as its an object function...
       mainPlayer.currentAction = "Fishing";

       message.channel.send(`${mainPlayer.playerUsername} started fishing...`);

       return;
   }
   
   //Returns a fish based on players level
   function catchFish(level, location = ""){
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

//Periodically attempts to catch a fish
    function fishLoop(message, mainPlayer, fishingPlayer){
    //    fishLoop = (message)=>{
         if(Math.random() > 0.8){//catch success
             //TODO inventory
             let caughtFish = catchFish(fishingPlayer.fishingLvl);
             message.channel.send(`${mainPlayer.playerUsername} caught a fish! A ${caughtFish.type} :fishing_pole_and_fish: +${caughtFish.xp}XP`);
            
            //Cleanup action tracking
             clearInterval(fishingPlayer.activityTimeout);
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
         }
     }

module.exports = {start};// add getStats 