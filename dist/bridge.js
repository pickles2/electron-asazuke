var ipc = require('ipc');

// 非同期
console.log("ping");
ipc.send('asynchronous-message', 'ping');

// 同期
var response = ipc.sendSync('synchronous-message', 'ping');

// var ipc = require('ipc');
function hello() {
  alert("hello ping")
  ipc.send('async-message', 'ping2');
}
// MainProcessでの処理完了通知をハンドルするため
ipc.on('async-reply', function (arg) {
  alert(arg);
});
hello();
