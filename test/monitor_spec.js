var should = require('should');
var Monitor = require('../controllers/monitor');
var MonitorRun = require('../controllers/monitorRun');
var sql = require('mssql');
var dbConfig = require('../config/db');
var smtpConfig = require('../config/smtp');
var nodemailer = require('nodemailer');
var stubTransport = require('nodemailer-stub-transport');
var chai = require('chai');
var expect = chai.expect;
var assert = require('assert');

describe("SQL Server Job Monitor", function () {


    var getJobsThatFailed;

    function getJobsThatFailedMock() {
        var sinon = require('sinon');
        var sinonStubPromise = require('sinon-stub-promise');
        sinonStubPromise(sinon);
        getJobsThatFailed = sinon.stub().returnsPromise();
        getJobsThatFailed.resolves({
            success: true,
            message: 'Successfully found jobs that failed',
            jobs: [{
                    Name: 'ITX00002',
                    DateRun: '02 Mar 2016 05:00:00:000',
                    Message: 'Executed as user: MARIUS\\SYSTEM. Microsoft (R) SQL Server Execute Package Utility  Version 10.50.4000.0 for 64-bit...'
                },
                {
                    Name: 'TST00001',
                    DateRun: '16 Mar 2016 23:30:58:800',
                    Message: 'This is a test message of a job failure 01'
                },
                {
                    Name: 'TST00002',
                    DateRun: '16 Mar 2016 23:30:58:800',
                    Message: 'This is a test message of a job failure 02'
                }]
        });

    };


    var mon = {};





    describe("Check for failed Jobs and Send Notifications", function () {

        var sinon, stubTrans, transport, wrongConnection, rightConnection, conn, result01, result02, result03, result04, result05, result06, result07, result08, mon, spy;


        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            wrongConnection = {
                server: "10.1.24.244",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            //conn = new sql.Connection(wrongConnection);
            mon = new Monitor(wrongConnection, "SQL", transport);
            result01 = mon.MonitorJobsAndNotify();
        });

        it("When no connection is made to server", function () {


            return result01.then(function (data) {
                //console.log(data);
                data.connectedToServer.should.equal(false);
            });

        })

        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans({
                error: new Error('Mail Server could not be reached')
            }));
            rightConnection = {
                server: "10.1.24.244",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor", transport);

            spy = sinon.spy(mon, "failureToConnectToServer");
            result07 = mon.MonitorJobs();


        });

        it("When no connection is made to server - Notification Sent", function () {


            return result07.then(function (data) {
                assert(spy.called);

            })

        });


        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            //conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "SQL", transport);

            result02 = mon.MonitorJobsAndNotify();
        });

        it("when connection to server is made", function () {


            return result02.then(function (data) {
                data.connectedToServer.should.equal(true);
            });

        });


        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            // conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "SQL", transport);

            result03 = mon.MonitorJobsAndNotify();
        });

        it("when connection to server is made, but the query was faulty", function () {


            return result03.then(function (data) {
                data.connectedToServer.should.equal(true);
                data.failedJobsFound.should.equal(false);

            });

        });

        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            // conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor_NoResultsTest", transport);

            result04 = mon.MonitorJobsAndNotify();
        });

        it("when connection to server is made and query returns no results", function () {



            return result04.then(function (data) {

                data.connectedToServer.should.equal(true);
                data.failedJobsFound.should.equal(false);

            });

        });

        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            //conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor", transport);

            result08 = mon.MonitorJobsAndNotify();
        });

        it("when connection to server is made and query returns results", function () {


            return result08.then(function (data) {
                data.connectedToServer.should.equal(true);
                data.failedJobsFound.should.equal(true);

            });

        });


        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans());
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            //  conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor", transport);

            result05 = mon.MonitorJobsAndNotify();
        });

        it("failed jobs are found and notifactions have been sent", function () {


            return result05.then(function (data) {
                data.connectedToServer.should.equal(true);
                data.failedJobsFound.should.equal(true);
                data.notificationsSent.should.equal(true);

            });

        });

        before(function () {

            sinon = require('sinon');
            //arrange
            stubTrans = require('nodemailer-stub-transport');
            transport = nodemailer.createTransport(stubTrans({
                error: new Error('Mail Server could not be reached')
            }));
            rightConnection = {
                server: "10.1.24.243",
                database: "momentum",
                user: "keyrisk",
                password: "3l3ctr1c@@01",
                port: 1433,
                requestTimeout: 90000
            };
            //conn = new sql.Connection(rightConnection);
            mon = new Monitor(rightConnection, "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor", transport);

            result06 = mon.MonitorJobsAndNotify();
        });

        it("failed jobs are found and notifactions have NOT been sent", function () {


            return result06.then(function (data) {
                data.connectedToServer.should.equal(true);
                data.failedJobsFound.should.equal(true);
                data.notificationsSent.should.equal(false);

            });

        });




    });


    var monRun01 = {};
    var monRun02 = {};
    var monRun03 = {};
    var monRun04 = {};
    describe("Run Monitor during times that have been set up", function () {

        before(function () {

            var mockSetup = {

                runOnDays: ['TUE'],
                startTimeHour: 6,
                endTimeHour: 20,
                monitorIntervalInMinutes: 1

            };

            monRun01 = new MonitorRun(mockSetup);

        });
        it("must run during runOnDays[]", function () {


            var mustRun01 = monRun01.checkIfMonitorMustRun();
            mustRun01.should.be.equal(true);

        });


        before(function () {

            var mockSetup = {

                runOnDays: ['WED'],
                startTimeHour: 6,
                endTimeHour: 20,
                monitorIntervalInMinutes: 1

            };

            monRun02 = new MonitorRun(mockSetup);

        });
        it("must NOT run during doNotRunDays[]", function () {


            var mustRun02 = monRun02.checkIfMonitorMustRun();
            mustRun02.should.be.equal(false);

        });


        before(function () {

            var mockSetup = {

                runOnDays: ['TUE'],
                startTimeHour: 6,
                endTimeHour: 20,
                monitorIntervalInMinutes: 1

            };

            monRun03 = new MonitorRun(mockSetup);

        });
        it("must run on days in runOnDays[] and between specified hours of the day", function () {


            var mustRun03 = monRun03.checkIfMonitorMustRun();
            mustRun03.should.be.equal(true);

        });

        before(function () {

            var mockSetup = {

                runOnDays: ['TUE'],
                startTimeHour: 21,
                endTimeHour: 22,
                monitorIntervalInMinutes: 1

            };

            monRun04 = new MonitorRun(mockSetup);

        });
        it("must NOT run when startTimeHour and endTimeHour NOT between specified hours of the day", function () {


            var mustRun04 = monRun04.checkIfMonitorMustRun();
            mustRun04.should.be.equal(false);

        });


    })




});
