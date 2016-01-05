'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _gulpBabel = require('gulp-babel');

var _gulpBabel2 = _interopRequireDefault(_gulpBabel);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _uid = require('uid');

var _uid2 = _interopRequireDefault(_uid);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Pages');

// Logging...

var Pages = {
  path: _path2.default.join(process.cwd(), 'pages'),

  initialRead: false,
  initialReadWaiter: undefined,

  initialReadDone: function initialReadDone() {
    Pages.initialRead = true;

    if (Pages.initialReadWaiter) {
      var waiter = Pages.initialReadWaiter;
      Pages.initialReadWaiter = undefined;

      waiter();
    }
  },
  waitUntilInitialReadIsDone: function waitUntilInitialReadIsDone(next) {
    Pages.initialReadWaiter = next;
  },
  compile: function compile(name) {
    _compiler2.default.compile(name);
    Log.mention('Compiling page: ', name);
  }
};

exports.default = Pages;