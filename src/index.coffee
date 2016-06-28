#!/usr/bin/env node

global.lotus = require process.env.LOTUS_PATH + "/lotus"
global.log = require "log"

minimist = require "minimist"
Promise = require "Promise"
isType = require "isType"
steal = require "steal"
Path = require "path"

global.cwd = process.cwd()
global.options = minimist process.argv.slice 2
global.args = steal options, "_"

log.moat 1
log.pushIndent 2

Promise.try ->

  helperPath = __dirname + "/" + Path.basename cwd

  if not lotus.isFile helperPath
    throw Error "Failed to find merge helper: " + helperPath

  require helperPath

.always (error) ->

  if error
    log.moat 1
    log.red error.constructor.name, ": "
    log.white error.message
    log.moat 0
    log.gray.dim error.stack.split(log.ln).slice(1).join(log.ln)
    log.moat 1

  log.cursor.isHidden = false
  process.exit 1
