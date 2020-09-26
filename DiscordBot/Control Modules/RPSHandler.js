let rpsQueue = "";
let rpsChoice;

const handleRPS = (commandModifier, message) => {
  const validCommands = ["rock", "r", "paper", "p", "scizzor", "s"];
  if (!validCommands.includes(commandModifier)) {
    message.delete();
    message.channel.send("Invalid choice: rock/paper/scizzor/r/p/s");
    return;
  }
  //First player queues up:
  else if (rpsQueue == "") {
    //should probably be a per channel function?
    rpsQueue = message.author;
    message.channel.send(
      `${rpsQueue} wants to play rock paper scizzors! Type !rps <rock/paper/scizzor/r/p/s>`
    );
    message.delete();

    rpsChoice = commandModifier;
    //Simplify for logic comparison later:
    if (rpsChoice == "rock") rpsChoice = "r";
    if (rpsChoice == "paper") rpsChoice = "p";
    if (rpsChoice == "scizzor") rpsChoice = "s";
    return;
  }
  //Else player 2 also w/ a valid input:
  else {
    let choice2 = commandModifier;
    if (choice2 == "rock") choice2 = "r";
    if (choice2 == "paper") choice2 = "p";
    if (choice2 == "scizzor") choice2 = "s";

    let outputStr = `Rock Paper Scissor Results:\n`;

    if (rpsChoice == choice2) {
      const wordChoice1 =
        rpsChoice === "r" ? "rock" : rpsChoice === "p" ? "paper" : "scissor";
      const wordChoice2 =
        choice2 === "r" ? "rock" : choice2 === "p" ? "paper" : "scissor";

      message.channel.send(
        outputStr +
          `${rpsQueue} (${wordChoice1}) and ${message.author} (${wordChoice2}) tied`
      );

      message.delete();
      rpsQueue = "";
      rpsChoice = "";
      return;
    }

    let p1Wins = true; //assume p1 wins and only check fail cases
    //Jas you should do this with Ternary operator for shits
    //Challenge Accepted
    if (rpsChoice == "r" && choice2 == "p") {
      p1Wins = false;
    } else if (rpsChoice == "p" && choice2 == "s") {
      p1Wins = false;
    } else if (rpsChoice == "s" && choice2 == "r") {
      p1Wins = false;
    }

    const wordChoice1 =
      rpsChoice === "r" ? "rock" : rpsChoice === "p" ? "paper" : "scissor";
    const wordChoice2 =
      choice2 === "r" ? "rock" : choice2 === "p" ? "paper" : "scissor";

    if (p1Wins)
      outputStr += `${rpsQueue} (${wordChoice1}) beats ${message.author} (${wordChoice2})!`;
    else
      outputStr += `${message.author} (${wordChoice2}) beats ${rpsQueue} (${wordChoice1})!`;
    message.channel.send(outputStr);

    message.delete();
    rpsQueue = "";
    rpsChoice = "";
    return;
  }
};

module.exports = { handleRPS };
