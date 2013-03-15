var debug = require('debug')('get-sauce-results');
var request = require('hyperquest');
var concat = require('concat-stream');
var url = require('url');

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
  var path = '/rest/v1/' + user + '/jobs/' + job + '/assets'
  var done = false;
  var req = request(format(path, user, key));
  req.on('response', function (res) {
    if (done) return;
    if (res.statusCode != 200) {
      done = true;
      return callback(new Error('Server responded with status code ' + res.statusCode));
    }
  });
  req.pipe(concat(function (err, body) {
    if (done) return;
    done = true;
    if (err) return callback(err);
    var res;
    try {
      res = JSON.parse(body.toString());
    } catch (ex) {
      return callback(ex);
    }
    return callback(null, res);
  }));
}

exports.getAsset = getAsset;
function getAsset(user, key, job, asset) {
  var path = '/rest/' + user + '/jobs/' + job + '/results/' + asset;
  return request(format(path, user, key));
}

function format(path, user, pass) {
  return url.format({
    protocol: 'https',
    host: 'saucelabs.com',
    pathname: path,
    auth: user + ':' + pass
  });
}