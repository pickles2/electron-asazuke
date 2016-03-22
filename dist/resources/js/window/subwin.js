(function() {

  //Node Libs
  var remote = require('remote');
//   var cmd = remote.require('./cmd.js');
  var bw = remote.require('browser-window');

  //Initialize jQuery
  window.jQuery = window.$ = require('./resources/libs/jquery/jquery.min.js');

  /* Bind tab controls */
  $("body").on("click", "li[role=tab]:not([aria-selected=true])", function() {
    
    //switch tabs
    $("li[role=tab]").attr("aria-selected", false)
        .filter(this).attr("aria-selected", true);

    //switch panels
    $("li[role=tabpanel]").attr("aria-hidden", true)
      .filter("[aria-describedby=" + this.id + "]").attr("aria-hidden", false);
  });


  var timer = null;
  var auxWindow = null;
  $(".js-iframe-ctrl").on("keyup", function() {

    clearTimeout(timer);

    var url = this.value;
    if(!/^https?:\/\//.test(url)) {
      url = "https://" + url;
    }

    timer = setTimeout(function() {
      // $("iframe").attr("src", url);
      if(!auxWindow) {
        auxWindow = new bw({width: 800, height: 600});
      }
       
      auxWindow.loadURL(url);
      auxWindow.on('closed', function() {
        auxWindow = null;
      });

    }, 400);

  });

})();