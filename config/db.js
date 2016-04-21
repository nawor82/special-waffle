module.exports = {
    db: {
        server: "127.0.0.1",
        database: "<db name>",
        user: "<user>",
        password: "<password>",
        port: 1433,
        requestTimeout: 90000,
        queryToRun: "exec Momentum.dbo.p_CheckFailedJobsForToday_Monitor"
    }
};
