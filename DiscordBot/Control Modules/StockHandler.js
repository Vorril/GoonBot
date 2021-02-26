//const { alphatoken } = require("../config.json");

const yahooFinance = require('yahoo-finance');

const handleStockCommands = (commandRead, commandModifier, message) => {
    if(commandRead == "!stock"){
        let ticker = commandModifier.toUpperCase();
        if (ticker == "") ticker = "SPY";

        yahooFinance.quote({
            symbol:ticker,
            modles: ['price', 'summaryDetail']
        },function(err, quotes){
            if(err){//console.log("Error stock unfound or api problem")
                     message.channel.send("Error, check ticker?")}
            else {
                //console.log(quotes.price);
                let output = ticker + " " +quotes.price.shortName + '\n';

                let currPrice = quotes.price.regularMarketPrice;
                let openPrice = quotes.price.regularMarketPreviousClose;
                let change = 100*((currPrice-openPrice)/openPrice);
                let changeStr = change.toString();
                let decimals = 4; // 0.23
                if(change < 0) decimals++;//-2.45
                if(change < -10 || change > 10) decimals++;//-23.56

                changeStr = changeStr.substr(0,decimals);
                if(change > 0) changeStr = "+"+changeStr;

                output = output + "$"+currPrice+ " (" + changeStr+"%)";

                message.channel.send(output);

            }
        });
        return;
    }

    else return "unfound";
}


module.exports = { handleStockCommands}