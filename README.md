# get-sauce-results

  Download debugging information about a sauce labs job

## Installation

    $ npm install get-sauce-results

  or

    $ npm install get-sauce-results -g

## Usage

### Command Line

  To download all of a jobs assets into the current directory simply run:

    get-sauce-results user key jobID

### API

  To download all the jobs assets:

```javascript
var getSauceResults = require('get-sauce-results');

getSauceResults(user, key, jobID, write, function (err) {
  if (err) throw err;
  console.log('done');
});

function write(fileName, fileContentStream, callback) {
  var output = fs.createWriteStream(path.join(__dirname, 'output', fileName));

  fileContentStream.pipe(output);

  fileContentStream.on('error', cb);
  output.on('error', cb);

  output.on('close', function () {
    cb();
  });
}
```