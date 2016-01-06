'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Dist');

// Logging...

var Dist = {
  path: _path2.default.join(process.cwd(), 'dist'),
  store: function store(path, content) {
    var dirPath = undefined;
    var filePath = undefined;

    if (_path2.default.extname(path)) {
      var parts = path.split('/');
      dirPath = parts.slice(0, parts.length - 1).join('/');
      dirPath = _path2.default.join(Dist.path, dirPath);
      filePath = _path2.default.join(Dist.path, path);
    } else {
      Log.error('Can not write due to path error: ', path);
      return;
    }

    _fsExtra2.default.mkdirsSync(dirPath);

    _fsExtra2.default.writeFileSync(filePath, content);
  },
  remove: function remove(path) {
    path = _path2.default.join(Dist.path, path);

    if (_path2.default.extname(path)) {
      _fsExtra2.default.unlinkSync(path);
      return;
    }

    _fsExtra2.default.remove(path);
  }
};

exports.default = Dist;