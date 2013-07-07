#!/usr/bin/env node

'use strict'

var join = require('path').join
var fs = require('fs')
var barrage = require('barrage')
var getResults = require('../')


var user = process.argv[2];
var key = process.argv[3];
var job = process.argv[4];

if (!(user && key && job)) {
  console.log('USAGE:')
  console.log('  get-sauce-results user key job')
  process.exit(1)
}

var source = getResults(user, key, job)
var dest = new barrage.Writable({objectMode: true})
dest._write = function (entry, _, callback) {
  console.log(entry.path)
  barrage(entry.read().syphon(fs.createWriteStream(entry.path))).wait(callback)
}
source.syphon(dest).wait().done()