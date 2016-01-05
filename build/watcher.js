'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Watcher');

var Watcher = {

  // UI.

  watchUI: function watchUI(next) {
    _chokidar2.default.watch('ui/**/*.*', {
      ignoreInitial: false,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('ready', Watcher.onUIReady).on('close', Watcher.onUIClose).on('all', Watcher.onUI);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },

  // Callback events.
  onUIReady: function onUIReady() {
    Log.success('Watching UI components...');
    _ui2.default.initialReadDone();
  },
  onUIClose: function onUIClose() {
    Log.alert('Stopped watching UI components...');
  },
  onUI: function onUI(event, path) {
    // On initial read we only compile
    // when an .js file is found.
    if (_ui2.default.initialRead === false && _path2.default.extname(path) !== '.js') {
      return;
    }

    // Get the component file name.
    var arrPath = path.split('/');
    if (!arrPath[1]) {
      return;
    }

    var componentName = arrPath[1];
    _ui2.default.compile(componentName);
  },

  // Pages.
  watchPages: function watchPages(next) {
    _chokidar2.default.watch('pages/*.*', {
      ignoreInitial: false,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('ready', Watcher.onPageReady).on('close', Watcher.onPageClose).on('all', Watcher.onPage);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },

  // Callback events.
  onPageReady: function onPageReady() {
    Log.success('Watching pages...');
    _pages2.default.initialReadDone();
  },
  onPageClose: function onPageClose() {
    Log.alert('Stopped watching pages...');
  },
  onPage: function onPage(event, path) {
    // Get the component file name.
    var arrPath = path.split('/');
    if (!arrPath[1]) {
      return;
    }

    var componentName = arrPath[1];

    // Remove the extention.
    componentName = componentName.replace('.tmpl', '');

    _pages2.default.compile(componentName);
  }
};

exports.default = Watcher;