var target = require('./php-killer.js');
target.getProcess();
setTimeout(function(){
    target.killProcess();
}, 1000);