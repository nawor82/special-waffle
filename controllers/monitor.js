var sql = require('mssql'),
    nodemailer = require('nodemailer'),
    sql = require('mssql'),
    dbConfig = require('../config/db'),
    smtpConfig = require('../config/smtp'),
    mailOptions = require('../config/mailOptions'),
    _ = require('lodash'),
    monitorSetup = require('../config/monitorSetup');


var MonitorResult = function(args) {

    var result = {
        connectedToServer: false,
        success: false,
        message: null,
        jobs: {},
        notificationSent: false
    };

    return result;
};
var MonitorAndNotifyResult = function() {

    var result = {
        connectedToServer: false,
        failedJobsFound: false,
        notificationsSent: false,
        message: null,
        numberOfFailuresFound: 0

    };


};

var Monitor = function(dbConfig, smtp) {

    // var _conn = conn;
    var _dbConfig = dbConfig;
    var _sqlToExecute = _dbConfig.queryToRun;
    var _smtp = smtp;

    var self = this;
    var overallResult = new MonitorAndNotifyResult();


    self.sendNotificationsUsingPromise = function(jobs, notificationTolerance) {

        // console.log(jobs);

        var notifyResult = {}; //new NotificationResult();


        notifyResult.message = "";
        notifyResult.notificationSent = false;
        var a_ = [];
        var i = 0;


        if (jobs.length === 0) {
            return a_;
        }


        if (jobs.length >= notificationTolerance) {
            var d = new Date();
            var date_ = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
            var noOfFailures = jobs.length;

            jobs = [{
                Name: noOfFailures + ' Job(s) have /',
                DateRun: date_,
                Message: 'Please check the SQL Server for issues'
            }];
        }

        _(jobs).each(function(job) {


            var error_ = null;
            var item = _smtp.sendMail(mailOptions.getOptionsForJobFailures(job).adminUsersJobFailures)
                .then(function(info) {

                    notifyResult = {};
                    // console.log(info);
                    notifyResult.message = "Messages sent";
                    notifyResult.notificationSent = true;
                    notifyResult.job = job;
                    return notifyResult;

                }).catch(function(err) {

                    notifyResult = {};
                    notifyResult.message = err;
                    notifyResult.notificationSent = false;
                    notifyResult.job = job;
                    return notifyResult;
                });

            a_[i] = item;
            i++;

            //console.log(t);
        });

        return a_;





    };
    self.MonitorJobsAndNotify = function(notificationTolerance) {
        return self.MonitorJobs().then(function(monitorResult) {
            overallResult.connectedToServer = monitorResult.connectedToServer;
            overallResult.message = monitorResult.message;
            // console.log(monitorResult);
            if (monitorResult.success && monitorResult.jobs.length !== 0) {
                overallResult.failedJobsFound = true;
                overallResult.numberOfFailuresFound = monitorResult.jobs.length;
                var t = self.sendNotificationsUsingPromise(monitorResult.jobs, notificationTolerance);

                return Promise.all(t).then(function(data) {
                    //  console.log(data);
                    overallResult.notificationsSent = data[0].notificationSent;
                    return overallResult;
                });

            } else if (monitorResult.success && monitorResult.jobs.length === 0) {
                overallResult.failedJobsFound = false;
                overallResult.numberOfFailuresFound = monitorResult.jobs.length;
                return overallResult;
            } else {
                // console.log(monitorResult.message);
                overallResult.failedJobsFound = false;
                overallResult.notificationsSent = false;
                return overallResult;
            }
        });
    };
    self.MonitorJobs = function() {

        var _conn = new sql.Connection(_dbConfig);

        var monResult = new MonitorResult();
        // console.log('Connecting to the server...')
        //return self.connectToServer().then(function () {
        return _conn.connect().then(function() {
            //    console.log('Successfully connected to the server.')
            var req = new sql.Request(_conn);
            return req.query(_sqlToExecute).then(function(results) {


                _conn.close();

                if (results.length > 0) {
                    monResult = {
                        connectedToServer: true,
                        success: true,
                        message: "Successfully found jobs that failed",
                        jobs: results
                    };
                } else {

                    monResult = {

                        connectedToServer: true,
                        success: true,
                        message: "No new job failures have been found",
                        jobs: results
                    };

                }



                return monResult;


            })

                .catch(function(err) {
                    //console.log("Query db for failed Jobs error: " + err);
                    _conn.close();
                    monResult = {
                        connectedToServer: true,
                        success: false,
                        message: err,
                        jobs: null,
                    };

                    return monResult;

                });
        })
            .catch(function(err) {
                //failureToConnectToServer();
                // console.log("Connection Error: " + err);
                _conn.close();
                monResult = {
                    connectedToServer: false,
                    success: false,
                    message: err,
                    jobs: null,
                };
                // throw new Error(monResult);
                self.failureToConnectToServer(function(err, result) {
                    console.log(result);              
                  });
                return monResult;

            });
    };
    self.failureToConnectToServer = function(next) {

        _smtp.sendMail(mailOptions.getOptionsForConnectionErrors().adminUsersServerConnectionError, function(error, info) {

            var result = {};
            //            console.log(info);
            //          console.log(error);

            if (error) {
                result.success = false;
                result.info = error;
            } else {

                result.success = true;
                result.info = info;
            }
            next(error, result);

        });

    };

    return self;
};

module.exports = Monitor;
