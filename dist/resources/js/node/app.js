var remote = require('remote');
var app = remote.require('app');
global.APP_PATH = app.getAppPath();
var exe = app.getPath('exe'); // win32はexe, osxはElectron
var unpackedDir = path.normalize(path.dirname(exe) + '/../Resources/app.asar.unpacked');

global.platform = require('os').platform().toLowerCase();
var phpBin = unpackedDir + '/node-php-bin/bin/darwin/5.6.18/bin/php';
var composerPhar = unpackedDir + '/node-php-bin/bin/darwin/composer.phar';
if (!!(global.platform.match(/darwin/i))) {} else if (!!(global.platform.match(/win32/i))) {
    unpackedDir = path.dirname(global.APP_PATH) + '\\app.asar.unpacked';
    phpBin = path.dirname(global.APP_PATH) + '\\app.asar.unpacked\\node-php-bin\\bin\\win32\\php-5.6.18\\php.exe';
    composerPhar = path.dirname(global.APP_PATH) + '\\app.asar.unpacked\\node-php-bin\\bin\\win32\\composer.phar';
}
var fs = require('fs');
var isElectron = false; // $ electron . で起動した場合
fs.stat(unpackedDir, function(stat) {
    //console.log('stat', stat);
    if (stat == null) {

    } else if (stat.code === 'ENOENT') {
        // ファイルがない場合。
        console.log('ディレクトリがない場合。');
        if (!!(global.platform.match(/darwin/i))) {
            phpBin = global.APP_PATH + '/node-php-bin/bin/darwin/5.6.18/bin/php';
            composerPhar = global.APP_PATH + '/node-php-bin/bin/darwin/composer.phar';
            isElectron = true;
        } else if (!!(global.platform.match(/win32/i))) {
            phpBin = global.APP_PATH + '/node-php-bin/bin/win32/php-5.6.18/php.exe';
            composerPhar = global.APP_PATH + '/node-php-bin/bin/win32/composer.phar';
            isElectron = true;

        }
    }
});
var bs2sl = function(str){
  return str.replace(/\u002F/g, "\u005C"); // / -> \
}
var sl2bs = function(str){
  return str.replace(/\u005C/g, "\u002F"); // \ -> /
}
var directory_separator_repair = function(str){
    if (!!(platform.match(/darwin/i))) {
      return sl2bs(str);
    } else if (!!(platform.match(/win32/i))) {
      return bs2sl(str);
    }
}
var fs_exists = function(file_path) {
    fs.stat(file_path, function(stat) {
        if (stat == null) {
            return true;
        } else if (stat.code === 'ENOENT') {
            return false;
        }
    });
}

// global.APP_CONF = APP_PATH + '/setting.json';
var iconv = require('iconv-lite');
var phpKiller = require('php-killer');
var appConf = require('app-conf');
// ./node-php-bin/bin/darwin/5.6.18/bin/php ./node-php-bin/bin/darwin/composer.phar
var mConsole = require('m-console');

global.userDataDir = app.getPath('userData');
global.SETTING_JSON = global.userDataDir + '/setting.json';
console.log(global.SETTING_JSON);

var BrowserWindow = remote.require('browser-window');
var win = BrowserWindow.getFocusedWindow();

appConf.setConfFilePath(global.SETTING_JSON);
appConf.readConf(function(jsonConf) {
    phpKiller.setDir(jsonConf.asazuke);
});


var dialog = remote.require('dialog');
var jqueryFileTree = require('jquery-file-tree');
var showMsg = function(options) {
    var default_options = {
        title: 'information',
        type: 'info',
        buttons: ['OK'],
        message: 'メッセージ',
        detail: ""
    };

    for (key in options) {
        default_options[key] = options[key];
    }
    console.log(options);
    dialog.showMessageBox(win, default_options);
};

// カーソルを最下行に合わせる
var go_bottom = function($divTextarea) {
        console.log('go_bottom');
        var $obj = $divTextarea;
        console.log($obj);
        if ($obj.length == 0) return;
        $obj.scrollTop($obj[0].scrollHeight);
    }
    // メッセージエリアへの出力
