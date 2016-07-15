const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// const remote = electron;
const {Menu, MenuItem} = electron

console.log(app.getAppPath())

const menu = new Menu()
menu.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked'); } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))

// Module to control application life.
// アプリケーションをコントロールするモジュール

// Module to create native browser window.
// ウィンドウを作成するモジュール
// let BrowserWindow = app.BrowserWindow;
// Report crashes to our server.
// require('crash-reporter').start();
// const crashReporter = remote;
// crashReporter.start({
//   productName: 'YourName',
//   companyName: 'YourCompany',
//   submitURL: 'https://your-domain.com/url-to-submit',
//   autoSubmit: true
// });

let package_info = require('./package.json')

// Quit when all windows are closed.
// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit()
    }
})

global.APP_PATH = app.getAppPath()
global.APP_CONF = APP_PATH + '/setting.json'
global.homeDir = app.getPath('home')
global.exe = app.getPath('exe')
global.userDataDir = app.getPath('userData')
global.SETTING_JSON = global.userDataDir + '/setting.json'
console.log(global.SETTING_JSON)
let fs = require('fs')

// setting.jsonがない場合にはコピーから作成する。
let appConf = require('app-conf');
fs.stat(global.SETTING_JSON, function (stat) {
    if (stat == null) {

    } else if (stat.code === 'ENOENT') {
        // ファイルがない場合。
        console.log('ファイルがない場合。')
        appConf.setConfFilePath(global.APP_CONF)
        appConf.readConf(function (jsonConf) {
            appConf.setConfFilePath(global.SETTING_JSON)
            console.log(jsonConf)
            jsonConf.asazuke = global.homeDir + '/Asazuke'
            fs.writeFile(global.SETTING_JSON, JSON.stringify(jsonConf, null, "    "), function (err) {
                if (err) throw err;
                // setting.jsonのコピーを作成する
                console.log('It\'s saved!')
            })
        })
    }
})

// メインウィンドウはGCされないようにグローバル宣言
//let mainWindow;
let mainWindow

// let electron = require('electron');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    })
    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/dist/index.html')

    let application_menu = [{
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
    }]
    if (process.platform == 'darwin') {
        //let name = require('electron').app.getName();
        //let name = package_info.name;
        let app_name = package_info.config.appname
        console.log(app_name)
        application_menu.unshift({
            label: app_name,
            submenu: [{
                label: 'About ' + app_name,
                role: 'about'
            }, {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        app.quit();
                    }
                },]
        })
    }
    let menu = Menu.buildFromTemplate(application_menu)
    Menu.setApplicationMenu(menu)

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    //mainWindow.toggleDevTools()
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
})