
require("dotenv").config();

var keyImp = require("./keys");


var spotApi = require("node-spotify-api");


var request = require("request");

var moment = require("moment");


var fs = require("fs");

var spotifyImp = new spotApi(keyImp.spotify);



var logWriText = function(data) {

  fs.appendFile("recordFile.txt", JSON.stringify(data) + "\n", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("recordFile.txt was updated!");
  });
};

var grabArtName = function(artist) {
  return artist.name;
};


var srchSpotifyNow = function(songName) {
  if (songName === undefined) {
    songName = "Billie Jean";
  }

  spotifyImp.search({ type: "track", query: songName }, function(err, data) {
    if (err) {
      console.log("Error occurred: " + err);
      return;
    }

    var songs = data.tracks.items;
    var data = [];

    for (var i = 0; i < songs.length; i++) {
      data.push({
        "artist(s)": songs[i].artists.map(grabArtName),
        "song name: ": songs[i].name,
        "preview song: ": songs[i].preview_url,
        "album: ": songs[i].album.name
      });
    }

    console.log(data);
    logWriText(data);
  });
};


var grabBands = function(artist) {
  var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

  request(queryURL, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonData = JSON.parse(body);

      if (!jsonData.length) {
        console.log("Can't find shows for " + artist);
        return;
      }

      var logData = [];

      logData.push("Future shows for " + artist + ":");

      for (var i = 0; i < jsonData.length; i++) {
        var show = jsonData[i];

        logData.push(
          show.venue.city +
            "," +
            (show.venue.region || show.venue.country) +
            " at " +
            show.venue.name +
            " " +
            moment(show.datetime).format("MM/DD/YYYY")
        );
      }


      console.log(logData.join("\n"));
      logWriText(logData.join("\n"));
    }
  });
};


var grabMovie = function(movieName) {
  if (movieName === undefined) {
    movieName = "Titanic";
  }
//this is my api key for  movie site
  var urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=e67fc5e3";

  request(urlHit, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonData = JSON.parse(body);

      var data = {
        "Title:": jsonData.Title,
        "Year:": jsonData.Year,
        "Rated:": jsonData.Rated,
        "IMDB Rating:": jsonData.imdbRating,
        "Country:": jsonData.Country,
        "Language:": jsonData.Language,
        "Plot:": jsonData.Plot,
        "Actors:": jsonData.Actors,
        "Rotten Tomatoes Rating:": jsonData.Ratings[1].Value
      };

      console.log(data);
      logWriText(data);
    }
  });
};


var textFileSearch = function() {
  fs.readFile("loadFile.txt", "utf8", function(error, data) {
    console.log(data);

    var dataArr = data.split(",");

    if (dataArr.length === 2) {
      pick(dataArr[0], dataArr[1]);
    }
    else if (dataArr.length === 1) {
      pick(dataArr[0]);
    }
  });
};


var pick = function(caseData, functionData) {
  switch (caseData) {
  case "nowConcert":
    grabBands(functionData);
    break;
  case "nowSpotify":
    srchSpotifyNow(functionData);
    break;
  case "nowMovie":
    grabMovie(functionData);
    break;
  case "nowTextFile":
    textFileSearch();
    break;
  default:
    console.log("LIRI doesn't know that");
  }
};

// Function which takes in command line arguments and executes correct function accordingly
var comType = function(argOne, argTwo) {
  pick(argOne, argTwo);
};

// MAIN PROCESS
// =====================================
comType(process.argv[2], process.argv.slice(3).join(" "));
