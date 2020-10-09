

const handleAudioCommands = (commandRead, message, playAudio) => {
  let deleteDelay = 350;
 
  switch (commandRead) {
    //audio
    case "!beta":
      playAudio(message.member.voice.channel, "./Audio/beta.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;
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
      playAudio(message.member.voice.channel, "./Audio/chickenwing.mp3");
      setTimeout(() => {
        message.delete();
      }, deleteDelay);
      break;

    default:
      return "unfound";
      break;
  }
};

module.exports = { handleAudioCommands };
