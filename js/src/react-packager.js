var Random, fs, git, globby, inArray, isMatch, report, state, sync;

isMatch = require("micromatch").isMatch;

inArray = require("in-array");

Random = require("random");

globby = require("globby");

sync = require("sync");

git = require("git-utils");

fs = require("io/sync");

report = require("./utils/reporter");

state = {
  tempBranch: Random.id(),
  fromBranch: args[0] || "react-native",
  toBranch: null,
  changes: null
};

module.exports = git.getBranch(cwd).then(function(currentBranch) {
  state.toBranch = currentBranch;
  if (options.merge !== false) {
    log.moat(1);
    log.white("Merging ");
    log.yellow(state.fromBranch);
    log.white(" into ");
    log.yellow(state.toBranch);
    log.white("...");
    log.moat(1);
  }
  return git.setBranch(cwd, state.fromBranch).then(function() {
    if (options.merge === false) {
      return;
    }
    report.task("Creating temporary branch...");
    return git.addBranch(cwd, state.tempBranch);
  }).then(function() {
    return git.diff(cwd, "HEAD^").then(function(changes) {
      var regex;
      regex = /^packager\//;
      return state.changes = sync.filter(changes, function(change) {
        return regex.test(change.path);
      });
    }).fail(function(error) {
      if (/^Unknown revision/.test(error.message)) {
        return;
      }
      throw error;
    });
  });
}).then(function() {
  var immediateChildren, savedPaths;
  savedPaths = ["packager", ".git"];
  log.moat(3);
  report.task("Deleting irrelevant 'react-native' paths...");
  log.plusIndent(2);
  immediateChildren = fs.readDir(cwd);
  sync.each(immediateChildren, function(filePath) {
    if (inArray(savedPaths, filePath)) {
      return;
    }
    fs.remove(filePath);
    return report("delete", filePath);
  });
  return log.popIndent();
}).then(function() {
  var allChildren, deletedPatterns, renamedDirs, renamedPaths, root;
  root = "packager/";
  renamedPaths = {
    "transformer.js": "transform.js",
    "blacklist.js": "src/utils/blacklist.js",
    "react-packager": ".",
    "react-packager/rn-babelrc.json": ".babelrc",
    "react-packager/src/transforms": "src/babel-plugins",
    "react-packager/src/DependencyResolver/Cache/lib": "src/DependencyResolver/Cache",
    "react-packager/src/DependencyResolver/DependencyGraph": "src/DependencyResolver",
    "react-packager/src/DependencyResolver/DependencyGraph/index.js": "src/DependencyResolver/DependencyGraph.js",
    "react-packager/src/DependencyResolver/DependencyGraph/docblock.js": "src/utils/docblock.js",
    "react-packager/src/DependencyResolver/FileWatcher": "src/FileWatcher",
    "react-packager/src/DependencyResolver/lib": "src/utils",
    "react-packager/src/lib": "src/utils"
  };
  deletedPatterns = ["**/*/__tests__/**/*", "**/*/__mocks__/**/*", "package.json", "packager.sh", "README.md", "babelRegisterOnly.js", "rn-cli.config.js", "react-native-xcode.sh", "launchPackager.command", "react-packager/src/DependencyResolver/AssetModule_DEPRECATED.js", "react-packager/src/DependencyResolver/DependencyGraph/DeprecatedAssetMap.js", "react-packager/src/DependencyResolver/DependencyGraph/DependencyGraphHelpers.js"];
  renamedDirs = [];
  log.moat(3);
  report.task("Scanning 'packager' descendants...");
  log.plusIndent(2);
  allChildren = globby.sync(root + "**/*");
  sync.each(allChildren, function(filePath) {
    var index, length, renamedPath;
    filePath = filePath.slice(9);
    renamedPath = renamedPaths[filePath];
    if (renamedPath) {
      if (fs.isDir(root + filePath)) {
        renamedDirs.unshift([filePath, renamedPath]);
        return;
      }
      fs.move(root + filePath, root + renamedPath);
      report("move", filePath, renamedPath);
      return;
    }
    if (fs.isDir(root + filePath)) {
      return;
    }
    index = -1;
    length = deletedPatterns.length;
    while (++index < length) {
      if (isMatch(filePath, deletedPatterns[index])) {
        fs.remove(root + filePath);
        report("delete", filePath);
        return;
      }
    }
    return report("keep", filePath);
  });
  sync.each(renamedDirs, function(args) {
    var dirPath, renamedPath;
    dirPath = root + args[0];
    renamedPath = root;
    if (args[1] !== ".") {
      renamedPath += args[1];
    }
    fs.copy(dirPath, renamedPath, {
      recursive: true
    });
    fs.remove(dirPath);
    return report("move", args[0], args[1]);
  });
  return log.popIndent();
}).then(function() {
  fs.copy("packager", cwd);
  return fs.remove("packager");
}).then(function() {
  if (options.merge === false) {
    return;
  }
  return git.stageAll(cwd).then(function() {
    return git.pushCommit(cwd, "temporary commit");
  }).then(function(commit) {
    report.task("Copying changes into current branch...");
    return git.setBranch(cwd, state.toBranch).then(function() {
      return git.pick(cwd, commit);
    });
  });
}).always(function(error) {
  if (options.merge === false) {
    return;
  }
  report.task("Removing temporary branch...");
  return git.removeBranch(cwd, state.tempBranch);
}).then(function() {
  if (!state.changes) {
    return;
  }
  log.moat(1);
  sync.each(state.changes, function(change) {
    return report.status(change.status, change.path);
  });
  return log.moat(1);
});

//# sourceMappingURL=../../map/src/react-packager.map
