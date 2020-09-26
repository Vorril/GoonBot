const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
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
      return "unfound";
      break;
  }
};

module.exports = { handleHelperCommands };
