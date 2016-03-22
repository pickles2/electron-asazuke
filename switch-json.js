// コマンド例
// # node switch-json.js      <- プラットフォームに応じたビルド
// # node switch-json.js win  <- windows指定
// # node switch-json.js mac  <- mac指定

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