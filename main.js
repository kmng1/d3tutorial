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




app.listen(8000, function () {
    console.log("Server running at http://localhost:" + 8000);
});