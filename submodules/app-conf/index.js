/**
 * AsazukeConf更新
 */
module.exports = new(function() {
    var fs = require('fs');
    this.confFile;
    // var confFile = __dirname + '/setting.json'
    
    this.setConfFilePath = function(filePath){
        this.confFile = filePath;
    }
    this.getConfFilePath = function(){
        return this.confFile;
    }
    
    this.readConf = function (cb){
        fs.readFile(this.confFile, 'utf8', function (err, text) {
            if(err != null){
                console.log('error!?');
                console.log(err);
                //$('input[name="SITE_URL"]')
            }else{
                var jsonConf = JSON.parse(text)
                cb(jsonConf);
            }
        });
    }
    

    /**
     * 行数と行データに分割し対象のデータを置き換える。
     */
    this.updateConf = function (updateObj) {
        var _confFile = this.confFile;
        this.readConf(function(jsonConf){
            console.log('updateObj', updateObj);
            console.log('jsonConf', jsonConf);
            for(var i in updateObj){
                console.log(i);
                switch (i) {
                    case "php":
                        jsonConf[i] = updateObj[i];
                        break;
                    case "asazuke":
                        jsonConf[i] = updateObj[i];
                        break;
                    case "projects":
                        jsonConf[i] = updateObj[i];
                        break;
                    case "select_project":
                        jsonConf[i] = updateObj[i];
                        break;
                    default:
                        break;
                }
            }
            fs.writeFile(_confFile, JSON.stringify(jsonConf, null,　"    "), function(err) {
                if (err) throw err;
                console.log('It\'s saved!');
            });
        });
    }
    
    /**
     * input[type="file"] と　input[type="text"]の変換
     */
    this.bindChange = function(){
            // PHPパス & Asazukeパス
        var $inputFile1 = $('#uv1_file');
        var $inputFile2 = $('#uv2_file');
        // var reader = new FileReader();
        var fileChange = function (ev) {
            // input[type="file"]
            var target = ev.target;
            var file = target.files[0];
            var type = file.type;
            var size = file.size;
            var path = file.path;
            
            // input[type="text"]
            var id = $(target).attr('id').replace(/_file/,'');
            $('#' + id).val(path);
        }
        $inputFile1.on('change', fileChange);
        $inputFile2.on('change', fileChange);
    }
})();
