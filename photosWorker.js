var util = require('util')

exports.photosCreate = (event, callback) => {
    console.log(util.format("File %s has been added", event.data.name));
    callback();
};

exports.photosDelete = (event, callback) => {
    console.log(util.format("File %s has been deleted", event.data.name));
    callback();
};
