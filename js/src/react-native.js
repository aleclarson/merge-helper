var Promise, deletedPatterns, exec, fs, git, isType, sync, visited;

Promise = require("Promise");

isType = require("isType");

sync = require("sync");

exec = require("exec");

git = require("git-utils");

fs = require("io/async");

deletedPatterns = ["packager", "Libraries/Animated", "Libraries/Fetch", "Libraries/Promise.js", "Libraries/JavaScriptAppEngine/Initialization/parseErrorStack.js", "CONTRIBUTING.md", "Releases.md", "breaking-changes.md", "npm-shrinkwrap.json", "circle.yml", ".travis.yml", "docs", "website", "Examples", "jestSupport", "babel-preset", "IntegrationTests", "**/*/__tests__", "**/*/__mocks__"];

log.moat(1);

log.yellow("cwd = ");

log.white(cwd);

log.moat(1);

visited = Object.create(null);

module.exports = Promise.chain(deletedPatterns, function(pattern) {
  log.moat(1);
  log.yellow("pattern = ");
  log.white(pattern);
  log.moat(1);
  return fs.match(pattern).then(function(files) {
    return Promise.chain(files, function(file) {
      if (/node_modules/.test(file)) {
        return;
      }
      if (visited[file]) {
        return;
      }
      visited[file] = true;
      return exec.async("git rm -rf " + file, {
        cwd: cwd
      }).then(function() {
        log.moat(1);
        log.cyan("git rm -rf ");
        log.white(file);
        return log.moat(1);
      }).fail(function(error) {
        log.moat(1);
        log.gray.dim(error.stack);
        return log.moat(1);
      });
    });
  }).fail(function(error) {
    log.moat(1);
    log.gray.dim(error.stack);
    return log.moat(1);
  });
});

//# sourceMappingURL=../../map/src/react-native.map
