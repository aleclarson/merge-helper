
var isMatch = require('micromatch').isMatch;
var inArray = require('in-array');
var globby = require('globby');
var git = require('git-utils');
var fs = require('io/sync');

var renamedPaths = {
  'transformer.js': 'transform.js',
  'blacklist.js': 'src/utils/blacklist.js',
  'react-packager': '.', // Move the contents of "react-packager" into the root directory.
  'react-packager/rn-babelrc.json': '.babelrc',
  'react-packager/src/transforms': 'src/babel-plugins',
  'react-packager/src/DependencyResolver/Cache/lib': 'src/DependencyResolver/Cache',
  'react-packager/src/DependencyResolver/DependencyGraph': 'src/DependencyResolver',
  'react-packager/src/DependencyResolver/DependencyGraph/index.js': 'src/DependencyResolver/DependencyGraph.js',
  'react-packager/src/DependencyResolver/DependencyGraph/docblock.js': 'src/utils/docblock.js',
  'react-packager/src/DependencyResolver/FileWatcher': 'src/FileWatcher',
  'react-packager/src/DependencyResolver/lib': 'src/utils',
  'react-packager/src/lib': 'src/utils',
};

var deletedPatterns = [
  '**/*/__tests__/**/*',
  '**/*/__mocks__/**/*',
  'package.json',
  'packager.sh',
  'README.md',
  'babelRegisterOnly.js',
  'rn-cli.config.js',
  'react-native-xcode.sh',
  'launchPackager.command',
  'react-packager/src/DependencyResolver/AssetModule_DEPRECATED.js',
  'react-packager/src/DependencyResolver/DependencyGraph/DeprecatedAssetMap.js',
  'react-packager/src/DependencyResolver/DependencyGraph/DependencyGraphHelpers.js',
];

var state = {
  fromBranch: 'upstream',
  toBranch: null,
  changes: null,
};

var events = {
  'keep': function(path) {
    log.moat(1);
    log.white('keep ');
    log.green(path);
    log.moat(1);
  },
  'delete': function(path) {
    log.moat(1);
    log.white('delete ');
    log.red(path);
    log.moat(1);
  },
  'move': function(oldPath, newPath) {
    log.moat(1);
    log.white('move ');
    log.yellow(oldPath);
    log.moat(0);
    log.white('  to ');
    log.yellow(newPath);
    log.moat(1);
  }
};

module.exports = git.getCurrentBranch(cwd)

.then(function (currentBranch) {
  state.toBranch = currentBranch;

  log.moat(1);
  log.white('Merging ');
  log.yellow(state.fromBranch);
  log.white(' into ');
  log.yellow(state.toBranch);
  log.white('...');
  log.moat(1);

  // Change to the branch that will be merged in.
  return git.changeBranch(cwd, state.fromBranch);
})

.then(function () {

  // Get the changes that will be merged in.
  // NOTE: The changes must be squashed into a single commit!
  return git.diff(cwd, 'HEAD^')

  // Only keep changes from the "packager" directory.
  .then(function(changes) {
    var regex = /^packager\//;
    state.changes = changes.filter(function(change) {
      return regex.test(change.path);
    });
  });
})

.then(function () {

  log.moat(3);
  log.cyan('Deleting irrelevant "react-native" paths...');
  log.moat(1);
  log.plusIndent(2);

  var relevantPaths = [
    'packager',
    '.git',
  ];

  fs.readDir(cwd).forEach(function(filePath) {
    if (inArray(relevantPaths, filePath)) {
      return;
    }

    fs.remove(filePath);
    events.delete(filePath);
  });

  log.popIndent();
})

.then(function() {
  var root = 'packager/';

  log.moat(3);
  log.cyan('Scanning "packager" descendants...');
  log.moat(1);
  log.plusIndent(2);

  // Renaming directories must be done
  // after renaming/removing files.
  var renamedDirs = [];

  globby.sync(root + '**/*').forEach(function(filePath) {

    // Remove the leading root.
    filePath = filePath.slice(9);

    // Try renaming the file or directory.
    var renamedPath = renamedPaths[filePath];
    if (renamedPath) {

      // As stated above, renaming directories is a special case.
      if (fs.isDir(root + filePath)) {
        renamedDirs.unshift([ // We must use `unshift()` so child directories are renamed first.
          filePath,
          renamedPath,
        ]);
        return;
      }

      // NOTE: We don't use `fs.move()` here because it
      //       throws when a parent directory does not exist.
      fs.copy(root + filePath, root + renamedPath);
      fs.remove(root + filePath);

      events.move(filePath, renamedPath);
      return;
    }

    // Skip directories since `fs.remove()` automatically
    // deletes any empty parent directories of a deleted file.
    // Use glob patterns to delete whole directories!
    if (fs.isDir(root + filePath)) {
      return;
    }

    // Try removing the file.
    var index = -1;
    var length = deletedPatterns.length;
    while (++index < length) {
      if (isMatch(filePath, deletedPatterns[index])) {
        fs.remove(root + filePath);

        events.delete(filePath);
        return;
      }
    }

    events.keep(filePath);
  });

  renamedDirs.forEach(function(args) {
    var dirPath = root + args[0];
    var renamedPath = root;

    // Pass '' or '.' to copy the contents into the current directory.
    if (args[1] !== '.') {
      renamedPath += args[1];
    }

    // NOTE: We don't use `fs.move()` here because it
    //       throws if the destination is a non-empty directory.
    fs.copy(dirPath, renamedPath);
    fs.remove(dirPath);

    events.move(args[0], args[1]);
  });

  log.popIndent();
})

// Move the contents of "packager" into the current directory.
.then(function() {
  fs.copy('packager', cwd);
  fs.remove('packager');
})

.then(function() {
  log.moat(1);
  state.changes.forEach(function(change) {
    var color;
    switch (change.status) {
      case 'A':
        color = 'green';
        break;
      case 'M':
        color = 'yellow';
        break;
      case 'D':
        color = 'red';
        break;
      default:
        color = 'gray';
    }
    log[color](change.status, ' ');
    log.white(change.path);
    log.moat(0);
  });
  log.moat(1);
})
