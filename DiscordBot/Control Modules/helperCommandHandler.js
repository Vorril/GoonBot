const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
    case "!commandlist":
      var keyNames = "";
      commandList.forEach((element) => {
        keyNames += Object.keys(element) + "\n";
      });
      console.log("Commands found in commandList:" + "\n" + keyNames);
      break;

    case "!commands":
      message.channel.send(
        "GoonBot know do these: \n !gif <search> \n !snickers \n !fish \n !stats \n"
      ); //!startQuest \n !stats");
      break;

    case "!devcommands":
      message.channel.send(
        "Commands for smrt bois: !ram \n !time \n !addtestplayer"
      );
      break;

    default:
      message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
  }
};

export { handleHelperCommands };
