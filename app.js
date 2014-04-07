var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.post('/inbound', function(req, res) {
  var incomingMail = '';
  req.on('data', function(data){
    incomingMail += data;
  });

  req.on('end', function(){
    var mailJSON = JSON.parse(incomingMail);

    console.log(mailJSON);
  });
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
  console.log("Listening on " + port);
});
