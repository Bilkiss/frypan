
/*
 * GET home page.
 */

exports.index = function(req, res){
  var fs = require('fs');
  var util = require('util');
  var exec = require('child_process').exec;
  exec('compass compile',function(err,stdout,stderr){
        util.puts(stdout)
  })
  fs.readFile('fries-master/lib/sass/holo-dark/_variables.scss', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    data = data.replace(/\"/g,"'");
    data = data.replace(/\n\r/g,"_____");
    data = data.replace(/\n/g,"_____");

    var objStyle = new Array();
      objStyle['rules'] = data;
      objStyle['title'] = 'liveStyler v0.2';
    res.render('index', objStyle);
  });

};
