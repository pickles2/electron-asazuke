/**
 * composer.json内のphpパス書き換え
 */
module.exports = new(function() {
    var cjsonPath = '~/Asazuke/composer.json';
    var cjsonPathOrg = cjsonPath + '.org';
    // var phpPath = 'c:\\xampp\\php\\bin\\php.exe';
    var phpPath = '~/electron-asazuke/node-php-bin/bin/darwin/5.6.18/bin/php';
    this.init = function(_jsonPath, _phpPath) {
        
        // パス初期化
        cjsonPath = _jsonPath;
        cjsonPathOrg = _jsonPath + '.org';
        phpPath = _phpPath;
                Console.appendMsg('phpPath0:'+ phpPath);
        

        // composer.jsonのバックアップ
        var fs = require('fs');
        fs.stat(cjsonPathOrg, function(stat) {
            if (stat == null) {} else if (stat.code === 'ENOENT') {
                // console.log(cjsonPathOrg + ' がありません');
                Console.appendMsg(cjsonPathOrg + ' がありません');
                fs.createReadStream(cjsonPath).pipe(fs.createWriteStream(cjsonPathOrg));
                // console.log(cjsonPathOrg + ' を作成しました');
                Console.appendMsg(cjsonPathOrg + ' を作成しました');

            }
        });

        // composer内のphpを内蔵phpのパスに書き換える
        var composerObj = require(cjsonPath);
        var update_scripts = {};
        for (var obj in composerObj.scripts) {

            //console.log(composerObj.scripts[obj]);
            var aryCmd = [];
            for (var idx in composerObj.scripts[obj]) {
                var cmd = composerObj.scripts[obj][idx];
                var b = (cmd).split(/\s/);
                for (var i = 0; i < b.length; i++) {
                    if (b[i] == 'php') {
                        //配列は、正規表現NG。splice（置換したい場所、そこから何個分、文字列）
                        b.splice(i, 1, phpPath);
                        //b.splice(i, 1, "ajgaa oieajo");
                    }
                }
                Console.appendMsg('phpPath1:'+ b.join(' '));
                aryCmd.push(b.join(' '));
            }
            update_scripts[obj] = aryCmd;
        }
        composerObj.scripts = update_scripts;
        var writeData = JSON.stringify(composerObj, null, '  ');
        console.log(writeData);
        fs.writeFile(cjsonPath, writeData, function(err) {
                if (err) { throw err; }
                // console.log ('Save');
                Console.appendMsg('composer.json内のphpパスを更新しました。','info');
        });
    }
})();

// 実行例
// var phpUpdate = require('./composer-update.js');
// phpUpdate.init('/Users/mac/Asazuke/composer.json', '/Users/mac/electron-asazuke/node-php-bin/bin/darwin/5.6.18/bin/php');
