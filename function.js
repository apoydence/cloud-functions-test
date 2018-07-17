var finalhandler = require('finalhandler')
var Router       = require('router')
var router       = Router()
var util         = require('util')

const pg = require('pg');

const connectionName = process.env.CONN_NAME;
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME
const pool = new pg.Pool({
    max: 1,
    host: '/cloudsql/' + connectionName,
    user: dbUser,
    password: dbPass,
    database: dbName
});

router.get('/users', (req, res) => {
    pool.query('SELECT id,username,sec_level FROM user_values', (err, results) => { if (err) {
            console.log(err);
            res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
            return;
        }

        let users = results.rows.map(row=> {
            return {
              id: row.id,
              username: row.username,
              sec_level: row.sec_level,
              links: [
                  {rel: "self", method: "GET", href: "/users/"+row.id},
              ],
            }
        });

        var userSchema = {
            "name": "user",
            "description": "This JSON Schema defines the paramaters required to create a user",
            "properties": {
                "username": {
                    "title": "Username",
                    "description": "Please enter a username",
                    "type": "string",
                    "maxLength": 30,
                    "minLength": 1,
                    "required": true
                },
                "password": {
                    "title": "Password",
                    "description": "Please enter a password",
                    "type": "string",
                    "maxLength": 30,
                    "minLength": 8,
                    "required": true
                },
                "sec_level": {
                    "title": "Security Level",
                    "description": "Please enter a security level. It must be >= 0. Lower is less privileged.",
                    "type": "int"
                },
            },
            links: [
                {rel: "self", method: "GET", href: "/users/"},
                {rel: "create", method: "POST", title: "Create User", href: "/users/"},
            ],
            users: users,
        };

        res.status(200).send(JSON.stringify(userSchema));
    });
});

router.param('user_id', (req, res, next, idStr) => {
    let id = parseInt(idStr);
    if (isNaN(id)){
        next(new Error('user id must be an integer'));
        return;
    }

    req.user_id=id;
    next();
});

router.post('/users/', (req, res) => {
    if (!req.body.username){
        res.status(400).send(JSON.stringify({"error": "missing username"}));
        return;
    }

    if (!req.body.password){
        res.status(400).send(JSON.stringify({"error": "missing password"}));
        return;
    }

    res.status(201).end();

    // let query = util.format('INSERT INTO user_values (username,password) VALUES ("%s","%s")', req.user_id);

    // pool.query(query, (err, results) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
    //         return;
    //     }

    //     res.status(204).end();
    // });
});


router.get('/users/:user_id', (req, res) => {
    let query = util.format('SELECT id,username,sec_level FROM user_values where id=%d LIMIT 1', req.user_id);

    pool.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
            return;
        }

        if (results.rows.length == 0) {
            res.status(404).send(JSON.stringify({"error":"unknown user id", id:req.user_id}));
            return;
        }

        res.status(200).send(JSON.stringify({
            id: req.user_id,
            username: results.rows[0].username,
            sec_level: results.rows[0].sec_level,
            links: [
                {rel: "self", method: "GET", href: "/users/"+req.user_id},
                {rel: "delete", method: "DELETE", title: "Delete User", href: "/users/"+req.user_id},
            ],
        }));
    });
});

router.delete('/users/:user_id', (req, res) => {
    let query = util.format('DELETE FROM user_values where id=%d', req.user_id);

    pool.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
            return;
        }

        res.status(204).end();
    });
});

exports.users = (req, res) => {
    console.log("!!!", req.body);
    req.body=Object.keys(req.body)[0];
    console.log("!!!", req.body);
    router(req, res, finalhandler(req, res));
};
