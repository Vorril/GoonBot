const Map = require("./Control Modules/MapHandler.js");


class Player{
    
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
        this.restartActivity();
    }
    
    playerTag = "UNSET"; 
    location = "Home";
    snickersEaten = 0;
    characterClass = "Peasant";
    gold = 0;
    combatLvl = 1; combatXP = 0; HP = 10;
    adventuringLvl = 1; travelDestination = "";
    weapon = {};
    armor = {};
    fishingLvl = 1; fishingXP = 0; fishCaught = 0;
    entrySound = "";
    //todo inventory array object

    currentAction = "None";//Might become innacurate if something is in progress and bot crashes
    lastActionTaken = "";
    activityTimeout = "";//hold timeout var from node interval function // should be private
    lastActionTime = 0;// Time action begins
    actionProgress = -1;//For saving Date.now() - lastActionTaken;
    needsSaved = false;


    checkActivity(message){
      let activity = this.currentAction;
      if (activity == "None" ){
        message.channel.send(`${message.author} is not busy with anything.`);
        return;
      }
      
     // console.log(`${message.author} checks time ${Date.now()} Past time: ${this.lastActionTime}`);

      let time_ms = Date.now() - this.lastActionTime;
      let time_s = Math.floor(time_ms/1000);
      let time_m = 0;
      let time_hr = 0;

      if(time_s >= 60) {
        time_m = Math.floor(time_s/60);
        time_s = time_s % 60;
      }

      if(time_m >= 60) {
        time_hr = Math.floor(time_m/60);
        time_m = time_m % 60;
      }

      let totalTime = "";
      if(time_hr > 0) totalTime += `${time_hr}hr `;
      if(time_m > 0) totalTime += `${time_m}m `;
      totalTime += `${time_s}s`;

      message.channel.send(`${message.author} has been ${this.currentAction} for ${totalTime}!`);
    }

    restartActivity(){//For restarting an activity on reload
        if(this.currentAction != "None" && this.actionProgress != -1){
            switch (this.currentAction) {
                case "Fishing":
                    
                    break;
                case "Exploring":
                    this.explore({}, true);
                    break;

                case "Traveling":

                    break;
                default:
                    break;
            }
        }

        else{//make sure data starts in a good setup
            this.currentAction = "None";
            this.actionProgress = -1;
        }
    }

    //test function
    eatSnickers(message){
        //console.log("Enter this.eatSnickers method");
        this.snickersEaten++;
        var stringFeedback = `${message.author.username} eats a snickers. They have eaten ${this.snickersEaten} snickers. \n`;
        switch (this.snickersEaten) {
            case 1:
                stringFeedback = stringFeedback + "Yum.";
                break;
            case 2:
                stringFeedback = stringFeedback + message.author.username  + " was a hungy boi.";
                break;
            case 3:
                stringFeedback = stringFeedback + "Put the candy down.";
                break;
            case 4:
                stringFeedback = stringFeedback + "Starving children could have eaten that.";
                break;
            case 5:
                stringFeedback = stringFeedback + "GoonBot was save that one for GoonBot.";
                break;
            default:
                stringFeedback = stringFeedback + "Pls stop you has diabeetus";
                break;
        }
        message.channel.send(stringFeedback);
    };

