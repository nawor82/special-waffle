var sql = require('mssql');
var dbConfig = require('../config/db');
var smtpConfig = require('../config/smtp');
var monitorSetup = require('../config/monitorSetup');
var LoggerService = require('../services/LoggerService');

var nodemailer = require('nodemailer');
var Monitor = require('../controllers/monitor');
var conn = new sql.Connection(dbConfig.db);
var transporter = nodemailer.createTransport(smtpConfig.smtpPrimary);
var mon = new Monitor(dbConfig.db, transporter);

//config//////////////////////////////////////////




//////////////////////////////////////////////////

var MonitorRunResult = function() {
    var result = {
        hasRun: false,
        message: "",
        data: null
    };

    return result;

};


var MonitorRun = function(setup) {

    var runOnDays = setup.runOnDays;
    var startTimeHour = setup.startTimeHour;
    var endTimeHour = setup.endTimeHour;
    var monitorIntervalInMinutes = setup.monitorIntervalInMinutes;
    var numberOfFailureTolerance = setup.numberOfFailureTolerance;
    var loggerService = new LoggerService();

    self = this;


    var dateAndTime = function() {
        var d_ = new Date();
        return d_.toLocaleDateString() + ' ' + d_.toLocaleTimeString();
    };


    self.checkIfMonitorMustRun = function() {

        var dt = new Date();
        var ds = dt.toString();
        var currentHour_ = dt.getHours();
        var today_ = ds.substring(0, 3).toUpperCase();
        
            
        return runOnDays.indexOf(today_) !== -1 && currentHour_ >= startTimeHour && currentHour_ <= endTimeHour;


    };

    var Run = function(next) {
        var monRunResult = new MonitorRunResult();


        if (self.checkIfMonitorMustRun()) {
            return mon.MonitorJobsAndNotify(numberOfFailureTolerance).then(function(data) {

                loggerService.log("", data);

                next(data);


            });
        } else {
            monRunResult.hasRun = false;
            monRunResult.message = "Interval setup has prohibited the monitor from running";
            loggerService.log("", monRunResult);
            next(monRunResult);
        }


    };

    self.firstRun = function() {




        //First Run
        console.log('[Initial Run] -> ' + dateAndTime());

        Run(function(result) {
            console.log(result);

        });



    };


    self.IntervalRun = function() {

        //Interval///
        setInterval(function() {
            console.log('[IntervalRun Run] -> ' + dateAndTime());
            Run(function(result) {
                console.log(result);

            });
        }, monitorIntervalInMinutes * 60 * 1000);




    };



    return self;


};
module.exports = MonitorRun;
