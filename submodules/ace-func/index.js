/**
 * aceエディタの拡張
 */
module.exports = new(function() {
    console.log('ace-func');

    var $ = jQuery = require('jquery');
    var _ = require('underscore');
    // node.js
    var fs = require('fs');
    var path = require('path');

    this.loadFile = function(filePath) {
        // ファイルパス取得
        console.log(filePath);

        // 拡張子と言語の割り当て
        var ext_map = {
            ".html": "html",
            ".js": "javascript",
            ".coffee": "coffee",
            ".xml": "xml",
            ".css": "css",
            ".lua": "lua",
            ".php": "php",
            ".json": "json",
            ".xquery": "xquery",
            ".sql": "sql"
        };
        // console.log(__dirname + '/editor.html');
        var editor_tpl = fs.readFileSync(__dirname + '/editor.html', 'utf-8');

        var ext = path.extname(filePath);
        // var axt = filePath.split('.');
        // var ext = axt[axt.length - 1];
        // console.log('ext', ext_map[ext]);
        var target_txt = fs.readFileSync(filePath, 'utf-8');
        // console.log(target_txt);
        var compiled = _.template(editor_tpl);
        var valiable = {
            "editor_text": target_txt,
            "language": ext_map[ext]
        };
        // $("#div_C").html(compiled(valiable));


        if ($('.header-menu .item').index($('.active')) == 3) {
            // console.log("ace-func.js WEBスクレイピング");
            $('#div_C .layer-panel.is-current .above_panel').empty().append(compiled(valiable));

            var sv_url = 'http://' + global.confJson.buildInServerIp + ':' + global.confJson.buildInServerPort + filePath.replace(global.appJson.asazuke + '/src/data/' + global.appJson.select_project + '/SampleSite', '');
            $('#div_C .layer-panel.is-current .scraping_preview').attr('src', sv_url);
            $('#editor').css({
                'height': '50%'
            });
        } else {
            $("#div_C .layer-panel.is-current").empty().append(compiled(valiable));
        }

        $('.ace-filepath').text(filePath);
    }

    this.saveFile = function(fullPath, editData) {
        fs.writeFile(fullPath, editData, function(err) {
            if (err) throw err;
            if ($('.header-menu .item').index($('.active')) == 3) {
                // console.log("ace-func.js WEBスクレイピング ≒ reload()");
                var sv_url = 'http://' + global.confJson.buildInServerIp + ':' + global.confJson.buildInServerPort + fullPath.replace(global.appJson.asazuke + '/src/data/' + global.appJson.select_project + '/SampleSite', '');
                $('#div_C .layer-panel.is-current .scraping_preview').attr('src', sv_url);
                $('#editor').css({
                    'height': '50%'
                });
            }
            //        $('#consolePanel .layer-panel.is-current textarea')[0].value += '\'' + fullPath + '\'を保存しました。'+"\n";
            Console.appendMsg('\'' + fullPath + '\'を保存しました。', "info");

        });
    }

    this.execFile = function(fullPath, editData) {
        fs.writeFile(fullPath, editData, function(err) {
            if (err) throw err;
            SHELL.execFile(fullPath);
        });
    }
})();