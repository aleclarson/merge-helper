var git, lotus, modulePath, promise;

lotus = require(process.env.LOTUS_PATH + "/lotus");

git = require("git-utils");

modulePath = lotus.path + "/node-haste";

promise = git.mergeFiles(modulePath, {
  verbose: true,
  ours: modulePath + "/src/",
  theirs: lotus.path + "/react-packager/src/DependencyResolver/",
  rename: {
    "lib": "utils",
    "DependencyGraph/docblock.js": "utils/docblock.js",
    "DependencyGraph/ResolutionRequest.js": "ResolutionRequest.js",
    "DependencyGraph/ResolutionResponse.js": "ResolutionResponse.js",
    "DependencyGraph/HasteMap.js": "HasteMap.js"
  },
  unlink: ["DependencyGraph"],
  merge: {
    "docblock.js": "utils/docblock.js",
    "DependencyGraph.js": "index.js",
    "AssetModule.js": "AssetModule.js",
    "Cache/index.js": "Cache/index.js",
    "crawlers": "crawlers",
    "fastfs.js": "fastfs.js",
    "File.js": "File.js",
    "FileWatcher": "FileWatcher",
    "HasteMap.js": "HasteMap.js",
    "Module.js": "Module.js",
    "ModuleCache.js": "ModuleCache.js",
    "NullModule.js": "NullModule.js",
    "Package.js": "Package.js",
    "Polyfill.js": "Polyfill.js",
    "ResolutionRequest.js": "ResolutionRequest.js",
    "ResolutionResponse.js": "ResolutionResponse.js"
  }
});

//# sourceMappingURL=../../map/src/node-haste.map
