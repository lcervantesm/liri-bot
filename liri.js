require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const request = require("request");
const inquirer = require("inquirer");
const moment = require('moment');
const fs = require('fs');

const defaultSong = 'Despacito';
const defaultMovie = 'Remember The Titans';
const defaultArtist = 'Vicente Feranandez';

inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Song Search",
            "Concert Search",
            "Movie Search",
            "Do What It Says"
        ],
        name: "liri"
    }
]).then((response) => {
    switch (response.liri) {
        case "Song Search":
            inquirer.prompt([
                {
                    type: "input",
                    message: "What song should I search?",
                    name: "song"
                }
            ]).then((response) => {
                if (response.song) {
                    songSearch(response.song);
                } else {
                    songSearch(defaultSong);
                }
            });
            break;
        case "Concert Search":
            inquirer.prompt([
                {
                    type: "input",
                    message: "What artist should I search?",
                    name: "artist"
                }
            ]).then((response) => {
                if (response.artist) {
                    concertSearch(response.artist);
                } else {
                    concertSearch(defaultArtist);
                }
            });
            break;
        case "Movie Search":
            inquirer.prompt([
                {
                    type: "input",
                    message: "What movie should I search?",
                    name: "movie"
                }
            ]).then((response) => {
                if (response.movie) {
                    movieSearch(response.movie);
                } else {
                    movieSearch(defaultMovie);
                }
            });
            break;
        case "Do What It Says":
            doWhatItSays();
            break;
    }
});

let songSearch = (song) => {
  let spotify = new Spotify(keys.spotify);

  spotify.search({
      type: "track",
      query: song,
      limit: "1"
    }).then((response) => {
      let album = response.tracks.items[0].album.name;
      let song = response.tracks.items[0].name;
      let artist = response.tracks.items[0].artists[0].name;
      let prevUrl = response.tracks.items[0].preview_url
          ? response.tracks.items[0].preview_url
          : "Not Available";

      console.log(`\nArtist: ${artist} \nSong: ${song} \nAlbum: ${album} \nPreview: ${prevUrl}`);
    });
};

let movieSearch = (movie) => {
    const key = keys.omdb.key;
    let URL = `http://www.omdbapi.com/?t=${movie}`;
    let params = `&plot=short&apikey=${key}`;
    request(URL+params, (error, response, body) => {
        let resp = JSON.parse(body);
        let title = resp.Title;
        let release = resp.Released;
        let imdb = resp.Ratings[0].Value ? resp.Ratings[0].Value : 'Not Available.';
        let rotTom = resp.Ratings[1].Value ? resp.Ratings[1].Value : 'Not Available.';
        let country = resp.Country;
        let lang = resp.Language;
        let plot = resp.Plot;
        let actors = resp.Actors;
        console.log(`\nTitle: ${title} \nRelease Date: ${release} \nIMDB Rating: ${imdb} \nRotten Tomatoes: ${rotTom} \nCountry: ${country} \nLanguage: ${lang} \nPlot: ${plot} \nActors: ${actors}`);
    });
};

let concertSearch = (artist) => {
    //   console.log("Not Available Yet!");
    const apiKey = keys.bandsInTown.key;
    let URL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=${apiKey}`;
    request(URL, (error, response, body) => {
        let resp = JSON.parse(body)[0];
        if (JSON.parse(body)[0]){
            let venue = resp.venue.name;
            let location = `${resp.venue.city}, ${resp.venue.country}`;
            let date = moment(resp.datetime).format('MM/DD/YYYY');

            console.log(`\nVenue: ${venue} \nLocation: ${location} \nDate: ${date}`);
        }else {
            console.log('No upcoming concerts!');
        }
    });
};

let doWhatItSays = () => {
    fs.readFile("random.txt", "utf8", function(err, data) {      
        let dataArr = data.split(",");
        songSearch(dataArr[1]);
    });
};