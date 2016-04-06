require('ace-min-noconflict');
//- require('ace-min-noconflict/mode-javascript');
require('ace-min-noconflict/mode-php');
var editor;
window.onload = function() {
    editor = ace.edit("editor");
    //- editor.getSession().setMode('ace/mode/javascript');
    editor.getSession().setMode('ace/mode/php');
};

function openFile(file) {
    require('fs').readFile(file, 'utf8', function(err, data) {
        editor.setValue(data, -1);
    });
}
document.ondragover = function(e) {
    e.preventDefault();
    return false;
}
document.ondrop = function(e) {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
        var file = e.dataTransfer.files[0].path;
        if (/\\.js$/.test(file)) {
            openFile(file);
        }
    }
    return false;
}