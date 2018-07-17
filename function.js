var finalhandler = require('finalhandler')
var Router       = require('router')
var router       = Router()

router.get('/users', (req, res) => {
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
            }
        }
    };

    res.json(userSchema, [
        {rel: "self", method: "GET", href: "/users/"},
        {rel: "create", method: "POST", title: "Create User", href: "/users/"},
    ]);
});

exports.helloWorld = (req, res) => {
  router(req, res, finalhandler(req, res));
  // let message = req.query.message || req.body.message || 'Hello World!';
  // res.status(200).send(message);
};
