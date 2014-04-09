var db = require('mongoskin').db('mongodb://localhost:27017/local');
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.post('/inbound', function(req, res) {
  var incomingMail = '';
  var monitorName = '';
  var date = Date.now();

  req.on('data', function(data){
    incomingMail += data;
  });

  req.on('end', function(){
    var mailJSON = JSON.parse(incomingMail);

    if (mailJSON.Subject.match(/\[General UI\] "Production Support"/)) {
      var status = mailJSON.Subject.match(/UP|DOWN/)[0];
      var projectName = mailJSON.Subject.match(/RM(.+)/g)[0];
      var monitorName = '';

      if (mailJSON.Subject.match(/You Site:/)) {
        monitorName = 'StatusCake';
      }
      else if (mailJSON.Subject.match(/Monitor/)) {
        monitorName = 'Uptime Robot';
      }

      record = {
        monitor: monitorName,
        projectName: projectName,
        status: status,
        date: date
      };

      var collectionName = monitorName.replace(' ', '_').toLowerCase();

      db.collection(collectionName).insert(record, function(err,result) {
        if (err){
          throw err;
        }
        console.log('databased : ' + monitorName + ': ' + projectName + ': ' + status + ': ' + date);
      });

    } else {
      console.log("Invalid email");
    }
  });
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
  console.log("Listening on " + port);
});
