const MapData = {
    mapLocations : [
        {
            name : "Home",
            connections : ["Woods", "City"],
            difficulty : 1,
            enemies : ["rat"],
            POI : ["Fridge", "TV"]
        },
        {
            name: "City",
            connections : ["Home", "School", "Mountains"],
            difficulty : 2,
            enemies : ["hobo", "rat", "cop"],
            POI : ["Hospital", "Wallmart"]
        }
    ]


}

const getLocationInfo = (location) => {
    MapData.mapLocations.forEach((element) => {
        if(element.name == location)
            return element;
    });
    return "Not found";
};

module.exports = {getLocationInfo};