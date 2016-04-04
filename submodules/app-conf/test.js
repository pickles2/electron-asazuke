var ttt = require('./index.js');
var jsonConf = __dirname + '/test/setting.json';
ttt.setConfFilePath(jsonConf);
console.log(jsonConf);
ttt.readConf(function(jsonConf){
    console.log(jsonConf);
});
ttt.updateConf({
    'selectProject': "www.example.jp",
    "projects": [
        "www.example.jp",
        "www.example.co.jp"
    ]
});
