var winston = require('winston'),
    path = require('path'),
    transports = [];





var LoggerService = function () {


    transports.push(new winston.transports.File({
        timestamp: function () {
            var d = new Date();


            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();

        },
        name: 'file',
        //datePattern: '.yyyy-MM-ddTHH',
        filename: path.join(__dirname, "logs", "trace.log"),
        maxsize: 10000000,
        maxFiles: 3,
    }));

    var logger = new winston.Logger({
        transports: transports
    });





    var self = this;

    self.log = function (message, metaData) {



        logger.info(message, {
            data: metaData
        });

    };


    return self;

};

module.exports = LoggerService;
