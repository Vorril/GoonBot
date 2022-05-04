
const fs = require("fs");

let entryList = [];//[{"user":"userID","clip":"!clip"},{...},{...}...]
let audioMap = [];//[{command:'"!command","fpath":"./Audio/file.mp3"},{...}...]
let submittedAudioMap = [];//User submitted mp3s, less curated, keeping segregated

fs.readFile("./Audio/UserEntry.json", function (errLoad, data) {
  if (errLoad) {
    console.log("Failed to load entry audio settings json");
  } 
  else {
    entryList = JSON.parse(data); 
  }
  console.log(`Loaded ${entryList.length} entry audio settings`);
}); //readFile audio unique user entry settings

fs.readFile("./Audio/audiomap.json", function(errLoad2, data2){
  if (errLoad2) {
    console.log("Failed to load audio file mapping json");
  } 
  else {
     audioMap = JSON.parse(data2);
      //console.log(audioMap); //still contains \n chars but doesnt sem to be an issue for .parse(), Online sources made it seem like it would be
    }
  console.log(`Loaded ${audioMap.length} entry audio settings`);
});//readFile audio command filename map

fs.readFile("./Audio/Submitted/submittedAudio.json", function(errLoad2, data2){
  if (errLoad2) {
    console.log("Failed to load submitted audio file mapping json");
  } 
  else {
     submittedAudioMap = JSON.parse(data2);
      //console.log(audioMap); //still contains \n chars but doesnt sem to be an issue for .parse(), Online sources made it seem like it would be
    }
  console.log(`Loaded ${submittedAudioMap.length} submitted audio clips`);
});//readFile audio command filename map



//Set user's audio clip on channel enter, plays it, saves it
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
  fs.writeFile("./Audio/UserEntry.json", entryListJSON, 
    function (err) {}//{console.log("Failed to save audio entry data")} //Always throws err but works?
  );

  return "updated";
}

//Called by channel entry listener in index.js
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

