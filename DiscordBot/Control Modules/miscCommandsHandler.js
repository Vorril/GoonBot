const handleMiscCommands = (commandRead, message, process) => {
  switch (commandRead) {
    case "!cleanup":
      //clear useulss / old chat messages
      break;

    //Testing funcitons:
    case "!time":
      const currdate = Date.now();
      message.channel.send(currdate);
      break;

    case "!ram":
      const ramUsage = process.memoryUsage();
      message.channel.send(
        "Total process RSS: " +
          Math.floor(ramUsage.rss / 1024 / 1024) +
          "MB \n Total Heap: " +
          Math.floor(ramUsage.heapUsed / 1024 / 1024) +
          "MB"
      );
      break;

    default:
      return "unfound";
      break;
  }
};

module.exports = { handleMiscCommands };
