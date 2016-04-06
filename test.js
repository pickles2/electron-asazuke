var fs = require('fs');
var exec = require('child_process').spawn;
var job = exec("php-tasklist.bat", []);
var buffer;
job.on('close', function(code, signal) {
    if (code !== 0) {
        console.log('ps process exited with code ' + code);
    }

    var csv = require('csv');
    var buffer = fs.readFileSync('./php-tasklist.csv');
    // console.log(buffer.toString());
    csv.parse(buffer, function(err, data) {
        csv.transform(data, function(data) {
            var TH = ["Image Name", "PID", "Session Name", "Session#", "Mem Usage", "Status", "User Name", "CPU Time", "Window Title"];
            var recoad = {};
            for (var i in data) {

                recoad[TH[i]] = data[i];
            }

            console.log(recoad["Image Name"], recoad["PID"], recoad["CPU Time"]);

            if (recoad["CPU Time"].match(/^0:00:0/)) {
                console.log(recoad["PID"] + " <- this")
            }
        }, function(err, data) {
            csv.stringify(data, function(err, data) {
                console.log("end");
            });
        });
    });
});