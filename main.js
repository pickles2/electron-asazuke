'use strict';

// Module to control application life.
// アプリケーションをコントロールするモジュール
var app = require('app');

// Module to create native browser window.
// ウィンドウを作成するモジュール
var BrowserWindow = require('browser-window');
// Report crashes to our server.
require('crash-reporter').start();

var package_info = require('./package.json');

// Quit when all windows are closed.
// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

global.APP_PATH = app.getAppPath();
global.APP_CONF = APP_PATH + '/setting.json';
global.homeDir = app.getPath('home');
global.exe = app.getPath('exe');
global.userDataDir = app.getPath('userData');
global.SETTING_JSON = global.userDataDir + '/setting.json';
console.log(global.SETTING_JSON);
var fs = require('fs');

// setting.jsonがない場合にはコピーから作成する。
var appConf = require('app-conf');
fs.stat(global.SETTING_JSON, function(stat) {
    if (stat == null) {

    } else if (stat.code === 'ENOENT') {
        // ファイルがない場合。
        console.log('ファイルがない場合。');
        appConf.setConfFilePath(global.APP_CONF);
        appConf.readConf(function(jsonConf) {
            appConf.setConfFilePath(global.SETTING_JSON);
            console.log(jsonConf);
            jsonConf.asazuke = global.homeDir + '/Asazuke';
            fs.writeFile(global.SETTING_JSON, JSON.stringify(jsonConf, null, 　"    "), function(err) {
                if (err) throw err;
                // setting.jsonのコピーを作成する
                console.log('It\'s saved!');
            });
        });
    }
});


// メインウィンドウはGCされないようにグローバル宣言
//var mainWindow;
var mainWindow = null;

var electron = require('electron');
//var Menu = electron.Menu;
var Menu = require('menu');




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });
    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');

    var application_menu = [{
        label: "Edit",
        submenu: [{
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            selector: "cut:"
        }, {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            selector: "copy:"
        }, {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            selector: "paste:"
        }]
    }];
    if (process.platform == 'darwin') {
        //var name = require('electron').app.getName();
        //var name = package_info.name;
        var app_name = package_info.config.appname;
        console.log(app_name);
        application_menu.unshift({
            label: app_name,
            submenu: [{
                label: 'About ' + app_name,
                role: 'about'
            }, {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: function() {
                    app.quit();
                }
            }, ]
        });
    }
    var menu = Menu.buildFromTemplate(application_menu);
    Menu.setApplicationMenu(menu);


    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    //  mainWindow.toggleDevTools();

});