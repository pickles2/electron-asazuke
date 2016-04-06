// Uses Node, AMD or browser globals to create a module.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrict.js

// Defines a module "returnExports" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

// if the module has no dependencies, the above pattern can be simplified to

//(function(root, factory) {
//    if (typeof define === 'function' && define.amd) {
//        // AMD. Register as an anonymous module.
//        define([], factory);
//    } else if (typeof module === 'object' && module.exports) {
//        // Node. Does not work with strict CommonJS, but
//        // only CommonJS-like environments that support module.exports,
//        // like Node.
//        module.exports = factory();
//    } else {
//        // Browser globals (root is window)
//        root.returnExports = factory();
//    }
//}(this, function() {
module.exports = new(function() {

    var bottom_lock = true;
    var max_row = 100; // limit
    var ta;
    var selector;

    this.scrollBottom = function(boolVal) {
            bottom_lock = boolVal;
        }
        // カーソルを最下行に合わせる
    this.scroll_bottom = function() {
        if (bottom_lock) {
            //console.log('go_bottom');
            //var $obj = $textarea;
            //console.log($obj);
            //        var ta = document.querySelector('.div-textarea');
            if (ta.length == 0) return;
            ta.scrollTop = ta.scrollHeight;
        }
    }
    this.setRow = function(rowNum) {
        this.max_row = rowNum;
    }
    this.appendMsg = function(msg) {

        var txt = document.createElement("div");
        //txt.innerHTML = i + ":" + String.fromCharCode(65 + i);
        txt.innerHTML = msg;

        ta = document.querySelector(selector);
        //ta = $(selector)[0];
        ta.appendChild(txt);
        //console.log(ta.children.item(0));
        ta.removeChild(ta.children.item(0));
        this.scroll_bottom();

    }
    this.clearMsg = function() {
        ta = document.querySelector(selector);
        var i = max_row;
        while (i >= 0) {
            ta.appendChild(document.createElement("div"));
            ta.removeChild(ta.children.item(0));
            i--;
        }
    }

    this.init = function(selector_txt) {
        //appDirPath = dirPath;
        //
        // FIFO  Console
        var default_selector = '.div-textarea';
        if (selector_txt == null || typeof selector_txt === 'undefined') {
            selector = default_selector;
        } else {
            selector = selector_txt;
        }
        ta = document.querySelector(selector);
        var txt = document.createElement("div");
        txt.innerHTML = "";
        var i = max_row;
        while (i > 0) {
            ta.appendChild(txt);
            i--;
        }

        //var i = 0;
        //var loopFn = function() {
        //    setTimeout(function loop() {
        //        appendMsg(String.fromCharCode(65 + i));
        //        scroll_bottom();
        //        i++;
        //        loopFn();
        //    }, 30);
        //};
        //loopFn();
    }
})();
//   return this;
//}));