var appendMsg = function(text) {
		var ary = (text).toString().split(/\r\n|\r|\n/);
		for(var i in ary){
	// 制御コード削除
	data = ary[i];
        if (!!(global.platform.match(/darwin|linux/i))) {
        } else {
            data = data.replace(/\[\d{2};\d{2}m/g, '').replace(/\[\d{2}m/g, '');
            //data = data.replace(/\[/g, '');
	}
      mConsole.appendMsg(data);
}
    //mConsole.appendMsg(text);

    //$('#consolePanel .layer-panel.is-current .div-textarea')[0].value += text + "\n";
    //go_bottom($('#consolePanel .layer-panel.is-current .div-textarea'));
}

var job = null;
var kill = function() {
    if (global.job == null) {
        return;
    }
    appendMsg("KILLシグナル" + global.job.pid);


    if (!!(global.platform.match(/darwin|linux/i))) {} else {
        phpKiller.killProcess();
    }

    // job.kill('SIGHUP');
    // SIGHUP (= 1, hangup) 端末終了時に発生。元来はモデムの受話器をあげて通信を切ったことから
    // SIGINT (= 2, interrupt) Control-C による中断
    // SIGTERM (= 15, termination) kill コマンドでシグナル無指定時に送られるプロセス終了シグナル
    // 引数なし=SIGTERM
    global.job.kill();
    global.job = null;
};

var confJson;
var appJson;
var gitHashRemote = null;
var gitHashLocal = null;
var exec = function(cmd, args, cwd, cb) {
    if (!(global.job == null || typeof global.job.pid === "undefined")) {
        console.log('プロセスID「' + global.job.pid + '」が実行中です。');
        return;
    }

    var util = require('util'),
        _exec = require('child_process').spawn,

        job = _exec(cmd, args, {
            "cwd": cwd
        });
    console.log('cmd', cmd);
    global.job = job;

    // windows

    var path;
    if (!!(global.platform.match(/darwin|linux/i))) {} else {
        // php プロセス登録
        phpKiller.getProcess();
    }

    appendMsg("START PID:" + global.job.pid);

    global.job.stdout.on('data', function(data) {
        var _data = data;
        // data = String(data).replace(/\n?$/g,');
        if (!!(global.platform.match(/darwin|linux/i))) {} else {
            data = iconv.decode(data, "cp932")
        }
        data = data.toString();
        console.log('stdout: ' + data);
        //var data0 = data.toString();
        //console.log('stdout: ' + data0);
        // 改行で分割
        //var aryData = data0.split(/\r\n|\r|\n/);
        //for (i = 0; i < aryData.length; i++) {
        //  //alert(aryData[i]);
        //  data = aryData[i]
        ////}
        //appendMsg('args[args.length -1]:' + args[args.length - 1]);
	
        // 完了メッセージ
        var matches = data.match(/Finished\!\!(.*)/gi);
        if (matches != null) {
            if (matches.length >= 2) {
                Console.appendMsg(matches.join("\n"), "success");
            } else {
                Console.appendMsg(matches[0], "success");
            }
            return true;
        }

        //if(args[1] === 'site-scan'){
        if (args[args.length - 1] === 'run:site-scan') {
            // コンソールパネル
            var matches = data.match(/Finished\s->\s(.*)/gi);
            if (matches != null) {
                //appendMsg(matches[0]);
                if (matches.length >= 2) {
                    appendMsg(matches.join("\n"));
                } else {
                    appendMsg(matches[0]);
                }
            }

            // メインパネル
            matches = data.match(/Result\s->\s(.*)/gi);
            if (matches != null) {
                for (var xxi in matches) {
                    var resultJson = JSON.parse(matches[xxi].match(/Result\s->\s(.*)/)[1]);
                    //var resultJson =  JSON.parse(matches[1]);
                    //    var resultJson =  JSON.parse(matches[0]);
                    // appendMsg(JSON.stringify(resultJson)); 
                    $('#tbl-sitescan').append($('<tr>' +
                        '<td>' + resultJson.id + '</td>' +
                        '<td>' + resultJson.fullPath + '</td>' +
                        '<td>' + resultJson.depth + '</td>' +
                        // '<td>'+ resultJson.checkCount + '</td>' +
                        '<td>' + resultJson.status + '</td>' +
                        '<td>' + resultJson.statusCode + '</td>' +
                        // '<td>'+ resultJson.time + '</td>' +
                        '</tr>'));
                }
            }
            //} else if(args[0] === 'run:site-validation-json'){
        } else if (args[args.length - 1] === 'run:site-validation-json') {

            // テーブル表示
            $('#div_C .layer-panel.is-current').html($(`
					<h3>HTMLダウンロード(検証)</h3>
					<table class="tbl_htmlDL" border="1">
					<tr><th>ID</th><th>filePath</th><th>Error件数</th><th>Warning件数</th></tr>
					</table>
					`));
            var jsonData = JSON.parse(data);
            var no, path, err, war;
            $(jsonData).each(function(ind, ele) {
                console.log(ele);
                no = ele[0], path = ele[1], err = ele[2], warn = ele[3];

                $('.tbl_htmlDL').append(`
					<tr><td>${no}</td><td>${path}</td><td>${err}</td><td>${warn}</td><</tr>
					`)
            });


            // Include the async package
            // Make sure you add "async" to your package.json
            var async = require("async");
            $('.fileTree2-2 ul').empty();
            // 1st para in async.each() is the array of items
            async.each($('.fileTree2-0 a'), function(item, next) {
                setTimeout(function() {
                    var search_id = ($(item).text()).split('.')[0]
                    console.log(search_id, 'done!!');
                    $(jsonData).each(function(ind, ele) {
                        if (ele[0] == search_id) {
                            $('.fileTree2-2 ul').append($('<li><span class="path">' + ele[1] + '</span></li>'));
                            next();
                            return false;
                        }
                    });
                }, 200);
            }, function(err) {
                console.log('all done!');
            });

            // データベース | データ確認
            //} else if(args[0] === 'run:file-sql-json'){
        } else if (args[args.length - 1] === 'run:file-sql-json') {
            console.log("// データベース | データ確認");
            // appendMsg(data+"\n";);
            // $('.js-selectSQL-result').append($('<h4>結果</h4>'));
            var matches = data.match(/Result\s->\s(.*)/);
            $('.js-selectSQL-result').empty();
            if (matches != null) {
                $('.js-selectSQL-result').append($(`
						<table class="tbl_result" border="1" style="margin:15px 0 0; width:100%;"></table>
						`));
                var resultJson = JSON.parse(matches[1]);
                console.log(resultJson);

                // thead
                var tr = "<tr>";
                for (var k in resultJson[0]) {
                    tr += '<th>' + k + '</th>';
                }
                tr += "</tr>";
                $('.tbl_result').append(`
					<tr>${tr}<</tr>`);

                // tbody
                $(resultJson).each(function(ind, rowdata) {
                    console.log(rowdata);
                    tr = "<tr>";
                    for (var k in rowdata) {
                        tr += '<td>' + rowdata[k] + '</td>';
                    }
                    tr += "</tr>";
                    $('.tbl_result').append(`
						<tr>${tr}<</tr>
						`);
                });

            }
        } else if (args[0] === '-C') { // git -C 
            console.log('git checkupdate');
            appendMsg("git checkupdate");
            try {
                // git Checkupdate
                var command_ops = args.splice(2, 3).join(' ');
                // 'git -C <ディレクトリ> ls-remote origin HEAD'
                if (command_ops === 'ls-remote origin HEAD') {
                    global.gitHashRemote = (data.toString()).substr(0, 40);
                    appendMsg("リモートのコミット:" + global.gitHashRemote);

                    // 'git -C <ディレクトリ> show -s --format=%H'
                } else if (command_ops === 'show -s --format=%H') {
                    // stdoutには行末コードが含まれている？ため0-40で切り取る
                    global.gitHashLocal = data.substr(0, 40);
                    appendMsg("ローカルトのコミット:" + global.gitHashLocal);
                }
            } catch (e) {
                console.log(e);
            }
            //} else if(args[0] === 'run:site-validation-csv'){
        } else if (args[args.length - 1] === 'run:site-validation-csv') {
            appendMsg(_data);
            var matches = data.match(/Finished\s->\s(.*)/i);
            console.log(matches);
            if (matches != null) {
                appendMsg(matches[1] + "を開こうとしています。");
                // 規定のアプリで開く
                console.log('matches[1]', matches[1]);


                var path;
                if (!!(global.platform.match(/darwin|linux/i))) {
                    path = matches[1];
                } else {
                    // PATHセパレータ正規化
                    path = matches[1].replace(/\//g, '\\\\').replace(/\\/g, '\\\\');
                }
                SHELL.openItem(path);
                Load.sitemapCSV();
                
                Console.appendMsg("Finished!! (sitemap-csv)", "success"); 
            }
            //} else if(args[0] === 'run:conf-json'){
        } else if (args[args.length - 1] === 'run:conf-json') {
            console.log('run:conf-json');
            global.confJson = JSON.parse(data);
            var appConf = require('app-conf');
            appConf.setConfFilePath(global.SETTING_JSON);
            appConf.readConf(function(jsonConf) {
                global.appJson = jsonConf;
                PHP.start(global.confJson.buildInServerIp, global.confJson.buildInServerPort);
                if (typeof cb == 'function') {
                    cb();
                }
            });
        } else if (args[args.length - 1] === 'which-php') {
            if (phpBin == _data) {
                appendMsg("php stand ready.");
            } else {
            appendMsg('phpBin:' + phpBin);
            appendMsg('usePHP:' + _data);
                Console.appendMsg("composer.json内のphpパスの修正が必要です。", "info");
                var appConf = require('app-conf');
                appConf.setConfFilePath(global.SETTING_JSON);
                appConf.readConf(function(jsonConf) {
                    Console.appendMsg(jsonConf.asazuke, "info");
                    var composerPhpUpdate = require('composer-php-update');
                    var path = require('path');
		    // オプションを足すとphpが動かない..
		    //phpBin += ' -d extension_dir=' + directory_separator_repair(path.dirname(phpBin)) + '\\ext\\';
		    //phpBin += ' -d date.timezone="Asia/Tokyo"';
                    Console.appendMsg(phpBin, "info");
                    composerPhpUpdate.init(jsonConf.asazuke + '/composer.json', phpBin);
                });
            }
        } else {
            appendMsg(_data);
            //appendMsg(data);
        }
        //} // end for
    });
    global.job.stderr.on('data', function(data) {
        data = iconv.decode(data, "cp932")
        data = String(data).replace(/\n?$/g, '');
        data = data.toString();
        console.log('stdout: ' + data);
        appendMsg(data);
    });
    global.job.on('exit', function(code, signal) {
        code = String(code).replace(/\n?$/g, '');
        console.log('child process exited with code ' + code);
        signal = String(signal).replace(/\n?$/g, '');
        console.log('child process terminated due to receipt of signal ' + signal);
        global.job = null;

        if (typeof(cb) == 'function') {
            cb();
        }
    });
};

var projectSettingLoad = function() {
    var appConf = require('app-conf');
    appConf.setConfFilePath(global.SETTING_JSON);
    var path = require('path');
    // var confPath = appConf.getConfFilePath();
    // 表示初期化
    jqueryFileTree.init('.fileTree0', global.userDataDir + '/');
    // 表示フィルタ
    $('.jqueryFileTree a').addClass('mask')
    $('.file > a[rel$="' + "setting.json" + '"]').css({
        'display': 'block'
    })

    // リスト更新
    appConf.readConf(function(jsonConf) {
        console.log(jsonConf);
        for (var i in jsonConf.projects) {
            var project = jsonConf.projects[i];
            if (project === jsonConf.select_project) {
                $('.js-projectList').append('<option value="' + project + '" selected>' + project + '</option>');
            } else {
                $('.js-projectList').append('<option value="' + project + '">' + project + '</option>');
            }

        }
    });
    console.log("setting loaded.");
}


var phpServer = require('node-php-server');
var http = require('http');
global.PHP = {
    start: function(hostname, port) {
        // Create a PHP Server 
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            phpServer.createServer({
                "port": port,
                "hostname": hostname,
                //"base": jsonConf.asazuke + '/src/data/' + jsonConf.select_project + '/SampleSite/',
                "base": jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/SampleSite/',
                "keepalive": false,
                "open": false,
                //"bin": jsonConf.php,
                "bin": phpBin,
                "router": jsonConf.asazuke + '/router.php'
            });
            appendMsg('router : ' + jsonConf.asazuke + '/router.php');
            appendMsg('start-server : http://' + hostname + ':' + port);
        });
    },
    status: function(hostname, port, cb) {
        http.request({
            method: 'HEAD',
            hostname: hostname,
            port: port
        }, function(res) {
            if (res.statusCode === 200 || res.statusCode === 404) {
                appendMsg('PHPサーバー起動中');
                return cb();
            }
        }).on('error', function(err) {
            return 0;
        }).end();

    },
    stop: function() {
        // Close server 
        phpServer.close();
    }
}


const shell = require('electron').shell;
// shell.openExternal('https://github.com');
global.SHELL = {
    /**
     * @see http://electron.atom.io/docs/v0.36.5/api/shell/
     */
    openItem: function(fullPath) {
        var os = require('os');
        var platform = os.platform().toLowerCase();
        // if(!!(global.platform.match(/darwin|linux/i))){
        //     // windowsでは動かない。
        //     shell.openItem(fullPath);
        // }else{
        //     // windowsではc:\asazuke\hoge.csvとかすると既定のプログラムで開くハズ、、、
        //     appendMsg(fullPath);

        //     fullPath = (fs.realpathSync(fullPath));
        //     appendMsg(fullPath);
        //     var appConf = require('app-conf');
        //     appConf.setConfFilePath(global.SETTING_JSON);
        //     appConf.readConf(function(jsonConf){
        //         App.exec('explorer', [fullPath], jsonConf.asazuke);
        //     });
        // }
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            if (!!(global.platform.match(/darwin/i))) {
                App.exec('open', [fullPath], jsonConf.asazuke);
            } else if (!!(global.platform.match(/linux/i))) {
                // linux
                App.exec('xdg-open', [fullPath], jsonConf.asazuke);
            } else {
                // windows
                App.exec('start', [fullPath], jsonConf.asazuke);
            }
        });
    },
    openSqlDir: function () {
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            var sqlDir = directory_separator_repair(jsonConf.asazuke + '/src/data/sql/');
            console.log('sqlDir', sqlDir);
            if (!!(global.platform.match(/darwin/i))) {
                App.exec('open', [sqlDir], jsonConf.asazuke);
            } else if (!!(global.platform.match(/linux/i))) {
                // linux
                App.exec('xdg-open', [sqlDir], jsonConf.asazuke);
            } else {
                // windows
                App.exec('start', [sqlDir], jsonConf.asazuke);
            }
        });
    },
    execFile: function (fullPath) {
      // SQL
      if(path.extname(fullPath) == '.sql'){
          // とりあえずWindowsのみ
          var exec  = require('child_process').exec, child;
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            if (!!(platform.match(/darwin/i))) {
                // mac
                child = exec('cat  '+  directory_separator_repair(fullPath) + ' | ' + 'sqlite3                                       ' + jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/asazuke.sqlite',
            //jqueryFileTree.init('.fileTree4', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/');
            function (error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              appendMsg(stdout);
              console.log('stderr: ' + stderr);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
          });
            }else{
                // win 
                child = exec('type '+  directory_separator_repair(fullPath) + ' | ' 
				+ directory_separator_repair(jsonConf.asazuke + '/bin/sqlite/sqlite3.exe ')
				+ directory_separator_repair(jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/asazuke.sqlite'),
            //jqueryFileTree.init('.fileTree4', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/');
            function (error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              appendMsg(stdout);
              console.log('stderr: ' + stderr);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
          });
	      }
          //$('#consolePanel .layer-panel.is-current textarea')[0].value += '\'' + fullPath + '\'を実行しました。'+"\n";
          Console.appendMsg(fullPath + ' を実行しました。', 'info');
});
      }
    }
}
global.Ace = {
    save: function() {
    editor = ace.edit("editor");
      var filePath = $('.ace-filepath').text();
      var ace_func = require('ace-func');
      ace_func.saveFile(filePath, editor.getValue());
    },
    exec: function() {
    editor = ace.edit("editor");
      var filePath = $('.ace-filepath').text();
      var ace_func = require('ace-func');
      ace_func.execFile(filePath, editor.getValue());
    },
    remove: function() {
			$('.header-menu .item.active a').click();
    }
}
global.App = {
    toggleDevTools: function() {
        win.toggleDevTools();
        setTimeout(function() {
            window.resize()
        }, 1500);
    },
    exec: function(cmd, args, cwd) {
        exec(cmd, args, cwd);
    },
    execSiteScan: function() {

        // ページ初期化
        $('#div_C .layer-panel.is-current').html('<div class="asazuke-sitescan">' +
            '<div class="action-title"><h3>サイト検索</h3></div>' +
            '<div class="progress-sitescan"></div>' +
            '<table id="tbl-sitescan" border="1"><tr>' +
            '<th>id</th>' +
            '<th>fullPath </th>' +
            '<th>depth </th>' +
            // '<th>checkCount </th>' +
            '<th>status </th>' +
            '<th>statusCode </th>' +
            // '<th>time </th>' +
            '</tr></table>' +
            '</div>');

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:site-scan'], jsonConf.asazuke);
            //exec(composerPhar, ['run:site-scan'], jsonConf.asazuke);
            //exec(phpBin, ['--file','index.php', '-c', '/Users/mac/php.ini', 'site-scan'], jsonConf.asazuke);
            //exec(phpBin, ['--file','index.php', 'site-scan'], jsonConf.asazuke);
        });
    },
    execSiteValidationEx: function() {



        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            Load.htmlDownload();
            exec(phpBin, [composerPhar, 'run:site-validation-ex'], jsonConf.asazuke);
        });
    },
    execSiteValidationCsv: function() {



        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:site-validation-csv'], jsonConf.asazuke);
        });

    },
    execSiteValidationJson: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:site-validation-json'], jsonConf.asazuke);
        });
    },
    execHtmlScraping: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:scraping'], jsonConf.asazuke);
        });
    },
    // AsazukeConf.php読み込み
    execConfJson: function(cb) {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:conf-json'], jsonConf.asazuke, cb);
        });
    },
    execExecFileSQL: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:file-sql'], jsonConf.asazuke);
        });
    },
    execExecFileSQL_JSON: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            exec(phpBin, [composerPhar, 'run:file-sql-json'], jsonConf.asazuke);
        });
    },
    // phpのインストール先確認
    execWhichPhp: function() {
        appendMsg("which php");
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            appendMsg(phpBin);
            exec(phpBin, [composerPhar, 'which-php'], jsonConf.asazuke);
        });
    },
    execAsazukeUpdateCheck: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {

            exec(jsonConf.git, ['-C', jsonConf.asazuke, 'ls-remote', 'origin', 'HEAD'], jsonConf.asazuke, function() {
                exec(jsonConf.git, ['-C', jsonConf.asazuke, 'show', '-s', '--format=%H'], jsonConf.asazuke, function() {
                    console.log('gitHashRemote', global.gitHashRemote);
                    console.log('gitHashLocal', global.gitHashLocal);
                    if ((global.gitHashRemote).toString() == (global.gitHashLocal).toString()) {
                        appendMsg("-> コマンドラインツールのアップデートはありません");
                    } else {
                        appendMsg("-> コマンドラインツールのアップデートが見つかりました。");
                        $('.js-asazuke-update').after($('<span style="border-radius: 50%;background-color: #F00;display: inline-block;width: 1.5em;box-sizing: border-box;text-align: center;color: #ffF;border: 2px solid #FFF;position: relative;top: -0.5em;left: -1em;" class="update_icon">1</span>'));
                    }
                });
            });
            // exec(jsonConf.php, ['updatecheck.php'], jsonConf.asazuke);
        });
    },
    kill: function() {
        kill();
    },
    asazuke_install: function() {
        console.log('asazuke_install');
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            if (!fs_exists(jsonConf.git)) {
                Console.appendMsg(jsonConf.git + 'が見つかりません', 'error');
                Console.appendMsg('setting.jsonのgitパスを修正して下さい。', 'error');
            }
            var workdir = jsonConf.asazuke;
            exec(jsonConf.git, ['clone', jsonConf.asazuke_repos, workdir], '.', function() {
                exec(phpBin, [composerPhar, 'update'], workdir, function() {
                    var os = require('os');
                    var platform = os.platform().toLowerCase();
                    var fnCompliteMsg = function() {
                        appendMsg("コマンドラインツールのインストールが完了しました。");
                    }
                    if (!!(global.platform.match(/darwin|linux/i))) {
                        // mac or linux
                        appendMsg(phpBin);
                        appendMsg(composerPhar);
                        exec(phpBin, [composerPhar, 'darwin-chmod'], workdir, fnCompliteMsg);
                    } else {
                        // if platform.match('win') != null
                        fnCompliteMsg()
                    }
                })
            });
        });
    },
    asazuke_update: function() {
        console.log('asazuke_update');
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            if (!fs_exists(jsonConf.git)) {
                Console.appendMsg(jsonConf.git + 'が見つかりません', 'error');
                Console.appendMsg('setting.jsonのgitパスを修正して下さい。', 'error');
            }
            var workdir = jsonConf.asazuke;
            exec(jsonConf.git, ['pull'], workdir, function() {
                exec(phpBin, [composerPhar, 'update'], workdir, function() {
                    var os = require('os');
                    var platform = os.platform().toLowerCase();
                    var fnCompliteMsg = function() {
                        appendMsg("コマンドラインツールのアップデートが完了しました。");
                    }
                    if (!!(global.platform.match(/darwin|linux/i))) {
                        // mac or linux
                        exec(phpBin, [composerPhar, 'darwin-chmod'], workdir, fnCompliteMsg);
                    } else {
                        // if platform.match('win') != null
                        fnCompliteMsg()
                    }
                })
            });
        });
    },
};

