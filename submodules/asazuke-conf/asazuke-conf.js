/**
 * AsazukeConf更新
 */
module.exports = new(function() {
    var fs = require('fs');
    var lstat = fs.lstatSync;
    var path = require('path');
    
    this.AsazukeConfFilePath;
    this.init = function (AsazukeConfFilePath){
        // TODO シンボリックリンク対策 絶対パスの場合はエラーになるかも。。。
        if (lstat(AsazukeConfFilePath).isSymbolicLink()) {
            // this.AsazukeConfFilePath = path.dirname(AsazukeConfFilePath) + '/'+ fs.readlinkSync(AsazukeConfFilePath);
            // for windows
            this.AsazukeConfFilePath = path.dirname(AsazukeConfFilePath) + '/'+ path.basename(fs.readlinkSync(AsazukeConfFilePath));
        } else {
            this.AsazukeConfFilePath = AsazukeConfFilePath; 
        }
    }
    
    this.readConf = function (cb){
        var i = 1;
        var url, startPath, authUser, authPass, matchString;
        var data = [""];
        var readline = require('readline');
        var rs = fs.ReadStream(this.AsazukeConfFilePath);
        var rl = readline.createInterface({'input': rs, 'output': {}});
        
        rl.on('line', function(line) {
            data.push(line);
            // data.push({ "lineNo": i, "value":line});

            // line = line.trim();
            // var s = body.replace(/\s+\/\/.*/g, '');// "//"コメント行を除外
            if (line.match(/^\s*\/\/.*/g) == null) {
                //  console.log(i, line);
                // $urlを検索
                matchString = line.match(/\$url.*/g);
                if (matchString != null) {
                    matchString = new String(matchString).replace(/\s+\/\/.*/g, '');
                    url = {
                        "lineNo": i,
                        "value": matchString
                    };
                }

                // $startPath
                matchString = line.match(/\$startPath.*/g);
                if (matchString != null) {
                    matchString = new String(matchString).replace(/\s+\/\/.*/g, '');
                    startPath = {
                        "lineNo": i,
                        "value": matchString
                    };
                }

                // $authUserを検索
                matchString = line.match(/\$authUser.*/g);
                if (matchString != null) {
                    matchString = new String(matchString).replace(/\s+\/\/.*/g, '');
                    authUser = {
                        "lineNo": i,
                        "value": matchString
                    };
                }

                // $authPassを検索
                matchString = line.match(/\$authPass.*/g);
                if (matchString != null) {
                    matchString = new String(matchString).replace(/\s+\/\/.*/g, '');
                    authPass = {
                        "lineNo": i,
                        "value": matchString
                    };
                }
            }
            i++;
        }).on('close', function() {
            cb({
                    "conf":{
                        "url":url,
                        "startPath":startPath,
                        "authUser":authUser,
                        "authPass":authPass
                    },
                    "data": data
                    });
        });
        rl.resume();
    }
    

    /**
     * 行数と行データに分割し対象のデータを置き換える。
     */
    this.updateConf = function (newUrl, newStartPath, newAuthUser, newAuthPass, update_cb) {
        var _AsazukeConfFilePath =  this.AsazukeConfFilePath;
        this.readConf(function(result){
            var addslashes = function (str) {
                //  discuss at: http://phpjs.org/functions/addslashes/
                // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // improved by: Ates Goral (http://magnetiq.com)
                // improved by: marrtins
                // improved by: Nate
                // improved by: Onno Marsman
                // improved by: Brett Zamir (http://brett-zamir.me)
                // improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
                //    input by: Denny Wardhana
                //   example 1: addslashes("kevin's birthday");
                //   returns 1: "kevin\'s birthday"

                return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
            }
            
            result.data[result.conf.url.lineNo] = "    public static $url = '%s';".replace('%s', addslashes(newUrl));
            result.data[result.conf.startPath.lineNo] = "    public static $startPath = '%s';".replace('%s', addslashes(newStartPath));
            result.data[result.conf.authUser.lineNo] = "    public static $authUser = '%s';".replace('%s', addslashes(newAuthUser));
            result.data[result.conf.authPass.lineNo] = "    public static $authPass = '%s';".replace('%s', addslashes(newAuthPass));

            result.data.shift(); // 配列から先頭の要素を削除
            
            fs.writeFile(_AsazukeConfFilePath, result.data.join("\n"), function(err) {
                if (err) throw err;
                console.log('It\'s saved!');
		if (typeof update_cb == 'function') {
			update_cb();
		}
            });
        });
    }
})();
