const { giphytoken } = require("../config.json");

const GphApiClient = require("giphy-js-sdk-core");
let giphy = GphApiClient(giphytoken);

const handleGifsRandom = () => {
  //message.channel.send("Command seen");
  giphy.search("gifs", { q: "random" }).then((response) => {
    var totalResponses = response.data.length;
    var responseIndex = Math.floor(Math.random() * 10 + 1) % totalResponses;
    var responseFinal = response.data[responseIndex];

    return [
      "Random gif",
      {
        files: [responseFinal.images.fixed_height.url],
      },
    ];
  });
};

const handleGifsWithQuery = (commandModifier) => {
  giphy
    .search("gifs", { q: commandModifier }) //TODO clear symbols from search query
    .then((response) => {
      var totalResponses = response.data.length;
      if (totalResponses == 0) {
        message.channel.send("No results ijjit dont be ptupid");
        return;
      }
      var responseIndex = Math.floor(Math.random() * 10 + 1) % totalResponses;
      var responseFinal = response.data[responseIndex];

      return [
        `${totalResponses} ${commandModifier} gifs found`,
        { files: [responseFinal.images.fixed_height.url] },
      ];
    });
};
export { handleGifsRandom, handleGifsWithQuery };
