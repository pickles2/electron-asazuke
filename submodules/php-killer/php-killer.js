/**
 * php.exe killer
 */
module.exports = new(function() {
    var fs = require('fs');
    var csv = require('csv');
    var phpExe_pid = [];
    var appDirPath;
    
    this.setDir = function(dirPath){
        appDirPath = dirPath;
    }

    var fn_close = function (code, signal) {
        if (code !== 0) {
            console.log('ps process exited with code ' + code);
        }
        // var data = fs.readFileSync(appDirPath + '/php-tasklist.csv');
        var data = fs.readFileSync(appDirPath + '\\php-tasklist.csv');
        data = data.toString();
        csv.parse(data, function(err, data){
            fn_parse(err, data);
        });
    }

    var fn_transform = function(data){
        var TH = ["Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"];
        var recoad = {};
        for(var i in data){
            recoad[TH[i]] = data[i];
        }
        
        console.log(recoad["Image Name"],recoad["PID"],recoad["CPU Time"]);
        
        // 10秒以内に実行されたプロセスに限定
        if(recoad["CPU Time"].match(/^0:00:0/)){
            // console.log(recoad["PID"] + " <- this")
            phpExe_pid.push(recoad["PID"]);
        }
    }
    
    var fn_parse = function(err, data){
        csv.transform(data, function(data){
            fn_transform(data)
        }
        , function(err, data){
            // console.log(phpExe_pid);
            console.log("end");
        });
    }
    this.killProcess = function(){
        console.log(phpExe_pid);
        for(var i in phpExe_pid){
            console.log('kill PID' + phpExe_pid[i]);
            var win_exec = require('child_process').spawn;
            win_exec('taskkill',  ['/f', '/pid', phpExe_pid[i]]);
            //win_exec('taskkill',  ['/f', '/im', 'php.exe']);
        }
    }
    
    this.getProcess = function(){
        
        this.phpExe_pid = [];
        var win_exec = require('child_process').spawn;
        var win_job = win_exec(appDirPath + "/php-tasklist.bat", {"cwd": appDirPath});

        win_job.on('close', function(code, signal){
            fn_close(code, signal);
        });
    }
})();
