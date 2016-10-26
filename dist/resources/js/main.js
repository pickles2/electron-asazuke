// browser.js

var $ = jQuery = require('./resources/libs/jquery/jquery.min.js');
require('./resources/libs/jquery.easing/jquery.easing.js');
var _ = require('./resources/libs/underscore/underscore-min.js');

// node.js
var fs = require('fs');
var path = require('path');

require('./resources/js/node/app.js');

var SCRIPT = {
    // load: function(){
    //     // スクリプトの読み込みタイミング
    //     console.log('SCRIPT.load()');
    // },
    onload: function() {
        // </body>の直前
        console.log('SCRIPT.onload()');
        console.log('###', global.APP_CONF);
        var idx = $('.header-menu .item').index($(".active"));
        $('#div_A .layer-panel').addClass('is-current');
        $('#div_C .layer-panel').addClass('is-current');
        $('#consolePanel .layer-panel').addClass('is-current');
        Load.layerPanel(idx);
        // Load.layerPanel(4);
    }
};
// SCRIPT.load();

// DebToolにDevtronタブの追加
// require('devtron').install()


