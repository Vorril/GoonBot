const handleAudioCommands = (commandRead, message, playAudio) => {
  switch (commandRead) {
    //audio
    case "!beta":
      playAudio(message.member.voice.channel, "./Audio/beta.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!amazin":
      playAudio(message.member.voice.channel, "./Audio/amazin.wav");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!brb":
      playAudio(message.member.voice.channel, "./Audio/brb.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!interesting":
      playAudio(message.member.voice.channel, "./Audio/interesting.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!mexicans":
      playAudio(message.member.voice.channel, "./Audio/mexicans.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!ow":
      playAudio(message.member.voice.channel, "./Audio/ow.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;
    case "!surprise":
      playAudio(message.member.voice.channel, "./Audio/surprise.mp3");
      setTimeout(() => {
        message.delete();
      }, 350);
      break;

    default:
      message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
  }
};

export { handleAudioCommands };
