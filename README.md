<img src="http://i.imgur.com/GoaISmM.png" align="right" />
# get-sauce-results
[![Dependency Status](https://gemnasium.com/jepso-ci/get-sauce-results.png)](https://gemnasium.com/jepso-ci/get-sauce-results)

  Download debugging information about a sauce labs job

## Installation

    $ npm install get-sauce-results

  or

    $ npm install get-sauce-results -g

## Usage

### Command Line

To download all of a jobs assets into the current directory simply run:

```console
$ get-sauce-results user key jobID
```

Example:

```console
$ get-sauce-results sauce-runner c71a5c75-7c28-483f-9053-56da13b40bc2 2f175cb6900a479a8ef45d13d2b14807
log.json
video.flv
selenium-server.log
0000screenshot.png
0001screenshot.png
0002screenshot.png
0003screenshot.png
```

### API

All streams are node 0.10 or higher style streams (using readable-stream for backwards compatibility).  They are also wrapped with the aditional [barrage](https://npmjs.org/package/barrage) API which provides `syphon`, `buffer` and `wait`.

Basic Example:

```js
var barrage = require('barrage')
var fs = require('fs')
var getResults = require('get-sauce-results')

function download(user, key, job, destinationFolder) {
  var source = getResults(user, key, job)
  var dest = new barrage.Writable({objectMode: true})
  dest._write = function (entry, _, callback) {
    entry.read()
         .syphon(barrage(fs.createWriteStream(path.join(destinationFolder, entry.path))))
         .wait(callback)
  }
  source.syphon(dest)
  return dest.wait(callback)
}
```

#### getSauceResults(user, key, job) => stream

Returns a stream of objects, each with a `path` property which contains the file name of the asset and a `read` method, which returns a stream for the binary data of the file.

#### getSauceResults.getAssets(user, key, job, callback(err, res))

Call the callback with an object mapping names onto assets

#### getSauceResults.getAsset(user, key, job, assetPath) => stream

Return a binary stream for a given asset.