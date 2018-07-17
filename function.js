/**
 *  * Responds to any HTTP request.
 *   *
 *    * @param {!Object} req HTTP request context.
 *     * @param {!Object} res HTTP response context.
 *      */
exports.helloWorld = (req, res) => {
      let message = req.query.message || req.body.message || 'Hello World!';
      res.status(200).send(message);
};

const pg = require('pg');

const connectionName = process.env.CONN_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const pool = new pg.Pool({
    max: 1,
    host: '/cloudsql/' + connectionName,
    user: dbUser,
    password: dbPass,
    database: dbName
});

exports.cloudSQLTest = function cloudSQLTest(event, callback) {
    pool.query('SELECT NOW() as now', (error, results) => {
      callback(error, results);
    });
};
