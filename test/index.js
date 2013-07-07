'use strict'

var fs = require('fs')
var rm = require('rimraf').sync
var barrage = require('barrage')
var sha = require('sha')
var getResults = require('../')

before(function () {
  try {
    fs.mkdirSync(__dirname + '/output')
  } catch (ex) {
    if (ex.code !== 'EEXIST') throw ex
  }
})
after(function () {
  rm(__dirname + '/output')
})

describe('getResults(user, key, job)', function () {
  it('returns a readable stream of the form `{path: string, read: () -> stream}`', function (done) {
    this.timeout(30000)
    var source = getResults('sauce-runner', 'c71a5c75-7c28-483f-9053-56da13b40bc2', '2f175cb6900a479a8ef45d13d2b14807')
    var dest = new barrage.Writable({objectMode: true})
    dest._write = function (entry, _, callback) {
      barrage(entry.read().syphon(fs.createWriteStream(__dirname + '/output/' + entry.path))).wait(callback)
    }
    source.syphon(dest).wait()
      .then(function () {
        function output(name) {
          sha.checkSync(__dirname + '/output/' + name, sha.getSync(__dirname + '/fixtures/output/' + name))
        }
        output('0000screenshot.png')
        output('0001screenshot.png')
        output('0002screenshot.png')
        output('0003screenshot.png')
        output('log.json')
        output('selenium-server.log')
        output('video.flv')
      })
      .nodeify(done)
  })
})
