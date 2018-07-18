
const bucketName = process.env.BUCKET_NAME;

exports.photos = (req, res) => {
    const Storage = require('@google-cloud/storage');

    // Creates a client
    const storage = new Storage();

    storage
        .bucket(bucketName)
        .getFiles()
        .then(results => {
             const files = results[0];
             res.status(200).json({
                 "photos": files.map(f=>f.name),
             });
        })
        .catch(err => {
             console.error(err);
             res.status(500).json({error:"failed to read bucket"});
        });
};
