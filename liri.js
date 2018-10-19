require("dotenv").config();
var request = require("request");
var moment = require("moment");
var fs = require("fs");
var keys = require("./keys");
var Spotify = require('node-spotify-api')
var spotify = new Spotify(keys.spotify);
var command = process.argv[2];
var searchTerm = "";

//If there is a search term, assign it to a variable
if (process.argv.length > 3) {
    for (i = 3; i < process.argv.length - 1; i++) {
        searchTerm += process.argv[i] + "%20";
    }
    searchTerm += process.argv[process.argv.length - 1];
}

//What to do if searchTerm is blank for commands that require a searchTerm
if (command === "movie-this" && searchTerm === "") {
    searchTerm = "Mr. Nobody";
} else if (command === "spotify-this-song" && searchTerm === "") {
    searchTerm = "I Saw the Sign";
}

takeCommand(command, searchTerm);

function takeCommand(command, searchTerm) {
    switch (command) {
        case "concert-this":
            //Search BandsInTown API for artist to provide venue name, location, and date of all upcoming concerts.
            var queryUrl = "https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp"
            request(queryUrl, function (error, response, body) {
                // If the request is successful
                if (!error && response.statusCode === 200) {
                    var concert = JSON.parse(body);
                    console.log("---Upcoming concerts---")
                    for (i = 0; i < concert.length; i++) {
                        console.log(concert[i].lineup + " at " + concert[i].venue.name);
                        var time = concert[i].datetime;
                        var parsedTime = moment(time).format("MM/DD/YYYY");
                        console.log(parsedTime);
                        console.log(concert[i].venue.city + ", " + concert[i].venue.region);
                    }
                }
            });
            break;
        case "spotify-this-song":
            //Search Spotify for the song and return song name, artist(s), preview link of the song, and the album that the song is from
            spotify.search({ type: 'track', query: searchTerm, limit: 1 }, function (err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                var song = data.tracks.items[0];
                console.log("---" + song.name + "---");
                console.log("As sung by:",song.artists[0].name);
                console.log("On the album:",song.album.name);
                console.log("Preview it at:",song.preview_url);

            });
            break;
        case "movie-this":
            //Search the OMDB API to show movie title, release year, IMDB rating, Rotten Tomatoes rating, country where the movie was produced, language of the movie, plot summary, and actors.
            var queryUrl = "http://www.omdbapi.com/?t=" + searchTerm + "&y=&plot=short&apikey=trilogy";
            request(queryUrl, function (error, response, body) {
                // If the request is successful
                if (!error && response.statusCode === 200) {
                    var movie = JSON.parse(body);
                    console.log("---" + movie.Title + "---");
                    console.log("Released in", movie.Year);
                    console.log(movie.Ratings[0].Source + " rating: " + movie.Ratings[0].Value);
                    console.log(movie.Ratings[1].Source + " rating: " + movie.Ratings[1].Value);
                    console.log("Produced in", movie.Country);
                    console.log("Language:", movie.Language);
                    console.log("Leading actors:", movie.Actors);
                    console.log("Summary:", movie.Plot);
                }
            });
            break;
        case "do-what-it-says":
            //Do what "random.txt" says.
            fs.readFile("random.txt", "utf8", function (error, data) {
                var splitFile = data.split(",");
                takeCommand(splitFile[0], splitFile[1]);
            });
            break;
        default:
            console.log("Arguments not understood");
    }
};

//Log all the search results to log.txt
function logData() {
    fs.writeFile("log.txt", data, function (err) {
        if (err) {
            console.log("Oops, there was an error");
        } else {
            console.log("Data was logged to file!")
        }
    });
}