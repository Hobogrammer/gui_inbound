var db = require('mongoskin').db('mongodb://localhost:27017/local');
var statuscake = db.collection('statuscake');
var uptime = db.collection('uptime_robot');

module.exports.process = function(projectName) {
  var last_robot = db.uptime.find( { projectName: projectName }).sort( { _id : -1 } ).limit(1); //grabs last record from the table
  var last_cake = db.statuscake.find( { projectName: projectName } ).sort( { _id : -1 } ).limit(1);


};


function statusCheck(robot, cake) {

}

function email() {

}
