const handleHelperCommands = (commandRead, message) => {
  switch (commandRead) {
    case "!commands":
      message.channel.send(
        `GoonBot know do these: \n !gif <search> \n !stock <ticker> \n !hydrate \n !roll <#> <...> \n !rps <#players> \n !remind(er) <When> <Note> \n !hydrated
         \n !audio !audiocommands
         \n !joke
         \n RPG commands: !fish !chop !inv !inventory !stats !hiscore
         \n !startbet <bet> !bet <for/against> <amount> !endbet <outcome>
         \n !clean !clear <#>
         \n !ticket <yourcrappyopinion>`
        
        ); //!startQuest \n !stats");
      break;

    case "!devcommands":
      message.channel.send(
        "Commands for smrt bois: !ram \n !time  \n !forcesave" 
      );
      break;

    default:
      return "unfound";
      break;
  }
};

module.exports = { handleHelperCommands };
