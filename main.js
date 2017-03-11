var express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));


var temperatureData = {};
// Read the file data.json to retrieve room name and temperature
fs.readFile('public/01_bar_graphs/data/data.json', 'utf8', function (err, data) {
    // Error handler
    if (err) throw err;
    // Convert the data from string to JSON format
    temperatureData = JSON.parse(data);
});

// GET request handler for endpoint '/api/get/mocktemperature' 
app.get('/api/get/mocktemperature', function (req, res) {
    // Randomise temperatures
    for (var i in temperatureData.result) {
        var tmp = parseFloat(temperatureData.result[i].temperature);
        tmp += (Math.random() - 0.5) * 2;
        tmp = tmp.toFixed(2);
        temperatureData.result[i].temperature = tmp.toString();
    }
    // Sends the new randomised data back to client
    res.send(temperatureData).end();
});
// -----------------------------------------------------------------------
// Constants and variables used later
const MAX = 100, MIN = 10;
var ROOMS = ['living room', 'dining room', 'bed room', 'kitchen', 'toilet', 'freezer'];

// GET request handler for endpoint '/api/get/humantraffic'
app.get('/api/get/humantraffic', function (req, res) {
    // Initialise a new empty data object as a placeholder
    var data = {};
    data.result = [];
    // Generate random number for number of people in a room
    var count = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    // Generate random name and randomly assigned person to room
    for (var i = 0; i < count; i++) {
        var person = {};
        person.name = rName();
        person.roomid = rMax(ROOMS.length - 1);
        person.room = ROOMS[person.roomid];
        // Add randomised person to placeholder(var data = { result:[] })
        data.result.push(person);
    }
    // Send data variable back to client
    res.send(data).end();
});

// Helper function to randomise name
function rName() {
    var n = 'name-';
    for (var j = 0; j < 6; j++)
        n += String.fromCharCode(97 + rMax(25));
    return n;
}

// Helper function to randomise room
function rMax(n) {
    return Math.round(Math.random() * n);
}

// Server listen to port 3000
app.listen(3000, function () {
    console.log("Server running at http://localhost:" + 3000);
});