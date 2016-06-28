
{ isMatch } = require "micromatch"

inArray = require "in-array"
Random = require "random"
globby = require "globby"
sync = require "sync"
git = require "git-utils"
fs = require "io/sync"

report = require "./utils/reporter"

state =
  tempBranch: Random.id()
  fromBranch: args[0] or "react-native"
  toBranch: null
  changes: null

# Use the current branch as the target branch.
module.exports = git.getBranch cwd

.then (currentBranch) ->
  state.toBranch = currentBranch

  if options.merge isnt false
    log.moat 1
    log.white "Merging "
    log.yellow state.fromBranch
    log.white " into "
    log.yellow state.toBranch
    log.white "..."
    log.moat 1

  # Change to the branch that will be merged in.
  git.setBranch cwd, state.fromBranch

  # Create a temporary branch for merging.
  .then ->
    return if options.merge is false
    report.task "Creating temporary branch..."
    git.addBranch cwd, state.tempBranch

  .then ->

    # Get the changes that will be merged in.
    # NOTE: The changes must be squashed into a single commit!
    git.diff cwd, "HEAD^"

    # Only keep changes from the "packager" directory.
    .then (changes) ->
      regex = /^packager\//
      state.changes = sync.filter changes, (change) ->
        regex.test change.path

    .fail (error) ->

      if /^Unknown revision/.test error.message
        return # If HEAD^ does not exist, there is only one commit.

      throw error

.then ->
  savedPaths = [
    "packager"
    ".git"
  ]

  log.moat 3
  report.task "Deleting irrelevant 'react-native' paths..."
  log.plusIndent 2

  immediateChildren = fs.readDir cwd
  sync.each immediateChildren, (filePath) ->
    return if inArray savedPaths, filePath
    fs.remove filePath
    report "delete", filePath

  log.popIndent()

.then ->
  # Both `renamedPaths` and `deletedPatterns` are relative to "react-native/packager".
  root = "packager/"

  # These mappings are used to move specific files or directories.
  renamedPaths =
    "transformer.js": "transform.js"
    "blacklist.js": "src/utils/blacklist.js"
    "react-packager": "." # Move the contents of "react-packager" into the root directory.
    "react-packager/rn-babelrc.json": ".babelrc"
    "react-packager/src/transforms": "src/babel-plugins"
    "react-packager/src/DependencyResolver/Cache/lib": "src/DependencyResolver/Cache"
    "react-packager/src/DependencyResolver/DependencyGraph": "src/DependencyResolver"
    "react-packager/src/DependencyResolver/DependencyGraph/index.js": "src/DependencyResolver/DependencyGraph.js"
    "react-packager/src/DependencyResolver/DependencyGraph/docblock.js": "src/utils/docblock.js"
    "react-packager/src/DependencyResolver/FileWatcher": "src/FileWatcher"
    "react-packager/src/DependencyResolver/lib": "src/utils"
    "react-packager/src/lib": "src/utils"

  # These glob patterns are used to delete specific files or directories.
  deletedPatterns = [
    "**/*/__tests__/**/*"
    "**/*/__mocks__/**/*"
    "package.json"
    "packager.sh"
    "README.md"
    "babelRegisterOnly.js"
    "rn-cli.config.js"
    "react-native-xcode.sh"
    "launchPackager.command"
    "react-packager/src/DependencyResolver/AssetModule_DEPRECATED.js"
    "react-packager/src/DependencyResolver/DependencyGraph/DeprecatedAssetMap.js"
    "react-packager/src/DependencyResolver/DependencyGraph/DependencyGraphHelpers.js"
  ]

  # Renaming directories must be done
  # after renaming/removing files.
  renamedDirs = []

  log.moat 3
  report.task "Scanning 'packager' descendants..."
  log.plusIndent 2

  # TODO: Remove unchanged files before the renaming phase.

  allChildren = globby.sync root + "**/*"
  sync.each allChildren, (filePath) ->

    # Remove the leading root.
    filePath = filePath.slice 9

    # Try renaming the file or directory.
    renamedPath = renamedPaths[filePath]
    if renamedPath

      # As stated above, renaming directories is a special case.
      if fs.isDir root + filePath
        # We must use `unshift()` so child directories are renamed first.
        renamedDirs.unshift [
          filePath
          renamedPath
        ]
        return

      fs.move root + filePath, root + renamedPath
      report "move", filePath, renamedPath
      return

    # Skip directories since `fs.remove()` automatically
    # deletes any empty parent directories of a deleted file.
    # Use glob patterns to delete whole directories!
    return if fs.isDir root + filePath

    # Try deleting the file.
    index = -1
    { length } = deletedPatterns
    while ++index < length
      if isMatch filePath, deletedPatterns[index]
        fs.remove root + filePath
        report "delete", filePath
        return

    report "keep", filePath

  sync.each renamedDirs, (args) ->
    dirPath = root + args[0]
    renamedPath = root

    # Pass '' or '.' to copy the contents into the current directory.
    if args[1] isnt "."
      renamedPath += args[1];

    # NOTE: We don't use `fs.move()` here because it
    #       throws if the destination is a non-empty directory.
    fs.copy dirPath, renamedPath, { recursive: yes }
    fs.remove dirPath

    report "move", args[0], args[1]

  log.popIndent()

# Move the contents of "packager" into the current directory.
.then ->
  fs.copy "packager", cwd
  fs.remove "packager"

.then ->

  return if options.merge is false

  # Squash the changes into a single commit.
  git.stageAll cwd
  .then -> git.pushCommit cwd, "temporary commit"

  # Copy the changes into the current branch.
  .then (commit) ->
    report.task "Copying changes into current branch..."
    git.setBranch cwd, state.toBranch
    .then -> git.pick cwd, commit

# Remove the temporary branch.
.always (error) ->
  return if options.merge is false
  report.task "Removing temporary branch..."
  git.removeBranch cwd, state.tempBranch

# Print the raw changes between "react-native" versions.
.then ->
  return if not state.changes
  log.moat 1
  sync.each state.changes, (change) ->
    report.status change.status, change.path
  log.moat 1
