'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Cache');

// Module.

// Logging...
var Cache = {
  path: _path2.default.join(process.cwd(), '.cache'),

  destroy: function destroy(next) {
    _fsExtra2.default.removeSync(Cache.path);

    Log.mention('destroyed...');

    if (next) {
      next();
    }
  },
  store: function store(path, content) {
    var dirPath = undefined;
    var filePath = undefined;

    if (_path2.default.extname(path)) {
      var parts = path.split('/');
      dirPath = parts.slice(0, parts.length - 1).join('/');
      dirPath = _path2.default.join(Cache.path, dirPath);
      filePath = _path2.default.join(Cache.path, path);
    } else {
      Log.error('Can not write due to path error: ', path);
      return;
    }

    _fsExtra2.default.mkdirsSync(dirPath);

    _fsExtra2.default.writeFileSync(filePath, content);
    return filePath;
  },

  // store(path, filename, content){
  //   if(!path){ path = ''};
  //   path = Path.join(Cache.path, path);
  //   Fs.mkdirsSync(path);

  //   path = Path.join(path, filename);

  //   Fs.writeFileSync(path, content);
  //   return path;
  // },
  remove: function remove(path) {
    path = _path2.default.join(Cache.path, path);

    if (_path2.default.extname(path)) {
      _fsExtra2.default.unlinkSync(path);
      return;
    }

    _fsExtra2.default.remove(path);
  }
  // remove(path, filename){
  //   if(!path){ path = ''};
  //   path = Path.join(Cache.path, path, filename);
  //   Fs.unlinkSync(path);
  //   return path;
  // }

};

exports.default = Cache;