
var jsonPath = '/Users/mac/Asazuke/composer.json';
var phpPath = 'c:\\xampp\\php\\bin\\php.exe';

var config = require('/Users/mac/Asazuke/composer.json');
//console.log(JSON.stringify(config, null, '  '));
//console.log(config.scripts);
// php undefined 対策
var update_scripts = {};
for (var obj in config.scripts) {

    //console.log(config.scripts[obj]);
    var aryCmd = [];
    for (var idx in config.scripts[obj]) {
        var cmd = config.scripts[obj][idx];
        var b = (cmd).split(/\s/);
        for (var i = 0; i < b.length; i++) {
            if (b[i] == 'php') {
                //配列は、正規表現NG。splice（置換したい場所、そこから何個分、文字列）
                b.splice(i, 1, phpPath);
            }
        }
        aryCmd.push(b.join(' '));
    }
    //  var b = (config.scripts[obj]).toString().split(/\s/);
    //  for (var i = 0; i < b.length; i++) {
    //      if (b[i] == 'php') {
    //          b.splice(i, 1, '/bin/php'); //配列は、正規表現NG。splice（置換したい場所、そこから何個分、文字列）
    //      }
    //  }

    //update_scripts[obj] = [b.join(' ')];
    update_scripts[obj] = aryCmd;
}
config.scripts = update_scripts;
console.log(JSON.stringify(config, null, '  '));
