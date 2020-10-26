const Fishing = require("./Control Modules/Fishing.js");
const {savePlayers} = require("./Control Modules/RPGHandler.js");//feels like circular dependancy
const {reminder} = require("./Control Modules/miscCommandsHandler.js");

class Player{
    
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
    }
    
    playerUsername = "UNSET"; 
    playerID = -1;

    hydration = 0;

    currentAction = "None";//Might become innacurate if something is in progress and bot crashes

    //TODO inventory
    
/***************************************
  *********      FUNCTIONS       *********
  ***************************************/


    fish(message){      
        if(this.currentAction == "None"){//check if busy multiple ways to track this
           Fishing.start(message, this);
        }
        else message.channel.send(`${this.playerUsername} is busy ${this.currentAction}`);//busy doing what could probably extract this to a function it will happen often
    }
    
    hydrate(message){
        this.hydration++;
        message.channel.send(`${this.playerUsername} is staying hydrated :sweat_drops:! ${this.hydration} lifetime glasses!`)
    
        reminder(message, "1 hr This is a friendly reminder to top off your H2O :droplet:");
    }

    save(){
        savePlayers();//throwback to main handler
    }
}//Player

module.exports = Player