const Fishing = require("./Control Modules/Fishing.js");
const Woodcutting = require("./Control Modules/Woodcutting.js");
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
    
    chop(message){
        if(this.currentAction == "None"){
            Woodcutting.start(message, this);
        }
        else if(this.currentAction == "Woodcutting"){
            Woodcutting.stop(message, this);
        }

        else message.channel.send(`${this.playerUsername} is busy ${this.currentAction}`);//busy doing what could probably extract this to a function it will happen often
    
    }

    hydrate(message){
        this.hydration++;
        message.channel.send(`${this.playerUsername} is staying hydrated :sweat_drops:! ${this.hydration} lifetime glasses!`)
    
        reminder(message, "1 hr This is a friendly reminder to top off your H2O :droplet:");
    }

    printInventory(message){
        let inventoryString = "";
        
        //inventoryString += Fishing.getInventory(this);

        inventoryString += Woodcutting.getInventory(this);

        message.channel.send(`Your inventory: \n ${inventoryString}`);
    }

    printStats(message){
        let statStr = "";

        statStr += Fishing.getStats(this);
        statStr += Woodcutting.getStats(this);

        message.channel.send(`${this.playerUsername}'s stats: \n ${statStr}`);
    }

    save(){
        savePlayers();//throwback to main handler//should probly be static func
    }
}//Player

module.exports = Player