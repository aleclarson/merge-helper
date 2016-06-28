
log = require "log"

shiftArray = Array::shift

module.exports = exports = ->
  eventCache[shiftArray.call arguments]
    .apply null, arguments
  return

exports.task = (description) ->
  log.moat 1
  log.cyan description
  log.moat 1

exports.status = (status, path) ->

  switch status
    when "A" then color = "green"
    when "M" then color = "yellow"
    when "D" then color = "red"
    else color = "white"

  log[color] status, " "
  log.white path
  log.moat 0

eventCache =

  "keep": (path) ->
    log.moat 1
    log.white "keep "
    log.green path
    log.moat 1

  "delete": (path) ->
    log.moat 1
    log.white "delete "
    log.red path
    log.moat 1

  "move": (oldPath, newPath) ->
    log.moat 1
    log.white "move "
    log.yellow oldPath
    log.moat 0
    log.white "  to "
    log.yellow newPath
    log.moat 1
