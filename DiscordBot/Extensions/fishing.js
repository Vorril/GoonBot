class Fishing{
    constructor(){


    }

    static importProperties(){//create a blank obj meant to be Object.assign()'ed to give the fishing properties to player kind of like implement in c?
        var protoFishing = new Fishing();
        return protoFishing;
    }
    //new Player methods to add:
    funcA = function(){
        
        console.log("funcA imported");
    }
    //new player member vars to add // TODO this will probly cause overwrite errors on saved data when booting
    fishingMember = 555;
    fishingEmpty;

    static importCommands(){
        var commands_functions = [];
        commands_functions.push({"imported":function(){console.log("This function was imported"+arguments[0].snickersEaten)}});

        return commands_functions;

    }


}
module.exports = Fishing