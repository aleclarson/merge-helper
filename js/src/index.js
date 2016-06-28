var Path, Promise, isType, minimist, steal;

global.lotus = require(process.env.LOTUS_PATH + "/lotus");

global.log = require("log");

minimist = require("minimist");

Promise = require("Promise");

isType = require("isType");

steal = require("steal");

Path = require("path");

global.cwd = process.cwd();

global.options = minimist(process.argv.slice(2));

global.args = steal(options, "_");

log.moat(1);

log.pushIndent(2);

Promise["try"](function() {
  var helperPath;
  helperPath = __dirname + "/" + Path.basename(cwd);
  if (!lotus.isFile(helperPath)) {
    throw Error("Failed to find merge helper: " + helperPath);
  }
  return require(helperPath);
}).always(function(error) {
  if (error) {
    log.moat(1);
    log.red(error.constructor.name, ": ");
    log.white(error.message);
    log.moat(0);
    log.gray.dim(error.stack.split(log.ln).slice(1).join(log.ln));
    log.moat(1);
  }
  log.cursor.isHidden = false;
  return process.exit(1);
});

//# sourceMappingURL=../../map/src/index.map
