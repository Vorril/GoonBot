/*
* FISHING CLASS AND DATA
*/
const fs = require("fs");

class WoodcuttingDataChunk{
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
    }

    playerID = -1;
    wcLvl = 1; 
    wcXP = 0; 
    wcInventory = {};
    activityTimeout = "";
    startTime = -1;

}//class


const playerWCData = [];


//STARUP LOAD:
fs.readFile("./Save Files/playerWoodcuttingData.json", function (errLoad, data) {
    if (errLoad) {
        console.log(`WoodcuttingData failed to load`);
    } else {
      let loadList = JSON.parse(data); //data = stringify array
      loadList.forEach((element) => {
        playerWCData.push(new WoodcuttingDataChunk(element));
        });
      console.log("Loaded woodcutting data for players: " + playerWCData.length);
  
    }
  }); //readFile

  function saveWoodcuttingData(){
    //Can only safely save once the last person has finished fishing ie no one is currently fishing
   let busy = false;
   
   playerWCData.forEach(element => {
        if(element.activityTimeout != ""){
            busy = true;
        }
    });

    if(busy) return;

    fs.writeFile("./Save Files/playerWoodcuttingData.json", JSON.stringify(playerWCData),
     function (err) {}) 
   
     return;
  }//savedata

  const getPlayerWCData = (checkID) => {
    for (i = 0; i < playerWCData.length; i++) {
      if (playerWCData[i].playerID == checkID) return playerWCData[i];
    }//found

    //Unfound, add new:
    let playerToAdd = { playerID: checkID }; 
    playerWCData.push(new WoodcuttingDataChunk(playerToAdd)); // Constructor calls .assign

    return playerWCData[playerWCData.length - 1];

}


/*
*
*/


const start = (message, mainPlayer) => {

    let wcPlayer = getPlayerWCData(mainPlayer.playerID);
    let timeChop = 1000*60*60 * Math.min(wcPlayer.wcLvl, 24);//1hr per lvl
    wcPlayer.startTime = Date.now();

    wcPlayer.activityTimeout = setTimeout(function(){chopWood(message, mainPlayer, wcPlayer)}, timeChop);//
    mainPlayer.currentAction = "Woodcutting";

    let maxtime = min(24, wcPlayer.wcLvl);
    message.channel.send(`${mainPlayer.playerUsername} started chopping wood... !chop to stop or get tired in ${maxtime} hrs`);

    return;
}//start WC

//ending early
const stop = (message, mainPlayer) => {
    let wcPlayer = getPlayerWCData(mainPlayer.playerID);

    if(wcPlayer.activityTimeout != ""){
        clearTimeout(wcPlayer.activityTimeout);
        chopWood(message, mainPlayer, wcPlayer);
    }
}

const chopWood = (message, mainPlayer, wcPlayer) => {
    let timeSpent = Math.floor((Date.now() - wcPlayer.startTime)/(60000));//minutes

    let woodDistribution = getWood(mainPlayer);//Passing mainplayer to do location based gathering TODO
   
    //let woodDistStr = JSON.stringify(woodDistribution);
    //console.log(`woodDistribution: ${woodDistStr}`);

    let lootString = "";

    Object.keys(woodDistribution).forEach(woodType => {
        let gatheredWood = Math.floor(woodDistribution[woodType] * timeSpent);//#logs this type 

        if(wcPlayer.wcInventory.hasOwnProperty(woodType)){
            wcPlayer.wcInventory[woodType] += gatheredWood;
        }
        else{
            wcPlayer.wcInventory[woodType] = gatheredWood;
        }

        //not really doing level requirements currently
        let xpPerLog = getXP(woodType);
        wcPlayer.wcXP += (xpPerLog * gatheredWood);

        lootString += `\n ${woodType} logs: ${gatheredWood} `;
    });

    if(lootString === "") lootString = "None collected chop longer!";

    // Expectation per hr = 30 oak 20 willow 10 maple = 130 xp/hr
    message.channel.send(`${mainPlayer.playerUsername} finishes chopping wood after ${timeSpent} minutes. Gathered: ${lootString}`);

    while(wcPlayer.wcXP > wcPlayer.wcLvl*100){//while incase of multiple lvl ups at once
        wcPlayer.wcXP -= wcPlayer.wcLvl*100;
        wcPlayer.wcLvl++;

        message.channel.send(`${mainPlayer.playerUsername} has gained a woodcutting level! :evergreen_tree: Level: ${wcPlayer.wcLvl}`);
    }

    //Cleaning up state
    mainPlayer.currentAction = "None";
    wcPlayer.activityTimeout = "";
    wcPlayer.startTime = -1;
    saveWoodcuttingData();
}

const getWood = (mainPlayer) => {
    //TODO do this via player location
    let treeDist = {oak:0.5, willow:0.35, maple:0.15};

    let treeKeys = Object.keys(treeDist);//arr


    //Apply some randomization:
    let scaleNormalize = 0;

    treeKeys.forEach(element => {
        let scale = (Math.random()/5)+0.9;// 0.9 to 1.1
        //console.log(`${element}: ${treeDist[element]}`);

        treeDist[element] *= scale;

        scaleNormalize += treeDist[element];
    });

    treeKeys.forEach(element => {
        treeDist[element] /= scaleNormalize;
    });

    //let treeDistStr = JSON.stringify(treeDist);
    //console.log(`TreeDist: ${treeDistStr}`);
    return treeDist;
}

const getXP = (woodType)=>{
    switch (woodType) {
        case "oak":
            return 2;
            break;
    

        case "willow":
            return 3;
            break;
    
        
        case "maple":
            return 4;
            break;
        
        
            
                    
        default:
            return 0;
            break;
    }
}

const getInventory = (mainPlayer) =>{
    let wcPlayer = getPlayerWCData(mainPlayer.playerID);
    let invString = "";

    Object.keys(wcPlayer.wcInventory).forEach(element => {
        invString += `${element} logs: ${wcPlayer.wcInventory[element]} \n`;
    });

    return invString;
}

const getStats = (mainPlayer) => {

    let wcPlayer = getPlayerWCData(mainPlayer.playerID);
    return `Woodcutting lvl: ${wcPlayer.wcLvl} XP: ${wcPlayer.wcXP} \n`;
}

const getLvl = (mainPlayer) => {

    let wcPlayer = getPlayerWCData(mainPlayer.playerID);
    return wcPlayer.wcLvl;
}

module.exports = {start, stop, getInventory, getStats, getLvl};