/***************************************
  *********      FISHING       *********
  ***************************************/

   //XP 100, 300 ,600, 1000
    catchFish(level){
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


    }
    fish(message){
      
        if(this.currentAction == "None"){//check if busy multiple ways to track this
           
            var self = this;
            self.activityTimeout = setInterval(function(){self.fishLoop(message)}, 5000);//this way multiple people can do it as its an object function...
            this.currentAction = "Fishing";
            this.lastActionTime = Date.now();
           // console.log(`${message.author} starts fishing ${this.lastActionTime}`);
         return;
            
        }
        else message.channel.send(`${message.author.username} is busy ${this.currentAction}`);//busy doing what could probably extract this to a function it will happen often
    }
    fishLoop(message){
   //    fishLoop = (message)=>{
        if(Math.random() > 0.8){//catch success
            //TODO inventory
            let caughtFish = this.catchFish(this.fishingLvl);
            message.channel.send(`${message.author.username} caught a fish! A ${caughtFish.type} :fishing_pole_and_fish: +${caughtFish.xp}XP`);
           
           //Cleanup action tracking
            clearInterval(this.activityTimeout);
            this.activityTimeout = "";
            this.currentAction = "None";
            this.lastActionTaken = "Fishing";
            this.actionProgress = -1;

            //XP and leveling
            this.fishCaught++;
            this.fishingXP += caughtFish.xp;

            if(this.fishingXP >= (this.fishingLvl*100)){
                this.XP -= this.fishingLvl*100;
                this.fishingLvl++;
                message.channel.send(`${message.author.username} has leveled up! Fishing level ${this.fishingLvl}! :fireworks: :shark:`);
            }

            this.needsSaved = true;
        }
       // else console.log("Tick");
    }

  /***************************************
  *********       EXPLORE        *********
  ***************************************/

  explore(message, loading = false){
    if(this.currentAction == "None" && loading == false){//check if busy multiple ways to track this
           
        var self = this;
        self.activityTimeout = setTimeout(function(){self.exploreCallback(message)}, 30*60000);//this way multiple people can do it as its an object function...
        this.currentAction = "Exploring";
        this.lastActionTime = Date.now();
     return;
        
    }
    else if(this.currentAction != "None") message.channel.send(`${message.author.username} is busy ${this.currentAction}`);//busy doing what could probably extract this to a function it will happen often

    else if(loading){
        //need a defualt channel or something to use, maybe send a PM by default instead?
    }
  }
  exploreCallback(message){
    //TODO calculate success odds base on Map.diffuclty and player.adventuring lvl
    let output = `${this.playerTag} has succesfully explored ${this.location}!\n`;
    let locationInfo = Map.getLocationInfo(this.location);

    output += `Nieghboring locations were scouted: `;
    locationInfo.connections.forEach(element => {
        output += element+ ' ';
    });

    output += `\n Potential enemies scouted: `;
    locationInfo.enemies.forEach(element => {
        output += element+ ' ';
    });

    output += `\n Points of interest scouted: `;
    locationInfo.POI.forEach(element => {
        output += element+ ' ';
    });

    message.channel.send(output);

  }

  travel(message, destination){

  }


  /***************************************
  *********    MISCELLANEOUS     *********
  ***************************************/

    setClass(message){//sets random class from options
        if(this.characterClass != "peasant"){
            message.channel.send("You already have a class!");
            return;  
        } 

        var classIndex = Math.floor(Math.random()*classOptions.length);
        this.characterClass = classOptions[classIndex];
        message.channel.send(`Your new class is ${this.characterClass}!`);
    }

    printStats(message){
        var statString = message.author.username+"'s stats: \n";
        statString = statString + "Class: " + this.characterClass + "\n";
        statString = statString + "HP: " + this.HP + "\n";
        statString = statString + "Gold: " + this.gold + "\n";
        statString = statString + "Fish caught: " + this.fishCaught + "\n";
        statString = statString + "Fishing level: " + this.fishingLvl + "\n";

        if(this.HP <= 0) statString = statString + message.author.username + " is ded \n";

        if(this.gold == 0) statString = statString + message.author.username + " is a broke bitch \n";
        else if(this.gold < 0) statString = statString + message.author.username + " is in massive debt \n";

        if(this.snickersEaten > 5) statString = statString + "They have diabeetus \n";

        message.channel.send(statString);
    }

    printInventory(message){


    }
}

const classOptions = ["Warrior","Rogue","Stripper","Mage","Merchant","Pokemon Trainer","Priest","Software Engineer","Alchemist"];

module.exports = Player