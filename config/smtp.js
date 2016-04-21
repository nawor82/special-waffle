module.exports = {

    smtpPrimary: {
        host: '0.0.0.0',
        port: 25,
        secure: false // use SSL
            // auth: {
            //     user: 'user@gmail.com',
            //     pass: 'pass'
            // }
    },
    smtpSecondary: {
        service: 'Gmail',
        // auth: {
            //     user: 'user@gmail.com',
            //     pass: 'pass'
            // }
    }
};
