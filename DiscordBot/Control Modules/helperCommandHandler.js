const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
    case "!commands":
      message.channel.send(
        `GoonBot know do these: \n !gif <search> \n !roll <#> <...> \n !rps <#players> \n !remind(er) <When> <Note> \n !snickers
         \n !Audio !Audiocommands
         !know \n RPG commands: !fish !busy !current !activity !where !explore !travel <Destination> !stats`
     
        ); //!startQuest \n !stats");
      break;

    case "!devcommands":
      message.channel.send(
        "Commands for smrt bois: !ram \n !time"
      );
      break;

    default:
      return "unfound";
      break;
  }
};

module.exports = { handleHelperCommands };
