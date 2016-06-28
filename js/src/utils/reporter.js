var eventCache, exports, log, shiftArray;

log = require("log");

shiftArray = Array.prototype.shift;

module.exports = exports = function() {
  eventCache[shiftArray.call(arguments)].apply(null, arguments);
};

exports.task = function(description) {
  log.moat(1);
  log.cyan(description);
  return log.moat(1);
};

exports.status = function(status, path) {
  var color;
  switch (status) {
    case "A":
      color = "green";
      break;
    case "M":
      color = "yellow";
      break;
    case "D":
      color = "red";
      break;
    default:
      color = "white";
  }
  log[color](status, " ");
  log.white(path);
  return log.moat(0);
};

eventCache = {
  "keep": function(path) {
    log.moat(1);
    log.white("keep ");
    log.green(path);
    return log.moat(1);
  },
  "delete": function(path) {
    log.moat(1);
    log.white("delete ");
    log.red(path);
    return log.moat(1);
  },
  "move": function(oldPath, newPath) {
    log.moat(1);
    log.white("move ");
    log.yellow(oldPath);
    log.moat(0);
    log.white("  to ");
    log.yellow(newPath);
    return log.moat(1);
  }
};

//# sourceMappingURL=../../../map/src/utils/reporter.map
