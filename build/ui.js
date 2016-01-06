'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _relations = require('./relations');

var _relations2 = _interopRequireDefault(_relations);

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Babel = require('babel-core');
var BabelEs2015 = require('babel-preset-es2015');
var BabelReact = require('babel-preset-react');

// Logging.

var Log = _logger2.default.level('UI');

// Module.
var UI = {
  path: _path2.default.join(process.cwd(), 'ui'),
  initialRead: false,
  initialReadWaiter: undefined,

  imports: [],
  clearCache: [],

  exists: function exists(next) {
    if (!_fs2.default.existsSync(UI.path)) {
      Log.error('Please create a ui directory at:', UI.path);
      _index2.default.stop();
      return;
    }
    next();
  },
  initialReadDone: function initialReadDone() {
    UI.initialRead = true;
    if (UI.initialReadWaiter) {
      var waiter = UI.initialReadWaiter;
      UI.initialReadWaiter = undefined;

      waiter();
    }
  },
  waitUntilInitialReadIsDone: function waitUntilInitialReadIsDone(next) {
    UI.initialReadWaiter = next;
  },
  removeComponent: function removeComponent(name) {
    UI.removeImportStatement(name);
    _relations2.default.removeUIComponent(name);

    _cache2.default.remove('ui/' + name);

    Log.success('UI component `' + name + '` is removed!');
  },
  getImports: function getImports() {
    return UI.imports.join('\n');
  },
  generateImportStatement: function generateImportStatement(name) {
    var Uppercase = name[0].toUpperCase();
    name = Uppercase + name.substring(1, name.length);
    var importStatement = 'import ' + name + ' from \'./ui/' + name + '\';';
    var clearCache = 'delete require.cache[require.resolve("./ui/' + name + '")];';
    return { importStatement: importStatement, clearCache: clearCache };
  },
  addImportStatement: function addImportStatement(name) {
    var _UI$generateImportSta = UI.generateImportStatement(name);

    var importStatement = _UI$generateImportSta.importStatement;
    var clearCache = _UI$generateImportSta.clearCache;

    if (UI.imports.indexOf(importStatement) === -1) {
      UI.imports.push(importStatement);
    }
    if (UI.clearCache.indexOf(clearCache) === -1) {
      UI.clearCache.push(clearCache);
    }
  },
  removeImportStatement: function removeImportStatement(name) {
    var _UI$generateImportSta2 = UI.generateImportStatement(name);

    var importStatement = _UI$generateImportSta2.importStatement;
    var clearCache = _UI$generateImportSta2.clearCache;

    var pos = undefined;
    pos = UI.imports.indexOf(importStatement);
    if (pos !== -1) {
      UI.imports.splice(pos, 1);
    }

    pos = UI.clearCache.indexOf(clearCache);
    if (pos === -1) {
      UI.clearCache.splice(pos, 1);
    }
  },
  compile: function compile(name) {
    UI.compileReactComponent(name);
    UI.compileStylesheet(name);

    UI.addImportStatement(name);

    Log.success('UI Component `' + name + '` is compiled!');

    // Recompile pages that are using this ui component.
    var relations = _relations2.default.getUIRelations(name);

    relations.forEach(function (page) {
      _pages2.default.compile(page);
    });
  },
  compileReactComponent: function compileReactComponent(name) {
    // Load the file.
    var path = _path2.default.join(UI.path, name, 'index.js');

    if (!_fs2.default.existsSync(path)) {
      Log.error('UI component does not have an index.js file!');
      return false;
    }

    var file = _fs2.default.readFileSync(path, 'utf-8');

    // Compile.
    var compiled = undefined;
    try {
      compiled = Babel.transform(file, {
        presets: [BabelEs2015, BabelReact]
      });
    } catch (error) {
      Log.error('Could not compile the .js file of UI component:', name, 'due to:', error);
      return;
    }

    // Store in cache.
    _cache2.default.store(_path2.default.join('ui', name, 'index.js'), compiled.code);
  },
  compileStylesheet: function compileStylesheet(name) {
    var path = _path2.default.join(UI.path, name, 'style.scss');

    if (!_fs2.default.existsSync(path)) {
      return false;
    }

    var file = _fs2.default.readFileSync(path, 'utf-8');

    // Compile.
    var css = undefined;
    try {
      css = _nodeSass2.default.renderSync({
        file: path
      }).css.toString();
    } catch (error) {
      Log.error('Could not compile the .scss file of UI component:', name, 'due to:', error);
      return;
    }

    // Store in cache.
    _cache2.default.store(_path2.default.join('ui', name, 'style.css'), css);
  }
};

exports.default = UI;