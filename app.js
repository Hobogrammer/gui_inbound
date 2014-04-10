var db = require('mongoskin').db('mongodb://localhost:27017/local');
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var recentCheck = require('./recent_check');

app.use(logfmt.requestLogger());

app.post('/inbound', function(req, res) {
  var incomingMail = '';
  var date = Date.now();

  req.on('data', function(data){
    incomingMail += data;
  });

  req.on('end', function(){
    var mailJSON = JSON.parse(incomingMail);

    if (mailJSON.Subject.match(/\[General UI\] "Production Support"/)) {
      var status = mailJSON.Subject.toLowerCase().match(/\s+(down)\s*/) ? "down" : "up";
      var projectName = '';
      var monitorName = '';

      if (mailJSON.Subject.match(/Your Site:/)) {
        monitorName = 'StatusCake';
        projectName = mailJSON.Subject.match(/Site: (.*?) Is/)[1];

      }
      else if (mailJSON.Subject.match(/Monitor/)) {
        monitorName = 'Uptime Robot';
        projectName = mailJSON.Subject.match(/: (RM .+)/)[1];
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
          res.send(err);
        }else{
            console.log('databased : ' + monitorName + ': ' + projectName + ': ' + status + ': ' + date);

            recentCheck.process(projectName,function(err){
              if (err){
                console.log(err);
              }
              res.send('finished');
          });

        }
      });

    } else {
      res.send("Invalid email");
    }
  });
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
  console.log("Listening on " + port);
});
