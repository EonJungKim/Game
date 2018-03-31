var express = require('express');
var router = express.Router();
var code = require('../model/code');
var path = require('path');
var filemanger = require("../file.js");
var fs = require('fs');
var util = require('../util');

/////////////////////////////////////////////////////////////////////
//
// compile router
//
/////////////////////////////////////////////////////////////////////

router.post('/:username',function(req,res){
    var data = req.body.code;
    var mode = req.body.mode;
    var filename = req.params.username;
    if(mode ==="c_cpp"){
        fs.writeFile(`${__dirname}/${username}/${filename}.c`,data,'utf8',function(err){
            if(err){
                console.log(err);
                res.json(util.successFale(err));
            }else{
                //start compile
                console.log("create OK ========");
                var compile = spawn('gcc',[`${__dirname}/${username}/${filename}.c`]);
                compile.stdout.on('data', (data)=>{
                    console.log(data.toString());
                });
                compile.stderr.on('data', (data) => {
                    console.log(data.toString());
                });
                compile.on('close', (data) => {
                    if(data==0){
                        console.log("code == 0");
                        var run = spawn('./a.out', []);
                        run.stdout.on('data', function (output) {
                            console.log(String(output));
                        });
                        run.stderr.on('data', function (output) {
                            console.log(String(output));
                        });
                        run.on('close', function (output) {
                            console.log('stdout' + output);
                        });
                    }
                })
            }
        })
    }else if(mode === "java"){

    }
});
router.get(`/`,function (req,res){
    //
});

router.get('/remove', function (req, res) {
    console.log(req.query.username);
    var folder = path.resolve(__dirname);
    var folderArr = [req.query.username];
    filemanger.arrydeleteFolder(folder, folderArr);
})

module.exports = router;