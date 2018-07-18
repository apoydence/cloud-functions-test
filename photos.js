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

router.get('/', (req, res) => {
    console.log("SERVING PHOTO ROOT");
    pool.query('SELECT id,name FROM photos', (err, results) => {
        console.log("QUERY RESULTS", err, results);
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

        console.log("POST MAP", photos);

        res.status(200).json({
            photos:photos,
            links: [
                {rel: "self", method: "GET", href: "/"},
            ],
        });
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
