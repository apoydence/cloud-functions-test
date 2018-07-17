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

router.use((req, res, next) => {
    if (!req.headers || !req.headers.authorization){
        next();
        return;
    }

    let parts = req.headers.authorization.split(/[ ,]+/)
    if (parts.length != 2 || parts[0] != "Basic") {
        next();
        return;
    }

    parts = Buffer.from(parts[1], 'base64').toString('ascii').split(':');
    if (parts.length != 2) {
        next();
        return;
    }

    req.username=parts[0];
    req.password=parts[1];

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

    let query = util.format("INSERT INTO user_values (username,password) VALUES ('%s','%s')", req.body.username, req.body.password);

    pool.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
            return;
        }

        res.status(201).end();
    });
});


router.get('/users/:user_id', (req, res) => {
    let query = util.format('SELECT id,username,sec_level FROM user_values WHERE id=%d LIMIT 1', req.user_id);

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

function checkUser(req, onSuccess, onError){
    let query = util.format("SELECT id FROM user_values WHERE username='%s' AND password='%s' LIMIT 1", req.username, req.password);
    console.log("CHECK USER");

    pool.query(query, (err, results) => {
        console.log("GOT RESULT");
        if (err) {
            onError(err);
            return;
        }

        if (results.rows.length == 0) {
            onError(null);
            return;
        }

        onSuccess(results.rows[0].id);
    });
}

router.delete('/users/:user_id', (req, res) => {
    console.log("DELETE", req.username, req.password, checkUser);
    if (!req.username || !req.password) {
        res.status(401).end();
        return
    }
    console.log("GO DO IT", checkUser);

    checkUser(
        req,
        (id)=>{
            console.log("CHECK USER SUCC");
            if (id != req.user_id){
                res.status(400).json({"error":"mismatch in user ids"});
                return
            }

            let query = util.format('DELETE FROM user_values WHERE id=%d', id);

            pool.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
                    return;
                }

                res.status(204).end();
            });
        },
        (error) => {
            console.log("CHECK USER ERR", error);
            if (error){
                console.log(error);
            }

            res.status(401).end();
        }
    )
});

exports.users = (req, res) => {
    router(req, res, finalhandler(req, res));
};
