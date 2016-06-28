var exec, fs, git, globby, isType, sync;

isType = require("isType");

globby = require("globby");

sync = require("sync");

exec = require("exec");

git = require("git-utils");

fs = require("io/sync");

if (!isType(args[0], String)) {
  throw TypeError("Must provide a branch name!");
}

log.moat(1);

log.gray("Merging...");

log.moat(1);

module.exports = git.mergeBranch({
  modulePath: cwd,
  theirs: args[0]
}).then(function() {
  var deletedPatterns;
  deletedPatterns = ["packager", "Libraries/Animated", "README.md", "CONTRIBUTING.md", "Releases.md", "breaking-changes.md", "npm-shrinkwrap.json", "circle.yml", ".travis.yml", "docs", "website", "Examples", "jestSupport", "**/*/__tests__", "**/*/__mocks__"];
  return sync.each(ignoredPatterns, function(pattern) {
    var files;
    return files = globby.sync(pattern).forEach(function(path) {
      return exec("git rm -rf " + path, {
        cwd: cwd
      }).then(function() {
        log.moat(1);
        log.white("Ignored path: ");
        log.yellow(path);
        return log.moat(1);
      });
    });
  });
});

//# sourceMappingURL=../../map/src/react-native.map
