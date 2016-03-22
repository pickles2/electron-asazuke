//electron-packager . electron-cutLF --out='./bin' --platform='darwin,win32' --arch=x64 --version=0.36.1 --icon='./app.icns'

// コマンド例
// # node release.js      <- プラットフォームに応じたビルド
// # node release.js win  <- windows指定
// # node release.js mac  <- mac指定

var packager = require('electron-packager');
var config = require('./package.json');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');
var fs = require('fs');

var isZip = false;

var isWin = false;
if (typeof process.argv[2] === 'undefined') {
    isWin = /^win/.test(process.platform);
} else if (/^win/.test(process.argv[2])) {
    isWin = true;
} else {

}
if (!isWin) {
    console.log('Build Target -> Mac');
    var r = fs.createReadStream('./setting-darwin.json'),
        w = fs.createWriteStream('./setting.json');
    r.pipe(w);
} else {
    console.log('Build Target -> Windows');
    var r = fs.createReadStream('./setting-win32.json'),
        w = fs.createWriteStream('./setting.json');
    r.pipe(w);
}
var arch = 'x64';
if (typeof process.argv[3] === 'undefined') {
  console.log('arch -> x64');
} else if (/ia32/.test(process.argv[3])) {
  console.log('arch -> ia32');
  arch = 'ia32'; // i686 linux option or Windows 32bit
} else {
  console.log('arch -> x64');
}
var dir = './';
var out = './bin';
var app_name = config.config.appname;
var platform = 'darwin'
// アプリアイコン
var icon = './app.icns';
if (isWin) {
    platform = 'win32';
    icon = './app.ico';
}
// platform: 'linux',
var version = '0.36.1';
var app_bundle_id = 'jp.co.imjp'; //<- 自分のドメインなどを使用してください
var helper_bundle_id = 'jp.co.imjp.scraper'; //<- 自分のドメインなどを使用してください

var aser_unpack_dir = 'node-php-bin';

var zip = function (relativePath, cb) {
    zipFolder(
        __dirname + '/' + relativePath + '/',
        __dirname + '/' + relativePath + '.zip',
        function (err) {
            if (err) {
                console.log('zip ERROR!', err);
            } else {
                rimraf('./' + relativePath, function () {
                    // Something
                    console.log('zip SUCCESS!.');
                    cb();
                });

            }
        }
        );
}
var npm_ignore = [], ignores;
for (var key in config.devDependencies) {
    npm_ignore.push(key);
}
ignores = npm_ignore.join('|');
var ignore_phpDir = 'node-php-bin/bin/';
if(isWin){
  ignore_phpDir += 'darwin/';
}else{
  ignore_phpDir += 'win32/';
}
console.time("build-time");
packager({
    "dir": dir,
    "out": out,
    "name": app_name,
    "platform": platform,
    "arch": arch,
    "version": version,
    "icon": icon,
    'app-bundle-id': app_bundle_id,
    'app-version': config.version,
    //"asar-unpack-dir": aser_unpack_dir,
    "asar-unpack-dir": "node-php-bin",
    //'asar-unpack-dir': "vendor",
    'helper-bundle-id': helper_bundle_id,
    overwrite: true,
    // asar: false,
    asar: true, // aserに固める
    prune: true,
    // ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|release\.js",
    //ignore: 'node_modules/(' + ignores + '|\.bin)|release(\.sh|\.js)|bin/|node-php-bin/bin/win32/',
    //ignore: 'node_modules/(' + ignores + '|\.bin)|release(\.sh|\.js)|win32/',
    ignore: 'node_modules/(' + ignores + '|\.bin)|release(\.sh|\.js)|'+ ignore_phpDir,
    'version-string': {
        CompanyName: 'IMJ Corporation.',
        FileDescription: config.description,
        OriginalFilename: app_name,
        FileVersion: config.version,
        ProductVersion: config.version,
        ProductName: app_name,
        InternalName: app_name
    }
}, function done(err, appPath) {
    if (err) {
        throw new Error(err);
    }
    console.log('appPath', appPath);
    if (isZip) {
        zip(appPath, function () {
            console.timeEnd("build-time");
            console.log('Done!!');
        });
    } else {
        console.timeEnd("build-time");
        console.log('Done!!');
    }
})
