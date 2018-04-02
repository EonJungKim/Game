var fs = require('fs');
var path =  require('path');
var testFolder = path.resolve(__dirname + '/test/');
//test

/* 배열로 된 폴더명을 받아서 하위폴더를 구성해준다. -- main */

exports.arryCreateFolder = function (imgFolder, folderArr) {
	var nFolder = imgFolder;
    
	for (folder in folderArr) {
		var status = searchFolder(nFolder, folderArr[folder]);
        
		if (!status) {
			var createStatus = createFolder(nFolder, folderArr[folder]);
			nFolder = path.join(nFolder, folderArr[folder]);
		}
	}
};



// 폴더를 생성하는 역할을 맡는다.
createFolder = function (folder, createFolder) {
	var tgFolder = path.join(folder, createFolder);
	console.log("createFolder ==> " + tgFolder);
    
	fs.mkdir(tgFolder, 0666, function (err) {
		if (err) {
			return false;
		} else {
			console.log('create newDir');
			return true;
		}
	});
};

exports.createFile = function (name, body, mode) {
    console.log(mode);
    
    if (mode.equal(mode, "c_cpp")) {
        var data = body;
        fs.writeFile(name + ".c", data, 'utf-8', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("create C ======>" + name);
            }
        });
    } else {
        return false;
    }
};

deleteFolder = function (folder, deletFolder) {
    var tgFolder = path.join(folder, deleteFolder);
    console.log("deleteFolder ==>" + tgFolder);
    
    fs.mvdir(tgFolder, function (err) {
        if (err) {
            console.log(err);
            
            return false;
        } else {
            console.log("OK");
            
            return true;
        }
    });
};

//하위 폴더 삭제
exports.arrydeleteFolder = function (folderm, folderArr) {
    var nFolder = folderm;
    
    for (folder in folderArr) {
        var status = searchFolder(nFolder, folderArr[folder]);
        
        if (!status) {
           console.log("XXXX");
        } else {
            var createStatus = deleteFolder(nFolder, folderArr[folder]);
            nFolder = path.join(nFolder, folderArr[folder]);
        }
    }
};


// 폴더가 존재하는지 찾는다. 있다면 폴더위치를 리턴하고, 없다면 false를 리턴한다.

searchFolder = function (folder, srhFolder) {
	var rtnFolder;
    
	fs.readdir(folder, function (err, files) {
		if (err) {
            throw err;
        }
        
		files.forEach(function (file) {
			if (file === srhFolder) {
				fs.stat(path.join(folder, file), function (err, stats) {
					if (stats.isDirectory()) {
						return path.join(folder, file);
					}
				});
			}
		});
	});
    
    return false;
};