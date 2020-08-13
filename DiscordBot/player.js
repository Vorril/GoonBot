class Player{
    
    constructor(data){//data = JSON.parse() object
        Object.assign(this, data);
    }
    
    playerTag = "UNSET"; 
    snickersEaten = 0;
    characterClass = "Peasant";
    HP = 10;
    gold = 0;
    //todo inventory array object

    lastActionTaken = "";
    LastActionTime = 0;

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

    setClass(){//sets random class from options
        var classIndex = Math.floor(Math.random()*classOptions.length);
        this.characterClass = classOptions[classIndex];
        
        console.log(this.characterClass);
    }

    printStats(message){
        var statString = message.author.username+"'s stats: \n";
        statString = statString + "Class: " + this.characterClass + "\n";
        statString = statString + "HP: " + this.HP + "\n";
        statString = statString + "Gold: " + this.gold + "\n";

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