// consoleメニュー
global.Console = {
    clear: function() {
        console.log('clear');
        var max_row = 100;
        //$('#consolePanel .layer-panel.is-current .div-textarea')[0].value = '';
        var selector = '#consolePanel .layer-panel.is-current .div-textarea';
        var txt = document.createElement("div");
        ta = document.querySelector(selector);
        var i = max_row;
        while (i >= 0) {
            ta.appendChild(document.createElement("div"));
            ta.removeChild(ta.children.item(0));
            i--;
        }
    },
    appendMsg: function(msg, msgType) {
        var selector = '#consolePanel .layer-panel.is-current .div-textarea';
        var txt = document.createElement("div");
        if (msgType != null) {
            txt.setAttribute('class', msgType);
        }
        txt.innerHTML = msg;
        ta = document.querySelector(selector);
        ta.appendChild(txt);
        ta.removeChild(ta.children.item(0));
        Console.scroll_bottom();
    },
    scroll_bottom: function() {
        var selector = '#consolePanel .layer-panel.is-current .div-textarea';
        ta = document.querySelector(selector);
        if (ta.length == 0) return;
        ta.scrollTop = ta.scrollHeight;
    }
};

// consoleメニュー
global.Setting = {
    paths: function() {

        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            jsonConf.php = $('#uv1').val();
            jsonConf.asazuke = $('#uv2').val();

            appConf.updateConf(jsonConf);
        });
    },
    // プロジェクト切り替え
    selectProject: function(project) {
        console.log('selectProject');
        // var swProject = $(elm).find('a').text();
        var swProject = project;

        $('.js-projectList').empty();
        var appConf = require('app-conf');

        console.log('global.SETTING_JSON', global.SETTING_JSON);
        appConf.setConfFilePath(global.SETTING_JSON);
        console.log('global.SETTING_JSON2', appConf.getConfFilePath());

        appConf.readConf(function(jsonConf) {
            jsonConf.select_project = swProject;
            appConf.updateConf(jsonConf);

            // TODO 合わせて修正(#1000)
            for (var i in jsonConf.projects) {
                var project = jsonConf.projects[i];
                if (project === jsonConf.select_project) {
                    $('.js-projectList').append('<option value="' + project + '" selected>' + project + '</option>');
                } else {
                    $('.js-projectList').append('<option value="' + project + '">' + project + '</option>');
                }
            }
            if (!!(global.platform.match(/darwin|linux/i))) {
                // mac or linux
                exec('unlink', ['AsazukeConf.php'], jsonConf.asazuke + '/src', function() {
                    // $ ln <リンク元ファイル> <リンク名>
                    exec('ln', ['-s', 'AsazukeConf-%s.php'.replace('%s', swProject), 'AsazukeConf.php'], jsonConf.asazuke + '/src', function() {
                        appendMsg("プロジェクト設定を切り替えました。");
                        Load.layerPanel(0);
                    });
                });
            } else {
                fs.unlink(jsonConf.asazuke + '\\src\\AsazukeConf.php', function() {
                    // Windowsでは管理者モードで起動しないとsymlinkが使えないのでcopyで代用
                    var r = fs.createReadStream(jsonConf.asazuke + '\\src\\' + 'AsazukeConf-%s.php'.replace('%s', swProject)),
                        w = fs.createWriteStream(jsonConf.asazuke + '\\src\\' + 'AsazukeConf.php');
                    w.on("close", function(ex) {
                        Load.layerPanel(0);
                    });
                    r.pipe(w);
                });
            }

        });

    },
    // プロジェクト追加
    addProject: function() {
        console.log("addProject");
        var smalltalk = require('smalltalk');
        smalltalk.prompt('新規プロジェクト作成', 'プロジェクト名を入力して下さい。', '', undefined, 'sample.jp').then(function(new_project) {
            console.log(new_project);

            $('.js-projectList').empty();
            var appConf = require('app-conf');
            appConf.setConfFilePath(global.SETTING_JSON);
            appConf.readConf(function(jsonConf) {
                jsonConf.projects.push(new_project);
                jsonConf.select_project = new_project;
                appConf.updateConf(jsonConf);

                // TODO 合わせて修正(#1000)
                for (var i in jsonConf.projects) {
                    var project = jsonConf.projects[i];
                    if (project === jsonConf.select_project) {
                        $('.js-projectList').append('<option value="' + project + '" selected>' + project + '</option>');
                    } else {
                        $('.js-projectList').append('<option value="' + project + '">' + project + '</option>');
                    }
                }

                // 新規設定ファイル作成
                var tmplate_prject = "sample.jp";
                var tmplate_conf = jsonConf.asazuke + '/src/AsazukeConf-%s.php';

                fs.readFile(tmplate_conf.replace('%s', tmplate_prject), 'utf8', function(err, text) {
                    fs.writeFile(tmplate_conf.replace('%s', new_project), text.replace(new RegExp(tmplate_prject, "g"), new_project), function(err) {
                        if (err) throw err;
                        console.log('It\'s saved!');

                        var treeReload = function() {
                            // 表示初期化
                            $('.fileTree0').empty();

                            var appConf = require('app-conf');
                            appConf.setConfFilePath(global.SETTING_JSON);
                            appConf.readConf(function(jsonConf) {
                                // jqueryFileTree.init('.fileTree2',jsonConf.asazuke + '/src/data/test/cssWorks/');
                                jqueryFileTree.init('.fileTree0', jsonConf.asazuke + '/src/');


                                // 表示フィルタ
                                // $('.jqueryFileTree a').css({"display": "none"});
                                $('.jqueryFileTree a').addClass('mask')
                                $('.file > a[rel*="AsazukeConf"]').css({
                                    'display': 'block'
                                })
                                $('.file > a[rel$="AsazukeConf.php"]').css({
                                    'color': '#BFBFBF'
                                })
                                $('.file > a[rel$="AsazukeConf-sample.jp.php"]').css({
                                    'display': 'none'
                                })

                                //プロジェクト設定
                                //projectSettingLoad();
                            });
                            appendMsg("プロジェクト設定を切り替えました。");
                        };
                        if (!!(global.platform.match(/darwin|linux/i))) {
                            // mac or linux
                            exec('unlink', ['AsazukeConf.php'], jsonConf.asazuke + '/src', function() {
                                // $ ln <リンク元ファイル> <リンク名>
                                exec('ln', ['-s', 'AsazukeConf-%s.php'.replace('%s', new_project), 'AsazukeConf.php'], jsonConf.asazuke + '/src', function() {
                                    appendMsg("プロジェクト設定を切り替えました。");
                                    Load.layerPanel(0);
                                    treeReload();
                                });
                            });
                        } else {
                            // windows
                            fs.unlink(jsonConf.asazuke + '\\src\\AsazukeConf.php', function() {
                                // Windowsでは管理者モードで起動しないとsymlinkが使えないのでcopyで代用
                                var r = fs.createReadStream(jsonConf.asazuke + '\\src\\' + 'AsazukeConf-%s.php'.replace('%s', new_project)),
                                    w = fs.createWriteStream(jsonConf.asazuke + '\\src\\' + 'AsazukeConf.php');
                                w.on("close", function(ex) {
                                    Load.layerPanel(0);
                                    treeReload();
                                });
                                r.pipe(w);
                            });
                        }
                        // exec('unlink', ['AsazukeConf.php'], jsonConf.asazuke + '/src', function(){
                        //     // $ ln <リンク元ファイル> <リンク名>
                        //     exec('ln', ['-s', 'AsazukeConf-%s.php'.replace('%s', new_project), 'AsazukeConf.php'], jsonConf.asazuke + '/src', function(){
                        // // fs.unlink(jsonConf.asazuke + '/src/AsazukeConf.php', function(){
                        // //     fs.symlink(jsonConf.asazuke + '/src/' + 'AsazukeConf-%s.php'.replace('%s', new_project)
                        // //                 , jsonConf.asazuke + '/src/' + 'AsazukeConf.php'
                        // //                 , 'file'
                        // //                 , function(){
                        //         // 表示初期化
                        //         $('.fileTree0').empty();
                        //         var appConf = require('app-conf');
                        //         appConf.setConfFilePath(global.SETTING_JSON);
                        //         appConf.readConf(function(jsonConf){
                        //             // jqueryFileTree.init('.fileTree2',jsonConf.asazuke + '/src/data/test/cssWorks/');
                        //             jqueryFileTree.init('.fileTree0',jsonConf.asazuke + '/src/');
                        //             // 表示フィルタ
                        //             // $('.jqueryFileTree a').css({"display": "none"});
                        //             $('.jqueryFileTree a').addClass('mask')
                        //             $('.file > a[rel*="AsazukeConf"]').css({'display':'block'})
                        //             $('.file > a[rel$="AsazukeConf.php"]').css({'color':'#BFBFBF'})
                        //             //プロジェクト設定
                        //             projectSettingLoad();
                        //         });
                        //         appendMsg("プロジェクト設定を切り替えました。");
                        //     });
                        // });
                    });
                });

            });

        }, function() {
            console.log('cancel');
        });
    },
    target: function() {
        // 設定更新
        // var AsazukeConf = require('./resources/js/node/asazuke-conf.js');
        var AsazukeConf = require('asazuke-conf');
        var newUrl = $('input[name="SITE_URL"]').val();
        var newStartPath = $('input[name="START_PATH"]').val();
        var newAuthUser = $('input[name="AUTH_USER"]').val();
        var newAuthPass = $('input[name="AUTH_PASS"]').val();
        AsazukeConf.updateConf(newUrl, newStartPath, newAuthUser, newAuthPass);

        showMsg({
            message: '設定を更新しました。'
        });
    },
    all: function() {
        $("#div_C").load("setting.html", function(htmlData, loadStatus) {
            console.log('htmlData', htmlData);
            console.log('loadStatus', loadStatus);
        });
    }
};

