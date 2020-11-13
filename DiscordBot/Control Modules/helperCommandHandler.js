const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
    case "!commands":
      message.channel.send(
        `GoonBot know do these: \n !gif <search> \n !hydrate \n !roll <#> <...> \n !rps <#players> \n !remind(er) <When> <Note> \n !hydrated
         \n !audio !audiocommands
         \n RPG commands: !fish !chop !inv !inventory !stats`
     
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
