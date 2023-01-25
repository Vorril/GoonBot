
const fs = require("fs");
const Multimap = require('multimap');

let entryList = [];//[{"user":"userID","clip":"!clip"},{...},{...}...]
let audioMap = new Multimap();//[{command:'"!command","fpath":"./Audio/file.mp3"},{...}...]
let submittedAudioMap = [];//User submitted mp3s, less curated, keeping segregated // not implemented

//readFile audio unique user entry settings:
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
    var audioMapJSON = JSON.parse(data2);
    
    //console.log(audioMapJSON);

    //for(var audiocommand in audioMapJSON){
      //console.log(audiocommand.command);
      //console.log(audiocommand.fpath);
      //audioMap.set(audiocommand.command, audiocommand.fpath); //audioMapJSON[audiocommand]); // MultiMap
    //}
    audioMapJSON.forEach(element => {
      //console.log(element);
      //console.log(element.command);
      audioMap.set(element.command, element.fpath);
    });
    }
  console.log(`Loaded ${audioMap.size} entry audio settings`);
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

  
  //console.log(audioMap);

  //Search the audiomap loaded from file:
  if(audioMap.has(commandRead)){

    let foundVals = audioMap.get(commandRead);

    if(foundVals.length == 1) playAudio(message.member.voice.channel, foundVals[0]);

    else{//More than one value for the key
        let randIndex = Math.floor(Math.random() * foundVals.length);
        playAudio(message.member.voice.channel, foundVals[randIndex]);
    }

    setTimeout(() => {
        message.delete();
      }, deleteDelay);

    return;
  }

  //Not a command for a clip, check for other audio related commands:
  else switch (commandRead) {    
    //Unique clip calls or misc audioHandler commands
   
    case "!reload":
    case "!reloadaudio":
        audioMap.clear();
        
        fs.readFile("./Audio/audiomap.json", function(errLoad2, data2){
          if (errLoad2) {
            console.log("Failed to load audio file mapping json");
          } 
          else {
            var audioMapJSON = JSON.parse(data2);
      
            audioMapJSON.forEach(element => {
              //console.log(element);
              //console.log(element.command);
              audioMap.set(element.command, element.fpath);
            });

            }
          console.log(`Loaded ${audioMap.size} entry audio settings`);
        });//readFile audio command filename map
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
      let commandList = "Audio related commands:loud_sound:: \n !enter <clip> \n Clips: \n !friday ";//Need to put anything in the switch statement in here

      for (let key of audioMap.keys()){
        //console.log(key);
        commandList += (key + " ");
      }
      //keys.forEach(element => {
      //  commandList += (element + " ");
      //});


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
