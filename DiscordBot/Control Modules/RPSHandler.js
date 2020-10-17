
let RPScollector = {};
let filteredMsgList = [];

const RPSfilter = (filteredMsg) => {
//trim if people start with '!' ?

  switch (filteredMsg.content.toLowerCase()) {
    case "rock":
    case "r":
    case "paper":
    case "p":
    case "scissor":
    case "s":

  console.log(`Filtered: ${filteredMsg.content}`);//should only add on succesful
  let msgAuthor = filteredMsg.author.username;

  let userIndex = filteredMsgList.findIndex(function(object){
    return object.userName == msgAuthor;
  });

  if(userIndex == -1){//adding choice
    filteredMsgList.push({userName:msgAuthor, msg:filteredMsg.content.toLowerCase()});


    if(++RPScollector.numCollected >= RPScollector.maxCollects){//should see about changing to numFilteredfor application@!
      RPScollector.stop("Hit collect limit");}

    filteredMsg.delete();

    return true;
  }
  else return false;//They already submitted a choice
      break;
  
    default:
      return false;
      break;
  }
}


const handleRPS = (commandModifier, message) => {
  console.log("Enter rps func call");

  //Setup numPLayers
let numPlayers = 2;
let playerNumParse = parseInt(commandModifier);
if(!isNaN(playerNumParse) && playerNumParse > 2){
  numPlayers = playerNumParse;}

//Initiate collector
 if(Object.keys(RPScollector).length===0){//RPS game currently innactive
  //console.log("Initiating RPScollector");
  RPScollector = message.channel.createMessageCollector(RPSfilter, {time:20000});//, {max:numPlayers});// max doesnt work for some reason
  
  RPScollector.maxCollects = numPlayers;// max setting of messagecollector class should work but isnt initializing or im doing it wrong
  RPScollector.numCollected = 0;
  

  RPScollector.on("collect", collectedMsg => {
   // console.log(`Collected: ${collectedMsg.content}`);
  
  });

  RPScollector.on("end", collectedList => {
    //console.log("end");
    //console.log(filteredMsgList);

    let numRock = 0;
    let numPaper = 0;
    let numScissor = 0;

    filteredMsgList.forEach(element => {
      if(element.msg == "r" || element.msg == "rock") numRock++;
      if(element.msg == "s" || element.msg == "scissor") numScissor++;
      if(element.msg == "p" || element.msg == "paper") numPaper++;
    });

    let winState = "";
    if(numRock > 0 && numPaper > 0 && numScissor > 0) winState = "draw";
    else if(numRock == 0 && numPaper == 0) winState = "draw";
    else if(numScissor == 0 && numRock == 0) winState = "draw";
    else if(numScissor == 0 && numPaper == 0) winState = "draw";
    else if(numRock == 0) winState = "Scissor";
    else if(numPaper == 0) winState = "Rock";
    else if(numScissor == 0) winState = "Paper";

    let winString = "";

    if(winState==="draw") 
      winString += "The game is a draw! \n";
    else if(winState==="Rock")
      winString += "Rock wins! :rock: \n";
    else if(winState==="Paper")
      winString += "Paper wins! :page_facing_up: \n";
    else if(winState==="Scissor")
      winString += "Scissor wins! :scissors: \n";

    filteredMsgList.forEach(element => {
      winString += element.userName;
      if(element.msg == "r" || element.msg == "rock"){
        if(winState=="Rock") winString += "(WINNER) ";
        winString += ":rock:\n";
      }
      else if(element.msg == "s" || element.msg == "scissor"){
        if(winState=="Scissor") winString += "(WINNER) ";
        winString += ":scissors:\n";
      }
      else if(element.msg == "p" || element.msg == "paper"){
        if(winState=="Paper") winString += "(WINNER) ";
        winString += ":page_facing_up:\n";
      }
    });

    message.channel.send(winString);

    RPScollector = {};
    filteredMsgList = [];
  });

  message.channel.send(`Starting a rock-paper-scissors game for ${numPlayers} players! Enter your choice within 20s (r/p/s/rock/paper/scissor) `);
 }//if starting a new game
};

module.exports = { handleRPS };
