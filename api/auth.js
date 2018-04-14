/**
 * Created by sengwon on 2018-01-06.
 */
var express = require('express')
var userModel = require('../model/user')
var util = require('../util')
var jwt = require('jsonwebtoken')
var database = require('../app')
var crypto = require('crypto')

var router = express.Router()

// login
router.get('/process/login', function (req, res) {
  console.log('process/login routing function is called')
  var paramId = req.body.userId || req.query.userId
  var paramPassword = req.body.password || req.query.password

  console.log('Request parameter : ' + paramId + ', ' + paramPassword)

  if (paramId === '') {
    // ID transmission is failed
    res.json(util.successFalse(null, 'ID is required'))
  } else if (paramPassword === '') {
    // Password transmisstion is failed
    res.json(util.successFalse(null, 'Password is required'))
  }

  if (database) {
    authUser(database, paramId, paramPassword, function (err, results) {
      if (err) {
        // If error is ocurred
        console.log('An error occur during find user information by using userId.')

        return res.json(util.successFalse(err, 'An error occur during find user information by using userId.'))
      }

      if (results) {
        console.dir(results)

        console.log('Log in success.')

        var payload = {
          '_id': results[0]._doc._id,
          'userId': results[0]._doc.userId,
          'name': results[0]._doc.name,
          'eMail': results[0]._doc.eMail
        }

        var secretOrPrivateKey = process.env.JWT_SECRET

        var options = {expiresIn: 60 * 60 * 24}
        jwt.sign(payload, secretOrPrivateKey, options, function (err, token) {
          if (err) {
            return res.json(util.successFalse(err))
          }

          res.json(util.successTrue(token))
        })
      } else {
        console.log('Can\'t find your user information.')
        // 아이디 또는 비밀번호가 일치하지 않음
        res.json(util.successFalse(null, 'Id or Password is invalid'))
      }
    })
  } else {
    console.log('Server is not connected to database.')

    res.json(util.successFalse(null, 'Server is not connected to database'))
  }
})

var authUser = function (db, userId, password, callback) {
  console.log('authUser function is called.')

  // id를 이용해서 Search한 결과가 results에 들어가게 된다.
  userModel.findByUserId(userId, function (err, results) {
    if (err) {
      callback(err, null)
      return
    }

    console.log('ID ' + userId + ' is searched.')
    if (results.length > 0) {
      var authenticated = authenticate(password, results[0]._doc.encrypted_password)

      if (authenticated) {
        console.log('Password is matched.')
        callback(null, results)
      } else {
        console.log('Password is not matched.')
        callback(null, null)
      }
    } else {
      console.log('There is no user information matching ID.')
      callback(null, null)
    }
  })
}

function authenticate (password, encryptedPassword) {
  var cipher = crypto.createCipher('aes192', 'oneway')
  cipher.update(password, 'utf8', 'base64')
  var inputPassword = cipher.final('base64')

  console.log('inputPassword : ' + inputPassword)

  if (inputPassword === encryptedPassword) {
    return true
  } else {
    return false
  }
}

// refresh
router.get('/refresh', util.isLoggedin,
  function (req, res, next) {
    var paramId = req.body.userId || req.query.userId
    userModel.findByUserId(paramId)
      .exec(function (err, results) {
        if (err || !results) {
          return res.json(util.successFalse(err))
        } else {
          var payload = {
            '_id': results[0]._doc._id,
            'userId': results[0]._doc.userId,
            'name': results[0]._doc.name,
            'eMail': results[0]._doc.eMail
          }

          var secretOrPrivateKey = process.env.JWT_SECRET
          var options = {expiresIn: 60 * 60 * 24}
          jwt.sign(payload, secretOrPrivateKey, options, function (err, token) {
            if (err) {
              return res.json(util.successFalse(err))
            }
            res.json(util.successTrue(token))
          })
        }
      })
  }
)

module.exports = router
