const MapData = {
    mapLocations : [
        {
         name : "Home",
         connections : ["Woods", "City"],
         difficulty : 1,
         enemies : ["rat"]
         
        },
        {
            name: "City",
            connections : ["Home", "Mountains"],
            difficulty : 2,
            enemies : ["hobo", "rat", "cop"]
        }
    ]


}

module.exports = MapData;