exports.getOptionsForJobFailures = function (data) {

    return {

        adminUsersJobFailures: {
            // setup e-mail data with unicode symbols

            from: 'Kr1s SQL Job Monitor<Kr1sSqlJobMonitor@romoro.co.za>',
            to: 'support@romoro.co.za',
            subject: data.Name + " has failed - Run time: " + data.DateRun,
            text: data.Message
                //            html: '<b>Hello world 🐴</b>' // html body

        }

    };
};


exports.getOptionsForConnectionErrors = function () {
    return {
        adminUsersServerConnectionError: {
            // setup e-mail data with unicode symbols

            from: 'Kr1s SQL Job Monitor<Kr1sSqlJobMonitor@romoro.co.za>',
            to: 'rowan@romoro.co.za',
            subject: "Kr1s SQL Job Monitor is unable to connect to the Server.",
            text: ""
                //            html: '<b>Hello world 🐴</b>' // html body

        }
    };
};
