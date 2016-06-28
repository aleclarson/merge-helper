#!/usr/bin/env node

global.lotus = require(process.env.LOTUS_PATH + '/lotus');
global.log = require('log');

var minimist = require('minimist');
var Promise = require('Promise');
var isType = require('isType');
var steal = require('steal');
var Path = require('path');

global.cwd = process.cwd();
global.options = minimist(process.argv.slice(2));
global.args = steal(options, '_');

log.moat(1);
log.pushIndent(2);

Promise.try(function() {
  var helperPath = __dirname + '/' + Path.basename(cwd);
  if (lotus.isFile(helperPath)) {
    return require(helperPath);
  }

  log.moat(1);
  log.red('Error: ');
  log.white(Path.basename(cwd) + ' has no merge helper!');
  log.moat(1);
})

.always(function(error) {
  if (error) {
    log.moat(1);
    log.red(error.constructor.name, ': ');
    log.white(error.message);
    log.moat(0);
    log.gray.dim(error.stack.split(log.ln).slice(1).join(log.ln));
    log.moat(1);
  }

  log.cursor.isHidden = false;
  process.exit(1);
});
