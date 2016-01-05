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
  getImports: function getImports() {
    return UI.imports.join('\n');
  },
  addImportStatement: function addImportStatement(name) {
    // Capitialize the first character for React.
    var Uppercase = name[0].toUpperCase();
    name = Uppercase + name.substring(1, name.length);

    var importStatement = 'import ' + name + ' from \'./ui/' + name + '\';';
    var clearCache = 'delete require.cache[require.resolve("./ui/' + name + '")];';

    if (UI.imports.indexOf(importStatement) === -1) {
      UI.imports.push(importStatement);
    }
    if (UI.clearCache.indexOf(clearCache) === -1) {
      UI.clearCache.push(clearCache);
    }
  },
  compile: function compile(name) {
    UI.compileReactComponent(name);
    UI.compileStylesheet(name);

    UI.addImportStatement(name);

    Log.mention('UI Component `' + name + '` is compiled!');

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
    var compiled = Babel.transform(file, {
      presets: [BabelEs2015, BabelReact]
    });

    // Store in cache.
    _cache2.default.store('ui/' + name, 'index.js', compiled.code);
  },
  compileStylesheet: function compileStylesheet(name) {
    var path = _path2.default.join(UI.path, name, 'style.scss');

    if (!_fs2.default.existsSync(path)) {
      return false;
    }

    var file = _fs2.default.readFileSync(path, 'utf-8');

    // Compile.
    var css = _nodeSass2.default.renderSync({
      file: path
    }).css.toString();

    // Store in cache.
    _cache2.default.store('ui/' + name, 'style.css', css);
  }
};

exports.default = UI;