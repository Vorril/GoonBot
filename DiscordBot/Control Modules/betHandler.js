
class Casino{//Kind of  trating like a hacky singleton
    static currentBet = "";
    static betIsActive = false;
    static playerWagers = [];
    static betMadeBy = null;
    static potFor = 0;
    static potAgainst = 0;
}

class Wager{
    constructor(who, howMuch, whatBet){
        this.playerMaking = who;//player obj
        this.amount = howMuch;
        this.gamble = whatBet;
    }
    playerMaking; //player obj
    amount; //int
    gamble; //bool
}

function hasPermission(member) {
    let authorRoles = member.roles;    
    let hasAdmin = false;

    authorRoles.forEach((role) => {
        if(role.permissions & 0x8){ // 0x8 has admin 0x0010000000 // can Manage roles
            hasAdmin = true;
        }
    });

    return hasAdmin;
}


const startBet = ( message, mainPlayer, mod) =>{
    if(Casino.betIsActive)
        return `Already a bet in progress:: ${Casino.currentBet}`;

   if(hasPermission(message.member)){
        Casino.betIsActive = true;
        Casino.currentBet = mod;
        Casino.betMadeBy = mainPlayer.playerUsername;
        Casino.potFor = 0;
        Casino.potAgainst = 0;

        return `New bet running! \n ${mod} \n !bet <for/against/succeed/y/yes/n/no/will/wont/fail/favorite/underdog> <#amount>`;
   }
   return `Do not have permission to start a new bet`;

}

const endBet = (message, mainPlayer, mod) =>{
    if(!hasPermission(message.member) || mainPlayer.playerUsername != Casino.betMadeBy)
        return "You do not have permission to end the bet. Must be Admin or bet starter";

        let betBool = false;

        switch (mod) {
            case "for":
            case "y":
            case "will":    
            case "yes":
            case "succeed":
                betBool = true;
                break;
    
            case "against":
            case "wont":
            case "fail":
            case "n":
            case "no":   
                betBool = false;
                break;

            default:
                return "Unrecognized condition try again! <for/against/yes/no/will/wont>"
                break;
        }//switch

        let netPayout = Casino.potAgainst + Casino.potFor;

        let payoutStr = `Bet over with outcome ${mod}! \n Payouts: \n`
        
        Casino.playerWagers.forEach(wager => {
            if(wager.gamble == betBool){
                let payout = 0;

                if(betBool)
                    payout = (wager.amount/Casino.potFor) * netPayout;//will this cause integer rounding errors?
                else if(!betBool)
                    payout = (wager.amount/Casino.potAgainst) * netPayout;
            
                payout = Math.floor(payout);

                wager.playerMaking.goonpoints += payout;

                payoutStr += `${wager.playerMaking.playerUsername} won ${payout}! \n`

                }//win case
        });//for each checking all bets

        Casino.betIsActive = false;
        Casino.currentBet = "";
        Casino.betMadeBy = null;
        Casino.potFor = 0;
        Casino.potAgainst = 0;
        Casino.playerWagers = [];//Garbage collector should take care of it

        return payoutStr;
}//endbet

const bet = ( mainPlayer, mod) =>{
//Parse mod:
    if(!Casino.betIsActive) return "No bet active try !startbet <bet>";
    if(mod == "") return getBet();

    let spaceIndex = mod.indexOf(' ');

    if(spaceIndex <= 0) return "Bet not placed improper syntax wrong spacing. \n !bet <for/against/yes/no/will/wont/favorite/underdog> <#amount>"
    
    let token1 = mod.substr(0,spaceIndex);
    let token2 = mod.substr(spaceIndex);

    if(token1.length == 0 || token2.length == 0) return "Bet not placed. Missing syntax. No bet amount?";

    //SHOULD be <bet> <amount>
    let amount = parseInt(token2);
    let betFor = "";

    if (isNaN(amount)){
        amount = parseInt(token1);
        if(isNaN(amount)) return "Bet not placed. Could not parse amount";

        else betFor = token2; // they did <amount> <for>
    }

    if(betFor == "") betFor = token1; //they did it as intended

    betFor = betFor.toLowerCase();//cleanup

    if(amount <= 0) return "Bet not placed! Invalid amount";
    if(amount > mainPlayer.goonpoints) return "Cannot afford bet! Check your GP !stats or !points"

    let betBool = true;

    switch (betFor) {
        case "for":
        case "y":
        case "will":    
        case "yes":
        case "succeed":
            betBool = true;
            Casino.potFor += amount;
            mainPlayer.goonpoints -= amount;
            break;

        case "against":
        case "wont":
        case "fail":
        case "n":
        case "no":   
            betBool = false;
            Casino.potAgainst +=amount;
            mainPlayer.goonpoints -= amount;
            break;
    
        case "favorite":
            if(Casino.potFor >= Casino.potAgainst){
                betBool = true;
                Casino.potFor += amount;
                mainPlayer.goonpoints -= amount;
            }
            else{
                betBool = false;
                Casino.potAgainst +=amount;
                mainPlayer.goonpoints -= amount;
            }
            break;

        case "underdog":
            if(Casino.potFor < Casino.potAgainst){
                betBool = true;
                Casino.potFor += amount;
                mainPlayer.goonpoints -= amount;
            }
            else{
                betBool = false;
                Casino.potAgainst +=amount;
                mainPlayer.goonpoints -= amount;
            }
            break;

        default:
            return "Bet not placed! Could not tell bet type! <for/against/yes/no/favorite/underdog> ";
            break;
    }//switch

    Casino.playerWagers.push(new Wager(mainPlayer, amount, betBool));

    let boolString = betBool ? "For/Yes" : "Against/No";
    let betString = `Bet placed by ${mainPlayer.playerUsername}! ${amount} ${boolString}! \n`;
    betString += `Total For/Yes: ${Casino.potFor} \n Total Against/No: ${Casino.potAgainst}`;

    return betString;
}//bet

const getBet = () =>{
    if(!Casino.betIsActive)
        return "No current bet active!"

    else
        return Casino.currentBet;
}

module.exports = {startBet, endBet, bet, getBet};