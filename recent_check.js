var async = require('async');
var db = require('mongoskin').db('mongodb://localhost:27017/local');
var statuscake = db.collection('statuscake');
var uptime = db.collection('uptime_robot');

module.exports.process = function(projectName,callback) {

  async.waterfall([

    //Get data from mongodb
    function(wcb){
      async.parallel({
        uptimeRobot: function(pcb){
          uptime.find( { projectName: projectName }).sort( { _id : -1 } ).limit(1).toArray(function(err, result){
            if(err){
              console.log(err);
            } else if(result && result instanceof Array && result.length > 0){
              console.log(result);
              pcb(null, result[0]);
            }else{
              pcb(null, null);
            }
          });
        },
        statusCake: function(pcb){
          statuscake.find( { projectName: projectName } ).sort( { _id : -1 } ).limit(1).toArray(function(err, result){
            if(err){
              console.log(err);
            } else if(result && result instanceof Array && result.length > 0){
              console.log(result);
              pcb(null, result[0]);
            }else{
              pcb(null, null);
            }
          });
        }
      },wcb)
    },

    //process data from mongodb
    function(result, wcb){
      if (result && result.uptimeRobot && result.statusCake) {
        console.log('Robot update: ' + result.uptimeRobot.status);
        console.log('Cake update: ' + result.statusCake.status);

        if ( result.uptimeRobot.status.toLowerCase() === 'down' && result.statusCake.status.toLowerCase() === 'down') {
          wcb(null, true);
        } else {
          wcb(null, false);
        }
      } else {
        wcb(null, false);
      }
    },

    //send email to pagerduty
    function(shouldSendEmail, wcb){
      if (shouldSendEmail) {
        var postmark = require("postmark")("APIKEY");
        postmark.send({
          "From": "andre@generalui.com",
          "To": "andre@generalui.com",
          "Subject": "Project: " + projectName + " is down.",
          "TextBody": "Project: " + projectName + " is down."
        }, function(error, success) {
          if(error) {
              console.error("Unable to send via postmark: " + error.message);
          }
          console.info("Sent to postmark for delivery");
          wcb(error);
        });
      } else {
        wcb(null);
      }
    }

  ], function(error){
    callback(error);
  });


};
