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

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Watcher');

var Watcher = {

  // UI.

  watchUI: function watchUI(next) {
    Watcher.ui = _chokidar2.default.watch('ui/**/*.*', {
      ignoreInitial: false,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('ready', Watcher.onUIReady).on('close', Watcher.onUIClose).on('all', Watcher.onUI);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },
  unwatchUI: function unwatchUI() {
    if (Watcher.ui && Watcher.ui.stop) {
      Watcher.ui.stop();
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

    if (event === 'unlink' && _path2.default.extname(path) === '.js') {
      _ui2.default.removeComponent(componentName);
      return;
    }

    _ui2.default.compile(componentName);
  },

  // Pages.
  watchPages: function watchPages(next) {
    Watcher.pages = _chokidar2.default.watch('pages/*.*', {
      ignoreInitial: false,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('ready', Watcher.onPageReady).on('close', Watcher.onPageClose).on('all', Watcher.onPage);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },
  unwatchPages: function unwatchPages() {
    if (Watcher.pages && Watcher.pages.stop) {
      Watcher.pages.stop();
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

    if (event === 'unlink') {
      _pages2.default.removePage(componentName);
      return;
    }

    _pages2.default.compile(componentName);
  },
  watchConfig: function watchConfig(next) {
    Watcher.config = _chokidar2.default.watch('telescope.config.js', {
      ignoreInitial: true,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('all', Watcher.onConfig);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },
  unWatchConfig: function unWatchConfig() {
    if (Watcher.config && Watcher.config.close) {
      Watcher.config.stop();
    }
  },

  // Callback events.
  onConfig: function onConfig(event, path) {
    _config2.default.load();

    Watcher.unwatchPages();
    Watcher.watchPages();
  },
  watchConfigStylesheets: function watchConfigStylesheets(next) {
    if (!_config2.default.data.stylesheets) {
      next();return;
    }
    if (!_util2.default.isArray(_config2.default.data.stylesheets)) {
      next();return;
    }

    Watcher.configStylesheets = _chokidar2.default.watch(_config2.default.data.stylesheets, {
      ignoreInitial: true,
      cwd: process.cwd(),
      ignored: /[\/\\]\./
    }).on('all', Watcher.onConfigStylesheets);

    if (next && _util2.default.isFunction(next)) {
      next();
    }
  },
  onConfigStylesheets: function onConfigStylesheets(event, path) {
    Watcher.unwatchPages();
    Watcher.watchPages();
  }
};

exports.default = Watcher;