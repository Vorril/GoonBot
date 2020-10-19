
const fs = require("fs");

let entryList = [];//[{"user":"userTag","clip":"!clip"},{...},{...}...]

fs.readFile("./Audio/userEntry.json", function (errLoad, data) {
  if (errLoad) {
    console.log("Failed to load entry audio settings");
  } 
  else {
    entryList = JSON.parse(data); 
  }
  console.log(`Loaded ${entryList.length} entry audio settings`);
}); //readFile


const setEntry = (commandModifier, message, playAudio)=>{
  //Cleanup/check input
  if(!commandModifier.startsWith("!")){
    commandModifier = '!' + commandModifier;
  }
  if(commandModifier == "!enter") return "unfound";//cheeky cunt

  //Checking if clip is found
  let checkAudio = handleAudioCommands(commandModifier, "", message, playAudio);

  if(checkAudio == "unfound") return "unfound";

  //Preparing and saving data
  //Should check that none of this is undefined
  let settingUser = message.author.id;
  let userData = {user:settingUser, clip:commandModifier};

  let userIndex = entryList.findIndex(function(object){
    return object.user == userData.user;
  });

  if(userIndex == -1)
    entryList.push(userData);
  else{
    entryList[userIndex].clip = userData.clip;
  }

  let entryListJSON = JSON.stringify(entryList);
  console.log(entryListJSON);
  fs.writeFile("./Audio/userEntry.json", entryListJSON, 
    function (err) {}//{console.log("Failed to save audio entry data")} //Always throws err but works?
  );

  return "updated";
}

const handleEntryAudio = (currentChannel, userID, playAudio) =>  {
  //Check if user is in the cache 
  let userIndex = entryList.findIndex(function(object){
    return object.user == userID;
  });

  let clipToUse;
  userIndex == -1 ? clipToUse = "!beta" : clipToUse = entryList[userIndex].clip;

  //Create an audio call, nesting channel info in a fake message. Message is generally a more useful parameter contains a lot more info but ehre we dont have actually have one
  let fakeMessage = {member:{voice:{channel:currentChannel}},delete(){}};

  handleAudioCommands(clipToUse, "", fakeMessage, playAudio);
};

const handleAudioCommands = (commandRead, commandModifier, message, playAudio) => {
  let deleteDelay = 350;
 
  switch (commandRead) {
    //set personalized audio clips
    case "!enter":
      setEntry(commandModifier, message, playAudio);
    break;

    //Clip library
    case "!beta":
      playAudio(message.member.voice.channel, "./Audio/beta.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!amazing":
    case "!amazin":
      playAudio(message.member.voice.channel, "./Audio/amazin.wav");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!brb":
      playAudio(message.member.voice.channel, "./Audio/brb.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!interesting":
      playAudio(message.member.voice.channel, "./Audio/interesting.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!mexicans":
      playAudio(message.member.voice.channel, "./Audio/mexicans.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!ow":
      playAudio(message.member.voice.channel, "./Audio/ow.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
    case "!surprise":
      playAudio(message.member.voice.channel, "./Audio/surprise.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!know":
        case "!trash":
        playAudio(message.member.voice.channel, "./Audio/trash.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
      case "!stfu":
      playAudio(message.member.voice.channel, "./Audio/stfu.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!chickenwing":
        if(Math.random()>0.2){
          playAudio(message.member.voice.channel, "./Audio/chickenwing.mp3");}
        else{
          playAudio(message.member.voice.channel, "./Audio/chickenwing2.mp3");}
          
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!no":
      playAudio(message.member.voice.channel, "./Audio/no.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!guilty":
      playAudio(message.member.voice.channel, "./Audio/guilty.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!murder":
      playAudio(message.member.voice.channel, "./Audio/murder.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!again":
      playAudio(message.member.voice.channel, "./Audio/again.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!blastin":
      playAudio(message.member.voice.channel, "./Audio/blastin.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
      case "!finish":
      case "!croissant":
        playAudio(message.member.voice.channel, "./Audio/croissant.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
        case "!slutmaker":
        playAudio(message.member.voice.channel, "./Audio/slutmaker.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
        case "!afraid":
        playAudio(message.member.voice.channel, "./Audio/afraid.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
        case "!simp":
        playAudio(message.member.voice.channel, "./Audio/simp.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
        case "!yes":
        playAudio(message.member.voice.channel, "./Audio/yes.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;
        case "!triple":
        playAudio(message.member.voice.channel, "./Audio/triple.mp3");
        setTimeout(() => {
          message.delete();
        }, deleteDelay);
        break;

    default:
      return "unfound";
      break;
  }
};

module.exports = { handleAudioCommands, handleEntryAudio };
