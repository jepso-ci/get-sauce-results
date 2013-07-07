'use strict'

var request = require('request')
var barrage = require('barrage')
var Readable = barrage.Readable

exports = module.exports = downloadAssets
function downloadAssets(user, key, job) {
  var stream = new Readable({objectMode: true})
  var reading = false
  var assets = null
  stream._read = function () {
    if (reading) return
    reading = true
    if (!assets) {
      getAssets(user, key, job, function (err, res) {
        if (err) return stream.emit('error', err), stream.push(null)

        var remaining = 0;
        assets = Object.keys(res)
          .map(function (id) {
            return typeof res[id] === 'string' ? [res[id]] : res[id]
          })
          .reduce(function (acc, res) {
            return acc.concat(res)
          }, [])
          .reverse()
        reading = false
        stream._read()
      });
    } else if (assets.length === 0) {
      stream.push(null)
    } else {
      var asset = assets.pop()
      var cont = stream.push({
        path: asset,
        read: function () { return getAsset(user, key, job, asset) }
      })
      reading = false
      if (cont) stream._read()
    }
  }
  return stream
}

exports.getAssets = getAssets;
function getAssets(user, key, job, callback) {
  var url = 'https://saucelabs.com/rest/v1/' + user + '/jobs/' + job + '/assets'
  return request({
    url: url,
    auth: {user: user, pass: key}
  }, function (err, res, body) {
    if (err) return callback(err)
    if (res.statusCode != 200) return callback(new Error('Server responded with status code ' + res.statusCode))
    var res
    try {
      res = JSON.parse(body.toString())
    } catch (ex) {
      return callback(ex)
    }
    return callback(null, res)
  })
}

exports.getAsset = getAsset;
function getAsset(user, key, job, asset) {
  var url = 'https://saucelabs.com/rest/' + user + '/jobs/' + job + '/results/' + asset
  return barrage(request({
    url: url,
    auth: {user: user, pass: key}
  }))
}