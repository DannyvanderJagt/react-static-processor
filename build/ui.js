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
  index: {},
  components: [],

  createIndex: function createIndex(next) {
    var components = _fs2.default.readdirSync(UI.path);
    var valid = undefined;

    components = components.filter(function (component) {
      valid = UI.isValidComponent(_path2.default.join(UI.path, component));

      if (!valid) {
        Log.error('The component `' + component + '` is missing an index.js file!');
      }

      return valid;
    });

    Log.mention('Telescope found', components.length, 'UI component(s).');

    UI.components = components;

    next();
  },
  isValidComponent: function isValidComponent(path) {
    return _fs2.default.existsSync(_path2.default.join(path, 'index.js'));
  },
  compileAll: function compileAll(next) {
    UI.components.forEach(function (component) {
      UI.compile(component);
    });

    next();
  },
  compile: function compile(name, next) {
    // Load the file.
    var path = _path2.default.join(UI.path, name, 'index.js');
    var file = _fs2.default.readFileSync(path, 'utf-8');

    // Compile.
    var compiled = Babel.transform(file, {
      presets: [BabelEs2015, BabelReact]
    });

    // Store in cache.
    _cache2.default.store('ui/' + name, 'index.js', compiled.code);

    Log.mention('Component `' + name + '` is compiled!');
  }
};

exports.default = UI;