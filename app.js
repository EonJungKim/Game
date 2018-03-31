var express = require("express");
var mongoose = require("mongoose");
var bodyParser  = require("body-parser");
var path    = require('path');
var app = express();

// Other settings
app.disable('Etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) { //1
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

app.use('/api/game',require('./api/compile'));

// Port setting
var port = process.env.PORT|| 8080;
app.listen(port, function(){
    console.log("server on!");
});