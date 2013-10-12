
/*
 * GET users listing.
 */

exports.save = function(req, res){

  var newStr = '';
  for (var propName in req.body) {
    newStr += propName;
  }

  fs = require('fs');
  fs.rename('app/sass/theme/config/_config.scss', 'app/sass/theme/config/_cacheconfig.scss', function(err){
    if (err){
      console.log("An error has occured");
    }
    else {
      fs.writeFile('app/sass/theme/config/_config.scss', newStr, function(){
        var util = require('util');
        var exec = require('child_process').exec;
        exec('compass compile',function(err,stdout,stderr){
          console.log(err + stdout)
          util.puts(stdout)
        })
        res.send('success');
      })
    }
  });
//res.send(newStr);//JSON.stringify(req.body));
};