//Checking through ! commands
const handleAudioCommands = (commandRead, commandModifier, message, playAudio) => {
  let deleteDelay = 350;
 
  //Check if someone is trying to set their entry
  if(commandRead == "!enter"){
      setEntry(commandModifier, message, playAudio);
      return;
    }


  //Search the audiomap loaded from file:
  let audioIndex = audioMap.findIndex(function(object){
    return object.command == commandRead;
  });
  //Check submitted index:
  if(audioIndex < 0) audioIndex = submittedAudioMap.findIndex(function(object){
    return object.command == commandRead;
  });


  if(audioIndex > -1){
    playAudio(message.member.voice.channel, audioMap[audioIndex].fpath);

    setTimeout(() => {
      message.delete();
    }, deleteDelay);

    return;//audio was found and played
  }


  switch (commandRead) {    
    //Unique clip calls or misc audioHandler commands
   
      case "!chickenwing":
        if(Math.random()>0.333){
          playAudio(message.member.voice.channel, "./Audio/chickenwing.mp3");}
        else{
          playAudio(message.member.voice.channel, "./Audio/chickenwing2.mp3");}
          
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
 
      case "!stranger":
        let rand = Math.random();
        if(rand < 0.3333){
          playAudio(message.member.voice.channel, "./Audio/st1.mp3");
        }
        else if(rand > 0.6667){
          playAudio(message.member.voice.channel, "./Audio/st2.mp3");
        }
        else{
          playAudio(message.member.voice.channel, "./Audio/st3.mp3");
        }

        setTimeout(() => {
          message.delete();
        }, deleteDelay);
      break;

      case "!bwonsamdi":
        let rand3 = Math.random();
        if(rand3 < 0.2){
          playAudio(message.member.voice.channel, "./Audio/Bwonsamdi/badloa.wav");
        }
        else if(rand3 < 0.4){
          playAudio(message.member.voice.channel, "./Audio/Bwonsamdi/died.wav");
        }
        else if(rand3 < 0.6){
          playAudio(message.member.voice.channel, "./Audio/Bwonsamdi/mistaken.wav");
        }
        else if(rand3 < 0.8){
          playAudio(message.member.voice.channel, "./Audio/Bwonsamdi/romance.wav");
        }
        else{
          playAudio(message.member.voice.channel, "./Audio/Bwonsamdi/truelove.wav");
        }

        setTimeout(() => {
          message.delete();
        }, deleteDelay);
      break;

      case "!later":
        let rand2 = Math.random();
        if(rand2 < 0.2){
          playAudio(message.member.voice.channel, "./Audio/eternitylater.wav");
        }
        else if(rand2 < 0.4){
          playAudio(message.member.voice.channel, "./Audio/sixlater.wav");
        }
        else if(rand2 < 0.6){
          playAudio(message.member.voice.channel, "./Audio/momentslater.wav");
        }
        else if(rand2 < 0.8){
          playAudio(message.member.voice.channel, "./Audio/threelater.wav");
        }
        else{
          playAudio(message.member.voice.channel, "./Audio/twentylater.wav");
        }


        setTimeout(() => {
          message.delete();
        }, deleteDelay);
      break;

      case "!lailai":
        let randlai = Math.random();
        if(randlai < 0.2){
          playAudio(message.member.voice.channel, "./Audio/lailai1.mp3");
        }
        else if(randlai < 0.4){
          playAudio(message.member.voice.channel, "./Audio/lailai2.mp3");
        }
        else if(randlai < 0.6){
          playAudio(message.member.voice.channel, "./Audio/lailai3.mp3");
        }
        else if(randlai < 0.8){
          playAudio(message.member.voice.channel, "./Audio/lailai4.mp3");
        }
        else{
          playAudio(message.member.voice.channel, "./Audio/lailai5.mp3");
        }


        setTimeout(() => {
          message.delete();
        }, deleteDelay);
      break;
      
    case "!friday":
      let today = new Date();
      let daycode = today.getDay();
      let hourcode = today.getHours();

      if(hourcode < 8) daycode = daycode-1;//Code seems to be fixed to GMT::00

      if(daycode == 5){
        playAudio(message.member.voice.channel, "./Audio/friday.mp3");}
      else
        playAudio(message.member.voice.channel, "./Audio/notfriday.wav");

      console.log(daycode+':'+hourcode);

      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;

    case "!audio":
    case "!audiocommands"://Most are autogenerated, these have special behavior
      let commandList = "Audio related commands:loud_sound:: \n !enter <clip> \n Clips: \n !chickenwing !stranger !friday";//Need to put anything in the switch statement in here

      audioMap.forEach(element => {
        commandList += (element.command + " ");
      });

      message.channel.send(commandList);
      break;

    default:
      return "unfound";
      break;
  }
};

const submitAudio = (message) => {
  let clipAttached = message.attachments.first();
  let clipName = clipAttached.name.substring(0,clipAttached.name.lastIndexOf(".mp3"));
  let clipFilename = clipName + ".mp3";

  //check both maps to see if command already in use, wont check non audio commands though so kind of sketchy
  let audioIndex = audioMap.findIndex(function(object){
    return object.command == clipName;
  });

  if(audioIndex < 0) audioIndex = submittedAudioMap.findIndex(function(object){
    return object.command == clipName;
  });


  //download:
  request.get(clipAttached.url)
    .on("error",console.log("URL get error"))
    .pipe(fs.createWriteStream("./Audio/Submitted/"+clipFilename));

  let commandObj;
  commandObj.command = "!"+clipName;
  commandObj.fpath = "./Audio/Submitted/"+clipFilename;

  submittedAudioMap.push(commandObj);

  //Save:
  fs.writeFile("./Audio/Submitted/submittedAudio.json", JSON.stringify(submittedAudioMap), function (
    err
  ) {console.log("Failed to save submitted during audiomap filesync")})
}

module.exports = { handleAudioCommands, handleEntryAudio, submitAudio };