// 呼び出し
global.Load = {
    htmlDownload: function() {
        $('#div_C .layer-panel.is-current').empty().load('html_download.html');
    },
    sitemapCSV: function() {
        $('#div_C .layer-panel.is-current').empty().html(`
						<h3>サイトマップCSV作成</h3>
						<p>作成済みのCSV<p>
						<ul class="js_exported_sitemap"></ul>
						`);

        // リスト更新
        var appConf = require('app-conf');
        appConf.setConfFilePath(global.SETTING_JSON);
        appConf.readConf(function(jsonConf) {
            var dir = jsonConf.asazuke + "/";
            var files = fs.readdirSync(dir)
                .map(function(v) {
                    return {
                        name: v,
                        time: fs.statSync(dir + v).mtime.getTime()
                    };
                })
                //.sort(function(a, b) { return a.time - b.time; }) // ASC
                .sort(function(a, b) {
                    return b.time - a.time;
                }) // DESC
                .map(function(v) {
                    return v.name;
                });

            console.log(files);
            files.map(function(f) {
                var os = require('os');
                var platform = os.platform().toLowerCase();
                var path;
                if (!!(global.platform.match(/darwin|linux/i))) {
                    path = (dir + f);
                } else {
                    // PATHセパレータ正規化
                    path = (dir + f).replace(/\//g, '\\\\').replace(/\\/g, '\\\\');
                }
                // App.exec(path);
                $('.js_exported_sitemap').append('<li><a rel="' + path + '" onclick="SHELL.openItem(\'' + path + '\');">' + f + '</a></li>')
            });
            $('.js_exported_sitemap a').parent().css({
                'display': 'none'
            });
            //$('.js_exported_sitemap a[rel*="'+ jsonConf.select_project+'"]').parent().css({'display':'block'});
            $('.js_exported_sitemap a[rel*="' + global.confJson.projectName + '"]').parent().css({
                'display': 'block'
            });
        });
    },
    layerPanel: function(n) {
        // メニュー
        $('.header-menu .item').removeClass('active');
        $('.header-menu .item').eq(n).addClass('active');

        // 表示パネル
        var targetID = ['#div_A', '#div_C', '#consolePanel'];
        for (var ind in targetID) {
            console.log(targetID[ind]);
            $(targetID[ind] + ' .layer-panel').removeClass('is-current');
            $(targetID[ind] + ' .layer-panel').eq(n).addClass('is-current');
        }

        // SPAなので#editorが複数あると破綻するのでeditorは無きものにする。
        $("#div_C .layer-panel").empty();

        var config = require('../../../../package.json');
        // copyright
        $('.copyright').html(config.config.copyright);


								// 左メニュー非表示
                $("#content #div_vertical").css({'display':'block'});
                $("#content").removeClass('is-Single');

								// 
        // layer選択イベント
        switch (n) {
            case 0:
                $('#LeftPanel').width(270);
                $(window).resize();

                $("#div_C .layer-panel").eq(n).load("setting.html", function(htmlData, loadStatus) {
                    console.log("setting loaded2.");

                    // AppConf
                    var appConf = require('app-conf');
                    console.log(global.SETTING_JSON);
                    appConf.setConfFilePath(global.SETTING_JSON);
                    appConf.readConf(function(jsonConf) {
                        $('input[name="PHP_PATH"]').val(jsonConf.php);
                        $('input[name="ASAZUKE_DIR_PATH"]').val(jsonConf.asazuke);

                        // AsazukeConf
                        var asazukeConf = require('asazuke-conf');
                        console.log(jsonConf.asazuke + '/src/AsazukeConf.php');
                        // var fs = require('fs');
                        // var fs = require('fs-extra');
                        fs.stat(jsonConf.asazuke + '/src/AsazukeConf.php', function(err, stats) {
                            if (!err) {
                                asazukeConf.init(jsonConf.asazuke + '/src/AsazukeConf.php');
                                asazukeConf.readConf(function(result) {
                                    console.log(result.conf);
                                    $('input[name="SITE_URL"]').val((result.conf.url.value).match(/\'(.*)\'/)[1]);
                                    $('input[name="START_PATH"]').val((result.conf.startPath.value).match(/\'(.*)\'/)[1]);
                                    $('input[name="AUTH_USER"]').val((result.conf.authUser.value).match(/\'(.*)\'/)[1]);
                                    $('input[name="AUTH_PASS"]').val((result.conf.authPass.value).match(/\'(.*)\'/)[1]);
                                });
                            } else if (err.code === 'ENOENT') {
                                // パス名またはユーザ資源が存在しません。
                                appendMsg(jsonConf.asazuke + '/src/AsazukeConf.php' + 'パス名またはユーザ資源が存在しません。');
                            } else {
                                appendMsg(err.toString());
                            }
                        });

                        // 表示初期化
                        $('.fileTree0').empty();

                        var appConf = require('app-conf');
                        appConf.setConfFilePath(global.SETTING_JSON);
                        appConf.readConf(function(jsonConf) {
                            // jqueryFileTree.init('.fileTree2',jsonConf.asazuke + '/src/data/test/cssWorks/');
                            jqueryFileTree.init('.fileTree0', jsonConf.asazuke + '/src/');


                            // 表示フィルタ
                            // $('.jqueryFileTree a').css({"display": "none"});
                            $('.jqueryFileTree a').addClass('mask');
                            $('.file > a[rel*="AsazukeConf"]').css({
                                'display': 'block'
                            });
                            $('.file > a[rel$="AsazukeConf.php"]').css({
                                'color': '#BFBFBF'
                            });
                            $('.file > a[rel$="AsazukeConf-sample.jp.php"]').css({
                                'display': 'none'
                            })

                            //プロジェクト設定
                            projectSettingLoad();


                            // 更新チェック
                            //<span style="border-radius: 50%;background-color: #F00;display: inline-block;width: 1.5em;box-sizing: border-box;text-align: center;color: #ffF;border: 2px solid #FFF;position: relative;top: -0.5em;left: -1em;" class="update_icon">1</span>

                            App.execAsazukeUpdateCheck();

                        });

                    });
                    appConf.bindChange();
                });

                break;
            case 1:
                $('#LeftPanel').width(710);
                $(window).resize();


                $("#div_A .layer-panel").eq(n).load("batch.html", function(htmlData, loadStatus) {

                });
                // $("#div_C .layer-panel").eq(n).load("setting.html", function (htmlData, loadStatus){
                //     console.log("setting loaded.");
                // });
                // var jqueryFileTree = require('jquery-file-tree');
                // jqueryFileTree.init('.fileTree0','/Users/mac/vhosts/electron-asazuke/');
                break;
            case 2:
                $('#LeftPanel').width(500);
                $(window).resize();

                var appConf = require('app-conf');
                appConf.setConfFilePath(global.SETTING_JSON);
                appConf.readConf(function(jsonConf) {
                    $('.fileTree2').empty();
                    var tmpl = `
								<div style="display:table">
								<div class="fileTree2-0" style="display:table-cell"></div>
								<div class="fileTree2-1" style="display:table-cell"></div>
								<div class="fileTree2-2" style="display:table-cell"><ul></ul></div>
								</div>`;
                    $('.fileTree2').html($(tmpl));
                    //jqueryFileTree.init('.fileTree2-0',jsonConf.asazuke + '/src/data/' + jsonConf.select_project+ '/cssWorks/');
                    //jqueryFileTree.init('.fileTree2-1',jsonConf.asazuke + '/src/data/' + jsonConf.select_project+ '/lintResult/');
                    jqueryFileTree.init('.fileTree2-0', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/cssWorks/');
                    jqueryFileTree.init('.fileTree2-1', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/lintResult/');

                    // エラー件数表示
                    // App.execSiteValidationJson();
                    var maxCount = 10;
                    var loop = function(i){
                        return function(){
                            if (i > maxCount){
                                return;
                            }
                            console.log("try count. " + i);
                            if (!(global.job == null || typeof global.job.pid === "undefined")) {
                                var interval = 500;
                                // 最大 maxCount * interval
                                setTimeout(loop(++i), interval);
                            } else {
                                console.log('execSiteValidationJson');
                                App.execSiteValidationJson();
                                // カウントを無効化
                                i=maxCount;
                            }
                    
                        }   
                    }
                    setTimeout(loop(1),0);

                });
                break;

            case 3:
                $('#LeftPanel').width(170);
                $(window).resize();

                App.execConfJson(function() {
                    $("#div_C .layer-panel").eq(n).load("web_scraping.html", function(htmlData, loadStatus) {

                        var appConf = require('app-conf');
                        appConf.setConfFilePath(global.SETTING_JSON);
                        appConf.readConf(function(jsonConf) {
                            $('.fileTree3').empty();
                            //jqueryFileTree.init('.fileTree3',jsonConf.asazuke + '/src/data/' + jsonConf.select_project+ '/SampleSite/');
                            jqueryFileTree.init('.fileTree3', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/SampleSite/');
                        });
                    });
                });


                break;
            case 4:
                $('#LeftPanel').width(250);
                $(window).resize();


                $("#div_C .layer-panel").eq(n).load("database.html", function(htmlData, loadStatus) {

                    var appConf = require('app-conf');
                    appConf.setConfFilePath(global.SETTING_JSON);
                    appConf.readConf(function(jsonConf) {
                        $('.fileTree4').empty();
                        //console.log('.fileTree4',jsonConf.asazuke + '/src/data/' + jsonConf.select_project+ '/');
                        //jqueryFileTree.init('.fileTree4',jsonConf.asazuke + '/src/data/' + jsonConf.select_project+ '/');
                        //console.log('.fileTree4', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/');
                        //jqueryFileTree.init('.fileTree4', jsonConf.asazuke + '/src/data/' + global.confJson.projectName + '/');
                        console.log('.fileTree4', jsonConf.asazuke + '/src/data/sql/');
                        jqueryFileTree.init('.fileTree4', jsonConf.asazuke + '/src/data/sql/');



                        $('.jqueryFileTree a').addClass('mask')
                        //$('.file > a[rel*="asazuke.sqlite"]').css({
                        //    'display': 'block',
                        //    'color': '#BFBFBF'
                        //});
                        //$('.file > a[rel$="asazuke.sqlite"]').css({
                        //    'display': 'block',
                        //    'color': '#333'
                        //});
                        $('.file > a[rel$=".sql"]').css({
                            'display': 'block',
                            'color': '#333'
                        });
                    });
                });

                break;
            case 5:
                $('#LeftPanel').width(250);
                $(window).resize();


                //var config = require('../../../../package.json');
                var version = config.version;
                var platform = global.platform;
                var repos_url = (config.repository.url).replace(/\.git?$/g, '');

                $("#div_C .layer-panel").eq(n).load("other.html", function(htmlData, loadStatus) {
                    //    console.log('htmlData', htmlData, config);
                    $('.tmpl_appInfo').append(`
									<table border="1" style="margin: 15px 0 0; width:100%;">
									<tr>
									<th>アプリケーションバージョン</th>
									<td>${version}</td>
									</tr>
									<tr>
									<th>リポジトリ</th>
									<td><a href="${repos_url}" target="_blank">${repos_url}</a></td>
									</tr>
									</table>
									`);
                    $('.fileTree5').empty();
                    $('.fileTree5').load("other_left.html", function(htmlData, loadStatus) {
                        $('.tmpl_supportMenu').append(`
										<a href="${repos_url}/issues/new?labels=bug&amp;title=%E3%80%90%E3%83%90%E3%82%B0%E3%80%91%3C%21--+%E3%81%93%E3%81%93%E3%81%AB%E9%A1%8C%E5%90%8D%E3%82%92%E8%A8%98%E5%85%A5%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%E2%97%8B%E2%97%8B%E3%81%AExx%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%9B%E3%82%93%E3%80%82etc+--%3E&amp;body=%23%23%23+%E4%B8%8D%E5%85%B7%E5%90%88%E8%A9%B3%E7%B4%B0%0D%0A-+%E7%94%BB%E9%9D%A2%E5%90%8D%2F%E6%A9%9F%E8%83%BD%E5%90%8D%0D%0A-+%E3%81%84%E3%81%A4%2F%E2%97%8B%E2%97%8B%E6%A9%9F%E8%83%BD%E4%BD%BF%E7%94%A8%E6%99%82%0D%0A-+%E7%99%BA%E7%94%9F%E3%81%99%E3%82%8B%E7%8F%BE%E8%B1%A1%0D%0A%0D%0A%23%23%23+%E7%99%BA%E7%94%9F%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%0D%0A-+${version}(${platform})%0D%0A&amp;assignee=misak1" target="_blank" class="btn btn-default btn-block u-mt5">不具合報告</a></div>
										<div><a href="${repos_url}/issues/new?labels=idea&amp;title=%E3%80%90%E3%82%A2%E3%82%A4%E3%83%87%E3%82%A2%E3%80%91%3C%21--+%E3%81%93%E3%81%93%E3%81%AB%E9%A1%8C%E5%90%8D%E3%82%92%E8%A8%98%E5%85%A5%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%E2%97%8B%E2%97%8B%E3%81%AE%E6%A9%9F%E8%83%BD%E3%81%8C%E6%AC%B2%E3%81%97%E3%81%84%E3%80%82etc+--%3E&amp;body=%23%23%23+%E3%82%A2%E3%82%A4%E3%83%87%E3%82%A2%E8%A9%B3%E7%B4%B0%0D%0A-+%E7%94%BB%E9%9D%A2%E5%90%8D%2F%E6%A9%9F%E8%83%BD%E5%90%8D%E3%80%81%E8%A9%B2%E5%BD%93%E7%AE%87%E6%89%80%E3%81%8C%E3%81%AA%E3%81%91%E3%82%8C%E3%81%B0%EF%BC%88%22%E6%96%B0%E6%A9%9F%E8%83%BD%22%E3%81%A8%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%EF%BC%89%0D%0A-+%E6%AC%B2%E3%81%97%E3%81%84%E6%A9%9F%E8%83%BD&amp;assignee=misak1" target="_blank" class="btn btn-default btn-block u-mt5">アイデア</a></div>
										<div><a href="${repos_url}/issues/new?labels=question&amp;title=%E3%80%90%E8%B3%AA%E5%95%8F%E3%80%91%3C%21--+%E3%81%93%E3%81%93%E3%81%AB%E9%A1%8C%E5%90%8D%E3%82%92%E8%A8%98%E5%85%A5%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%E2%97%8B%E2%97%8B%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9%E3%81%8C%E3%82%8F%E3%81%8B%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93%E3%80%82etc+--%3E&amp;body=%23%23%23+%E8%B3%AA%E5%95%8F%E5%86%85%E5%AE%B9&amp;assignee=misak1" target="_blank" class="btn btn-default btn-block u-mt5">質問</a>
										`);
                    });
                });

                break;
            default:
                break;
        }

        // タイトル設定
        var appConf = require('app-conf');
        var config = require('../../../../package.json');
        var appName = config.config.appname;
        $('title').text($('.header-menu .item.active a').text() + ' | ' + appName);
        //appConf.setConfFilePath(global.SETTING_JSON);
        //appConf.readConf(function(jsonConf){
        //	$('title').text($('.header-menu .item.active a').text() + ' | ' + appName);
        //});
        // Asazuke設定読み込み
        mConsole.init('#consolePanel .layer-panel.is-current .div-textarea');
        //mConsole.init();
        App.execConfJson(function() {
            //appendMsg("which PHP");
            App.execWhichPhp();
        });
    }
};
