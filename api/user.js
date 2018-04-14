var express = require('express')
var userModel = require('../model/user')
var util = require('../util')
var database = require('../app')
var crypto = require('crypto')

var router = express.Router()

// An router that add user information to mongoose database
router.post('/process/addUser', function (req, res) {
  console.log('/process/addUser routing function is called.')

  var paramId = req.body.userId || req.query.userId
  var paramPassword = req.body.password || req.query.password
  var paramName = req.body.name || req.query.name
  var paramEMail = req.body.eMail || req.query.eMail

  console.log('Request parameter : ' + paramId + ', ' + paramPassword + ', ' + paramName + ', ' + paramEMail)

  if (database) {
    addUser(database, paramId, paramPassword, paramName, paramEMail, function (err, result) {
      if (err) {
        console.log('An error occur during save user information.')

        return res.json(util.successFalse(err, 'An error occur during save user information'))
      }

      if (result) {
        console.dir(result)

        res.json(util.successTrue(result))
      } else {
        console.log('An error occur during save user information to database.')

        res.json(util.successFalse(err, 'An error occur during save user information to database'))
      }
    })
  } else {
    console.log('An error occur because server is not connected to database')

    res.json(util.successFalse(null, 'An error occur because server is not connected to database'))
  }
})

// An function that is used by /process/addUser router
var addUser = function (db, id, password, name, eMail, callback) {
  console.log('addUser function is called : ' + id + ', ' + password + ', ' + name + ', ' + eMail)

  var user = new userModel({'userId': id, 'password': password, 'name': name, 'eMail': eMail})

  console.dir(user)

  user.save(function (err) {
    if (err) {
      callback(err, null)
      return
    }

    console.log('User information is added.')
    callback(null, user)
  })
}

// An router that find user ID using eMail
router.get('/process/findUserId', function (req, res) {
  console.log('/process/findUserId routing function is called.')

  var paramEMail = req.body.eMail || req.query.eMail

  console.log('Request parameter : ' + paramEMail)

  if (database) {
    userModel.findUserId(paramEMail, function (err, results) {
      if (err) {
        console.log('An error occur during find user ID.')

        return res.json(util.successFalse(null, 'An error occur during find user ID.'))
      }

      if (results) {
        console.dir(results)

        var data = results[0]._doc.userId

        res.json(util.successTrue(data))
      } else {
        console.log('An error occur during save user information to database.')

        res.json(util.successFalse(err, 'An error occur during save user information to database'))
      }
    })
  } else {
    console.log('An error occur because server is not connected to database')

    res.json(util.successFalse(null, 'An error occur because server is not connected to database'))
  }
})

router.get('/process/findUserPassword', function (req, res) {
  console.log('/process/findUserPassword router is called')

  var paramID = req.body.userId || req.query.userId
  var paramEMail = req.body.eMail || req.query.eMail

  console.log('Request parameter : ' + paramID + ', ' + paramEMail)

  if (paramID === '') {
    // User id data loses during transmission
    res.json(util.successFalse(null, 'ID is required'))
  } else if (paramEMail === '') {
    // User e-mail data loses during transmission
    res.json(util.successFalse(null, 'E-Mail is required'))
  }

  if (database) {
    userModel.findUserPassword(paramID, paramEMail, function (err, results) {
      if (err) {
        // If error is occured
        console.log('An error occur during find user information by using input userId, eMail.')

        return res.json(util.successFalse(null, 'An error occur during find user information by using input userId, eMail.'))
      }

      if (results) {
        console.log(results)

        var decipher = crypto.createDecipher('aes192', 'oneway')

        decipher.update(results[0]._doc.encrypted_password, 'base64', 'utf8')
        return res.json(util.successTrue(decipher.final('utf8')))
      }
    })
  }
})

// index
router.get('/', util.isLoggedin, function (req, res, next) {
  userModel.find({})
    .sort({username: 1})
    .exec(function (err, user) {
      res.json(err || !user ? util.successFalse(err) : util.successTrue(user))
    })
})

// create
router.post('/', function (req, res, next) {
  var newUser = new userModel(req.body)
  newUser.save(function (err, user) {
    res.json(err || !user ? util.successFalse(err) : util.successTrue(user))
  })
})

// show
router.get('/:username', util.isLoggedin, function (req, res, next) {
  userModel.findOne({username: req.params.username})
    .exec(function (err, user) {
      res.json(err || !user ? util.successFalse(err) : util.successTrue(user))
    })
})

// update
router.put('/:username', util.isLoggedin, checkPermission, function (req, res, next) {
  userModel.findOne({username: req.params.username})
    .select({password: 1})
    .exec(function (err, user) {
      if (err || !user) {
        return res.json(util.successFalse(err))
      }

      // update user object
      user.originalPassword = user.password
      user.password = req.body.newPassword ? req.body.newPassword : user.password
      for (var p in req.body) {
        user[p] = req.body[p]
      }

      // save updated user
      user.save(function (err, user) {
        if (err || !user) {
          return res.json(util.successFalse(err))
        } else {
          user.password = undefined
          res.json(util.successTrue(user))
        }
      })
    })
})

// destroy
router.delete('/:username', util.isLoggedin, checkPermission, function (req, res, next) {
  userModel.findOneAndRemove({username: req.params.username})
    .exec(function (err, user) {
      res.json(err || !user ? util.successFalse(err) : util.successTrue(user))
    })
})

module.exports = router

// private functions
function checkPermission (req, res, next) {
  userModel.findOne({username: req.params.username}, function (err, user) {
    if (err || !user) {
      return res.json(util.successFalse(err))
    } else if (!req.decoded || user._id !== req.decoded._id) {
      return res.json(util.successFalse(null, 'You don\'t have permission'))
    } else {
      next()
    }
  })
}
