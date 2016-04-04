/**
 * ファイルツリー
 */
module.exports = new(function() {
    
    var fs = require('fs');
    var ace_func = require('ace-func');
    /**
     * 子階層を取得
     */
    var getDirList = function (rootDir) {
        // var _getDirList = function() {
        // var dir = request.body.dir;
        var dir = rootDir;
        // var r = '<ul class="jqueryFileTree" style="display: none;">';
        var r = '<ul class="jqueryFileTree" style="display: block;">';
        try {
            // 	r = '<ul class="jqueryFileTree" style="display: none;">';
            r = '<ul class="jqueryFileTree" style="display: block;">';
            var files = fs.readdirSync(dir);
            files.forEach(function (f) {
                var ff = dir + f;
                var stats = fs.statSync(ff)
                if (stats.isDirectory()) {
                    // f = f.replace(/ /g, "%20");
                    ff = ff.replace(/ /g, "%20");
                    r += '<li class="directory collapsed"><a href="#" rel="' + ff + '/">' + f + '</a></li>';
                } else {
                    var e = $(f.split('.')).last()[0];
                    // f = f.replace(/ /g, "%20");
                    ff = ff.replace(/ /g, "%20");
                    r += '<li class="file ext_' + e + '"><a href="#" rel="' + ff + '">' + f + '</a></li>';
                }
            });
            r += '</ul>';
        } catch (e) {
            console.log(e);
            // r += 'Could not load directory: ' + dir;
            r += 'ディレクトリがロード出来ません。<br> ' + dir;
            r += '</ul>';
        }
        return r;
    }
    
    /**
     * ファイル読み込み(aceエディタに反映)
     */
    var loadFile = function(e){
        // ファイルパス取得
        var filePath = $(e.currentTarget).attr('rel');
        filePath = filePath.replace(/%20/g, ' ');
        ace_func.loadFile(filePath);
    }
    
    this.init = function(target ,dirPath){
        console.log('init');
        $.fn.eventPathClick = function () {
            $('.directory > a[href="#"]').off('click').on('click', function (e) {
                var $currentTarget = $(e.currentTarget);
                var $li = $currentTarget.parent();
                if ($li.has('ul').length == 0) {
                    // 下層を追加
                    var path = $currentTarget.attr('rel');
                    
                    //$('#consolePanel .layer-panel.is-current textarea')[0].value += path + " を選択しました。\n";
                    Console.appendMsg(path + " を選択しました。");
                    
                    $currentTarget.after(getDirList(path)).eventPathClick();
                }
                // 開閉
                if ($li.hasClass("collapsed")) {
                    $li.removeClass("collapsed").addClass("expanded");
                } else if ($li.hasClass("expanded")) {
                    $li.removeClass("expanded").addClass("collapsed");
                }
            });
            $('.file > a[href="#"]').off('click').on('click', function (e) {
                //$('#consolePanel .layer-panel.is-current textarea')[0].value += $(e.currentTarget).attr('rel') + " を選択しました。\n";
                Console.appendMsg($(e.currentTarget).attr('rel') + " を選択しました。");
                loadFile(e);
            });
        };
        $('.file > a[href="#"]').off('click').on('click', function (e) {
            $('#consolePanel .layer-panel.is-current textarea')[0].value += $(e.currentTarget).attr('rel') + " を選択しました。\n";
            Console.appendMsg($(e.currentTarget).attr('rel') + " を選択しました。");
            loadFile(e);
        });
        $(target).append(getDirList(dirPath)).eventPathClick();
    }
})();
