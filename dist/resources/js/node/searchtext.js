// const remote = require('electron').remote;
// const app = require('path');

// "use strict";
// Polymer({
//     is: 'builtin-search',
//     properties: {
//         displayed: {
//             type: Boolean,
//             value: false,
//         },
//         searching: {
//             type: Boolean,
//             value: false,
//         },
//         activeIdx: {
//             type: Number,
//             value: 0,
//         },
//         onMount: Object,
//         onUnmount: Object,
//     },
//     focusOnInput: function () {
//         this.webview.focus();
//         this.webview.send('builtin-search:focus');
//     },
//     ready: function () {
//         var _this = this;
//         this.webview = document.querySelector('.input-workaround');
//         this.webview.src = 'file://' + path.join(__dirname, 'search-input.html');
//         this.webview.addEventListener('ipc-message', function (e) {
//             var channel = e.channel;
//             switch (channel) {
//                 case 'builtin-search:query': {
//                     var text = (e.args[0] || '');
//                     _this.search(text);
//                     break;
//                 }
//                 case 'builtin-search:close': {
//                     _this.dismiss();
//                     break;
//                 }
//                 default:
//                     break;
//             }
//         });
//         this.webview.addEventListener('console-message', function (e) {
//             console.log('console-message: ', e.line + ': ' + e.message);
//         });
//         this.webview.addEventListener('dom-ready', function () {
//             _this.webview.addEventListener('blur', function (e) {
//                 _this.focusOnInput();
//             });
//             if (_this.displayed) {
//                 _this.focusOnInput();
//             }
//         });
//         this.button = document.querySelector('.builtin-search-button');
//         this.button.addEventListener('click', function () {
//             _this.search(_this.input.value);
//         });
//         this.body = document.querySelector('.builtin-search-body');
//         this.body.classList.add('animated');
//         if (this.displayed) {
//             this.body.style.display = 'block';
//         }
//         this.matches = document.querySelector('.builtin-search-matches');
//         electron_1.remote.getCurrentWebContents().on('found-in-page', function (event, result) {
//             if (_this.requestId !== result.requestId) {
//                 return;
//             }
//             if (result.activeMatchOrdinal) {
//                 _this.activeIdx = result.activeMatchOrdinal;
//             }
//             if (result.finalUpdate && result.matches) {
//                 _this.setResult(_this.activeIdx, result.matches);
//             }
//         });
//         this.up_button = document.querySelector('.builtin-search-up');
//         this.up_button.addEventListener('click', function () { return _this.searchNext(_this.query, false); });
//         this.down_button = document.querySelector('.builtin-search-down');
//         this.down_button.addEventListener('click', function () { return _this.searchNext(_this.query, true); });
//         this.close_button = document.querySelector('.builtin-search-close');
//         this.close_button.addEventListener('click', function () { return _this.dismiss(); });
//     },
//     toggle: function () {
//         if (this.displayed) {
//             this.dismiss();
//         }
//         else {
//             this.show();
//         }
//     },
//     show: function () {
//         if (this.displayed) {
//             return;
//         }
//         this.body.classList.remove('slideOutUp');
//         this.body.classList.add('slideInDown');
//         this.body.style.display = 'block';
//         this.displayed = true;
//         if (this.onMount) {
//             this.onMount();
//         }
//     },
//     dismiss: function () {
//         var _this = this;
//         if (!this.displayed) {
//             return;
//         }
//         var removeNode = function () {
//             _this.body.style.display = 'none';
//             _this.body.removeEventListener('animationend', removeNode);
//             _this.displayed = false;
//         };
//         this.body.addEventListener('animationend', removeNode);
//         this.body.classList.remove('slideInDown');
//         this.body.classList.add('slideOutUp');
//         if (this.searching) {
//             this.stopSearch();
//         }
//         if (this.onUnmount) {
//             this.onUnmount();
//         }
//     },
//     search: function (word) {
//         if (word === '') {
//             this.dismiss();
//             return;
//         }
//         if (!this.searching || this.query !== word) {
//             this.requestId = electron_1.remote.getCurrentWebContents().findInPage(word);
//             this.searching = true;
//             this.query = word;
//             this.focusOnInput();
//             return;
//         }
//         // Note: When this.query === word
//         this.searchNext(word, true);
//     },
//     searchNext: function (text, forward) {
//         if (text === '') {
//             return;
//         }
//         var options = {
//             forward: forward,
//             findNext: true,
//         };
//         this.requestId = electron_1.remote.getCurrentWebContents().findInPage(text, options);
//         this.focusOnInput();
//     },
//     stopSearch: function () {
//         if (!this.searching) {
//             return;
//         }
//         this.setResult(0, 0);
//         electron_1.remote.getCurrentWebContents().stopFindInPage('clearSelection');
//         this.searching = false;
//         this.query = '';
//         this.requestId = undefined;
//         this.activeIdx = 0;
//     },
//     setResult: function (no, all) {
//         this.matches.innerText = no + "/" + all;
//     },
// });