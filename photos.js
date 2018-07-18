var finalhandler = require('finalhandler')
var Router       = require('router')
var router       = Router()

router.use(require('./users').middleware);
router.use((req, res, next) => {
    if (!req.user) {
        res.status(401).end();
        return;
    }

    next();
});

router.get('/photos', (req, res) => {
    pool.query('SELECT id,name FROM photos', (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send(JSON.stringify({"error":"failed to make request to database"}));
            return;
        }

        let photos = results.rows.map(row=> {
            return {
              id: row.id,
              name: row.name,
              links: [
                  {rel: "self", method: "GET", href: "/photos/"+row.id},
              ],
            }
        });

        userSchema.photos=photos;
        res.status(200).send(JSON.stringify(userSchema));
    });
});

router.param('photo_id', (req, res, next, idStr) => {
    let id = parseInt(idStr);
    if (isNaN(id)){
        next(new Error('photo id must be an integer'));
        return;
    }

    req.photo_id=id;
    next();
});

exports.photos = (req, res) => {
    router(req, res, finalhandler(req, res));
};
