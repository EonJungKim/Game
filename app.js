var express = require('express')
var http = require('http')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var path = require('path')
var app = express()

var userRouter = require('./api/user')
var authRouter = require('./api/auth')
var compileRouter = require('./api/compile')

var database

// Database Connect
function connectDB () {
  // var databaseUrl = 'mongodb://server:codinggame@ds231199.mlab.com:31199/codinggame'
  var databaseUrl = 'mongodb://localhost:27017/local'
  mongoose.Promise = global.Promise
  mongoose.connect(databaseUrl)
  database = mongoose.connection
  database.on('open', function () {
    console.log('Database is connected : ' + databaseUrl)
  })

  database.on('dissconnected', function () {
    console.log('Database is disconnected. Try to connect in 5 seconds.')
    setInterval(connectDB, 5000)
  })

  database.on('error', console.error.bind(console, 'mongoose connection error'))
}

// Header Setting
app.disable('Etag')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(function (req, res, next) { // 1
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'content-type')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token')
  next()
})

app.use(express.static('api'))
app.use(authRouter)
app.use(userRouter)
app.use(compileRouter)

// Set port to 8080
app.set('port', process.env.PORT || 3031)

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'))
  connectDB()
})

module.exports = database
