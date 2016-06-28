
isType = require "isType"
globby = require "globby"
sync = require "sync"
exec = require "exec"
git = require "git-utils"
fs = require "io/sync"

if not isType args[0], String
  throw TypeError "Must provide a branch name!"

log.moat 1
log.gray "Merging..."
log.moat 1

module.exports = git.mergeBranch
  modulePath: cwd
  theirs: args[0]

.then ->

  deletedPatterns = [
    "packager" # Use 'react-packager' module instead.
    "Libraries/Animated" # Use 'Animated' module instead.
    "README.md"
    "CONTRIBUTING.md"
    "Releases.md"
    "breaking-changes.md"
    "npm-shrinkwrap.json"
    "circle.yml"
    ".travis.yml"
    "docs"
    "website"
    "Examples"
    "jestSupport"
    "**/*/__tests__"
    "**/*/__mocks__"
  ]

  sync.each ignoredPatterns, (pattern) ->
    files = globby.sync pattern
    .forEach (path) ->
      exec "git rm -rf " + path, { cwd }
      .then ->
        log.moat 1
        log.white "Ignored path: "
        log.yellow path
        log.moat 1
