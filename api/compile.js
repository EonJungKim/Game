/* 로그인 되어있는 Client의 게임과 관련된 Request만 받음
 * ID 등의 기본적인 User Information은 Client로부터 받음
 */

var express = require('express')
var router = express.Router()
var code = require('../model/code')
var path = require('path')
var filemanger = require('../file.js')
var fs = require('fs')
var util = require('../util')

/// //////////////////////////////////////////////////////////////////
//
// compile router
//
/// //////////////////////////////////////////////////////////////////

router.post('/:username', function (req, res) {
  var data = req.body.code || req.query.code // Code
  var languageMode = req.body.languageMode || req.query.languageMode // 언어 식별
  var fileName = req.body.fileName || req.query.fineName
  var userName = req.body.userName || req.query.username
  var gameMode = req.body.gameMode || req.query.gameMode

  if (languageMode === 'c_cpp') {
    fs.writeFile(`${__dirname}/${userName}/${gameMode}/${fileName}.c`, data, 'utf8', function (err) {
      if (err) {
        console.log(err)
        res.json(util.successFalse(err))
      } else { // start compile
        console.log('create OK ========')

        // spawn :  Terminal에 gcc + 문자열 올려줌
        var compile = spawn('gcc', [`${__dirname}/${username}/${filename}.c`])

        compile.stdout.on('data', (data) => {
          console.log(data.toString())
        })

        compile.stderr.on('data', (data) => {
          console.log(data.toString())
        })

        compile.on('close', (data) => {
          if (data === 0) {
            console.log('code == 0')
            var run = spawn('./a.out', [])

            run.stdout.on('data', function (output) {
              console.log(String(output))
              return res.json(util.successTrue(String(output)))
            })

            run.stderr.on('data', function (output) {
              console.log(String(output))
              return res.json(util.successFalse(err, String(output)))
            })

            run.on('close', function (output) {
              console.log('stdout' + output)
            })
          }
        })
      }
    })
  } else if (languageMode === 'java') {

  } else if (languageMode === 'javascript') {

  } else if (languageMode === 'C#') {

  }
})

router.get(`/`, function (req, res) {
  //
})

router.get('/remove', function (req, res) {
  console.log(req.query.username)

  var folder = path.resolve(__dirname)
  var folderArr = [req.query.username]

  filemanger.arrydeleteFolder(folder, folderArr)
})

module.exports = router
