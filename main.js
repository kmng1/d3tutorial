var express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));


var temperatureData = {};
fs.readFile('public/01_bar_graphs/data/data.json', 'utf8', function (err, data) {
    if (err) throw err;
     temperatureData = JSON.parse(data);
});
app.get('/api/get/mocktemperature', function(req, res){

    for(var i in temperatureData.result){
        var tmp = parseFloat(temperatureData.result[i].temperature);
        tmp += (Math.random()-0.5)*2;
        tmp = tmp.toFixed(2);
        temperatureData.result[i].temperature = tmp.toString();
    }
    res.send(temperatureData).end();
});


const MAX = 100, MIN = 10;
var ROOMS = ['living room', 'dining room', 'bed room', 'kitchen', 'toilet', 'freezer'];
app.get('/api/get/humantraffic', function(req,res){
    var data = {};
    data.result = [];
    var count =  Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

    for(var i = 0; i < count; i++){
        var person = {};
        person.name = rName();
        person.roomid = rMax(ROOMS.length-1);
        person.room = ROOMS[person.roomid];

        data.result.push(person);
    }
    res.send(data).end();
});
function rName(){
    var n = 'name-';
    for(var j = 0; j < 6; j++)
        n += String.fromCharCode(97 + rMax(25));
    return n;
}

function rMax(n){
    return  Math.round(Math.random() * n);
}

app.listen(3000, function () {
    console.log("Server running at http://localhost:" + 3000);
});