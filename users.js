var express = require('express'),
    app = express(),
    hateoasLinker = require('express-hateoas-links');

app.use(hateoasLinker);

app.get('/users', (req, res) => {
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

app.listen(3000, function() {
    console.log("listening");
});
