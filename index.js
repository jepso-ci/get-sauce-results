var debug = require('debug')('get-sauce-results');
var request = require('request');

exports = module.exports = downloadAssets;
function downloadAssets(user, key, job, writeFile, callback) {
  getAssets(user, key, job, function (err, res) {
    if (err) return callback(err);

    var remaining = 0;
    Object.keys(res)
      .forEach(function (id) {
        var assets = typeof res[id] === 'string' ? [res[id]] : res[id];
        assets.forEach(function (asset) {
          remaining++;
          debug('GET: ' + asset);
          writeFile(asset, getAsset(user, key, job, asset), function (err) {
            if (err) return callback(err);
            debug('GOT: ' + asset);
            if (0 === --remaining) done();
          });
        });
      });
    if (remaining === 0) done();
    function done() {
      callback();
    }
  });
}

exports.getAssets = getAssets;
function getAssets(user, key, job, callback) {
  var url = 'https://saucelabs.com/rest/v1/' + user + '/jobs/' + job + '/assets'
  return request({
    url: url,
    auth: {user: user, pass: key}
  }, function (err, res, body) {
    if (err) return callback(err);
    if (res.statusCode != 200) return callback(new Error('Server responded with status code ' + res.statusCode));
    var res;
    try {
      res = JSON.parse(body.toString());
    } catch (ex) {
      return callback(ex);
    }
    return callback(null, res);
  });
}

exports.getAsset = getAsset;
function getAsset(user, key, job, asset) {
  var url = 'https://saucelabs.com/rest/' + user + '/jobs/' + job + '/results/' + asset;
  return request({
    url: url,
    auth: {user: user, pass: key}
  });
}