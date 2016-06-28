
var isType = require('isType');
var globby = require('globby');
var exec = require('exec');
var git = require('git-utils');
var fs = require('io/sync');

if (!isType(args[0], String)) {
  throw TypeError('Must provide a branch name!');
}

log.moat(1);
log.gray('Merging...');
log.moat(1);

module.exports = git.mergeBranch({
  modulePath: cwd,
  fromBranch: args[0],
})

.then(function() {

  var ignoredPatterns = [
    'packager', // Use 'react-packager' module instead.
    'Libraries/Animated', // Use 'Animated' module instead.
    'README.md',
    'CONTRIBUTING.md',
    'Releases.md',
    'breaking-changes.md',
    'npm-shrinkwrap.json',
    'circle.yml',
    '.travis.yml',
    'docs',
    'website',
    'Examples',
    'jestSupport',
    '**/*/__tests__',
    '**/*/__mocks__',
  ];

  ignoredPatterns.forEach(function(pattern) {
    globby.sync(pattern).forEach(function(path) {
      exec('git rm -rf ' + path, { cwd: cwd })
      .then(function() {
        log.moat(1);
        log.white('Ignored path: ');
        log.yellow(path);
        log.moat(1);
      });
    });
  });
});
