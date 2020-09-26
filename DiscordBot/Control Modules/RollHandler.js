const handleDiceRoll = (command, author) => {
  function roll(range) {
    return Math.floor(Math.random() * range) + 1;
  }
  if (command == "") {
    let rolled = roll(100);
    return `${author} rolled: \n ${rolled} (1-100)`;
  }
  command = command.trimEnd();
  let dice = command.split(" ", 20);

  let rollOutput = `${author} rolled: \n`;
  dice.forEach((element) => {
    diceSize = parseInt(element, 10);
    if (!isNaN(diceSize) && diceSize > 0) {
      rolled = roll(roll(diceSize));
      rollOutput += `${rolled} (1-${diceSize})\n`;
    }
  });
  return rollOutput;
};

module.exports = { handleDiceRoll };
