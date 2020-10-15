const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
    case "!commands":
      message.channel.send(
        `GoonBot know do these: \n !gif <search> \n !roll <dice size> \n !rps <r/p/s> \n !remind(er) <When> <Note> \n !snickers
         \n Audio: !enter <clip> !beta !amazin !brb !interestin !mexicans !ow !surprise !trash !stfu !chickenwing !no !murder !again !guilty !finish !crossaint
         !know \n RPG commands: !busy !current !activity !where !explore !travel <Destination> !stats !fish `// !where !explore"
     
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
