var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var path = require('path')
var app = express()

mongoose.connect('mongodb://server:codinggame@ds231199.mlab.com:31199/codinggame')
var db = mongoose.connection

db.once('open', function () {
  console.log('DB connection')
})

db.on('error', function () {
  // error
})

// Other settings
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

// api로 요청을 받는 경우에는 한 폴더로 묶어놓는 것이 좋음
// 1. 회원가입, 회원정보 수정 등
// 2. 로그인 로그아웃 컨트롤
// 3.

app.use('/api/game', require('./api/compile'))

// Port setting
var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('server on!')
})
