class Player{
    
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
    }
    
    playerTag = "UNSET"; 
    snickersEaten = 0;
    characterClass = "Peasant";
    HP = 10;
    gold = 0;
    fishCaught = 0;
    //todo inventory array object

    currentAction = "None";//Might become innacurate if something is in progress and bot crashes
    lastActionTaken = "";
    lastActionTime = 0;//Was going to use this and check based on Date.now() but just doing intervals seems easier
    activityTimeout = "";//hold timeout var from node interval function // should be private


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

   

    fish(message){//wanted to do this recursively but passing class functions is nonsense bc of .this scope I guess?
      
        if(this.activityTimeout == ""){//check if busy multiple ways to track this
           
            var self = this;
            self.activityTimeout = setInterval(function(){self.fishLoop(message)}, 5000);
            this.currentAction = "Fishing";
         return;
            
            
            //this.activityTimeout = setInterval( function()  {this.fishLoop(message)},3000);//is not a function or callback errors
            //this.currentAction = "Fishing";

        }
        else message.channel.send(`${message.author.username} is busy ${this.currentAction}`);//busy doing what could probably extract this to a function it will happen often
    }
    fishLoop(message){
   //    fishLoop = (message)=>{
        if(Math.random() > 0.9){//Tie into fishing skill
            //TODO type of fish and inventory
            message.channel.send(`${message.author.username} catches a fish!`);
            clearInterval(this.activityTimeout);
            this.activityTimeout = "";
            this.currentAction = "none";
            this.fishCaught++;
        }
       // else console.log("Tick");
    }

    setClass(){//sets random class from options
        var classIndex = Math.floor(Math.random()*classOptions.length);
        this.characterClass = classOptions[classIndex];
        
    }

    printStats(message){
        var statString = message.author.username+"'s stats: \n";
        statString = statString + "Class: " + this.characterClass + "\n";
        statString = statString + "HP: " + this.HP + "\n";
        statString = statString + "Gold: " + this.gold + "\n";
        statString = statString + "Fish caught: " + this.fishCaught + "\n";

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