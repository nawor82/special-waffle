


var monitorSetup = require('./config/monitorSetup');
var MonitorRun = require('./controllers/monitorRun');

var monitor = new MonitorRun(monitorSetup);

monitor.firstRun();
monitor.IntervalRun();
