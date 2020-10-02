const handleMiscCommands = (commandRead, commandModifier, message, process) => {
  switch (commandRead) {
    case "!cleanup":
      //clear useulss / old chat messages
      break;

    case "!remind":
    case "!reminder":
      reminder(message, commandModifier);
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
};//handleMisc end


function isTimeUnit(parseString){
  switch (parseString.toLowerCase()) {
    case "ms":
    case "s":
    case "sec":
    case "second":
    case "seconds":
    case "m":
    case "min":
    case "minute":
    case "minutes":
    case "h":
    case "hr":
    case "hrs":
    case "hour":
    case "hours":
    case "d":
    case "day":
    case "days":
    //more
      return true;
      break;
    default:
      return false;
      break;
  }
  
}
//Todo timestamps and reload permanence/ saving reminderto file etc
function reminder(message, what, when = 3600000){
  let messageParse = what.split(" ");
  if(messageParse.length == 1){// no time info given
    let reminderTimer = setTimeout(function(){message.author.send(what);}, when);// Should work for multiple people at once?
    message.channel.send("GoonBot remind you in 1 hour!");
    return;//alternatively store a list of time stamps and periodically check it
  }
  //else
  let timeParse = messageParse.shift();// #X msg or # X msg -> msg or X msg // timeParse = # or #X
  
  let timeUnit = "";
  let timeNumber;

  //logic for people who split 4 m or 5 d instead of 4m 5d etc
  //Will probably cause in error in the edge case that someones message begins with a time unit but they used the #X format
  if(isTimeUnit(messageParse[0])){ //case # X msg
    timeUnit = messageParse.shift(); // = X
    timeUnit = timeUnit.toLowerCase();
    //timeParse is correct = #
    //messageParse = msg or "" (or error? check case where no msg given)
    }

    //logic for 1m 3hour etc unsplit case
    else{// case #X msg, currently timeParse = #X
      let unitIndex = timeParse.search(/[a-z]/i);
      if(unitIndex == -1) {
        message.channel.send("GoonBot not understand time");
        return;
      }

      timeUnit = timeParse.substring(unitIndex);
      timeParse = (timeParse.substring(0, unitIndex)).toLowerCase();

    }
  //console.log(`TimeUnit ${timeUnit}`);
  
  if(timeParse.includes(".")){
    timeNumber = parseFloat(timeParse);
  }
  else{
    timeNumber = parseInt(timeParse);
  }
    
  if(isNaN(timeNumber)) {
    message.channel.send("GoonBot not understand time");
    return;
  }

   // console.log(`timeNumber ${timeNumber}`);

    switch (timeUnit) {
      case "ms":
        when = timeNumber;
        break;
      case "s":
      case "sec":
      case "second":
      case "seconds":
        when = timeNumber * 1000;
        break;
      case "m":
      case "min":
      case "minute":
      case "minutes":
        when = timeNumber * (1000 * 60);
        break;
      case "h":
      case "hr":
      case "hrs":
      case "hour":
      case "hours":  
        when = timeNumber * (1000 * 60 * 60);
        break;
      case "d":
      case "day":
      case "days":
        when = timeNumber * (1000 * 60 * 60 * 24);
        break;

      default:
        message.channel.send("GoonBot not understand time");
        return;
        break;
    }
    when = Math.floor(when);
    //console.log(`When ${when}`);


  let msg = "";

  messageParse.forEach(element => {
    msg += (element+' ');
  });
  
 // console.log(`msg: ${msg}`);

 if(msg == "") msg = "This is a reminder!";
 
  let reminderTimer = setTimeout(function(){message.author.send(msg);}, when);
  message.channel.send(`GoonBot remind you in ${timeNumber} ${timeUnit}!`);
  };

module.exports = { handleMiscCommands };
