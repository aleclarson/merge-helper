
Promise = require "Promise"
isType = require "isType"
sync = require "sync"
exec = require "exec"
git = require "git-utils"
fs = require "io/async"

deletedPatterns = [

  # Use 'react-packager' module instead.
  "packager"

  # Use 'Animated' module instead.
  "Libraries/Animated"

  # Use 'fetch' module instead.
  "Libraries/Fetch"

  # Use 'Promise' module instead.
  "Libraries/Promise.js"

  # Use 'parseErrorStack' module instead.
  "Libraries/JavaScriptAppEngine/Initialization/parseErrorStack.js"

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
  "babel-preset"
  "IntegrationTests"
  "**/*/__tests__"
  "**/*/__mocks__"
]

log.moat 1
log.yellow "cwd = "
log.white cwd
log.moat 1

visited = Object.create null
module.exports = Promise.chain deletedPatterns, (pattern) ->
  log.moat 1
  log.yellow "pattern = "
  log.white pattern
  log.moat 1
  fs.match pattern
  .then (files) ->
    Promise.chain files, (file) ->
      return if /node_modules/.test file
      return if visited[file]
      visited[file] = yes
      exec.async "git rm -rf " + file, { cwd }
      .then ->
        log.moat 1
        log.cyan "git rm -rf "
        log.white file
        log.moat 1
      .fail (error) ->
        log.moat 1
        log.gray.dim error.stack
        log.moat 1
  .fail (error) ->
    log.moat 1
    log.gray.dim error.stack
    log.moat 1
