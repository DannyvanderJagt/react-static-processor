'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Babel has to be load the old fashion way!
var Babel = require('babel-core');
var BabelEs2015 = require('babel-preset-es2015');
var BabelReact = require('babel-preset-react');

// Logging...

var Log = _logger2.default.level('Pages');

// Data for the page we are compiling.
var LivePage = undefined;

var Compiler = {
  queue: [],
  compile: function compile(name, cb) {
    Compiler.queue[{ name: name, cb: cb }];

    if (LivePage === undefined) {
      Compiler.execute();
    }
  },
  abort: function abort(error) {
    Log.error(LivePage.name, 'stopped compiling due to this error: ', error);
  },
  execute: function execute() {
    LivePage = Compiler.queue.pop();

    _async2.default.series([Compiler.exists, Compiler.getContent, Compiler.addReactWrapper

    // Store the file.
    ]);
  },

  // Compiler methods...

  // Check if the page really exists.
  exists: function exists(next) {
    var name = LivePage.name;
    var path = _path2.default.join(_pages2.default.path, name) + '.tmpl';

    if (!Fs.exists(path)) {
      Compiler.abort('The .tmpl file does not exist!');
      return;
    }

    LivePage.path = path;

    next();
  },
  getContent: function getContent(next) {
    try {
      LivePage.content = Fs.readFileSync(LivePage.path, 'utf-8');
    } catch (error) {
      Compiler.abort('The file could not be loaded!');
    }

    next();
  },
  addReactWrapper: function addReactWrapper(next) {
    var imports = UI.getImports();

    var wrapper = '\n        import React from \'react\';\n        ' + imports + '\n\n        class Page extends React.Component{\n          render(){\n            return <div>' + LivePage.content + '</div>;\n          }\n        };\n\n        // Makes require possible.\n        module.exports = Page;\n    ';

    LivePage.content = wrapper;

    next();
  }
};

exports.default = Compiler;