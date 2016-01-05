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

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Babel = require('babel-core');
var BabelEs2015 = require('babel-preset-es2015');
var BabelReact = require('babel-preset-react');

// Logging...

var Log = _logger2.default.level('Pages');

var LivePage = undefined;

var Pages = {
  pages: [],
  queue: [],

  createIndex: function createIndex(next) {
    var routes = _config2.default.data.routes;
    var pages = [];
    var keys = Object.keys(routes);
    var path = undefined,
        valid = undefined;

    keys.forEach(function (key) {
      var output = routes[key];
      path = _path2.default.join(process.cwd(), routes[key]);

      if (!_path2.default.extname(path)) {
        path = path + '.tmpl';
      }

      valid = Pages.isValidPage(path);
      if (!valid) {
        Log.error('The page `' + routes[key] + '` does not exists!');
        return;
      }

      pages.push({ key: key, path: path, output: output });
    });

    Log.mention('Telescope found', pages.length, 'page(s).');

    Pages.pages = pages;

    next();
  },
  isValidPage: function isValidPage(path) {

    // Ignore non template files.
    if (_path2.default.extname(path) !== '.tmpl') {
      return false;
    }

    return _fsExtra2.default.existsSync(path);
  },
  addToQueue: function addToQueue(path) {
    var output = path;
    var routes = Object.keys(_config2.default.data.routes);
    var paths = Object.keys(_config2.default.data.routes).map(function (key) {
      return _config2.default.data.routes[key];
    });

    var pos = paths.indexOf(path);
    if (pos === -1) {
      return;
    }

    var key = routes[pos];
    path = _path2.default.join(process.cwd(), paths[pos]);

    if (!_path2.default.extname(path)) {
      path = path + '.tmpl';
    }

    Pages.queue.push({ key: pos, path: path, output: output });
    Pages.compile();
  },
  compileAll: function compileAll(next) {
    Pages.pages.forEach(function (page) {
      Pages.queue.push(page);
    });

    Pages.compile();
    next();
  },
  compile: function compile() {
    if (Pages.queue.length < 1) {
      return;
    }

    var page = this.queue.shift();
    LivePage = {
      key: page.key,
      path: page.path,
      output: page.output,
      content: _fsExtra2.default.readFileSync(page.path, 'utf-8')
    };

    _async2.default.series([Pages.wrap, Pages.compileReactToEs5, Pages.renderReact, Pages.removeEmptyElements, Pages.compileStylesheets, Pages.createHead, Pages.compress, Pages.store, function (next) {
      Log.success('Page `' + LivePage.key + '` is compiled!');
      Pages.compile();
    }]);
  },
  compileReactToEs5: function compileReactToEs5(next) {
    LivePage.content = Babel.transform(LivePage.content, {
      presets: [BabelEs2015, BabelReact]
    }).code;
    next();
  },
  store: function store(next) {
    var path = _path2.default.join(process.cwd(), 'dist', LivePage.output);

    _fsExtra2.default.mkdirsSync(path);

    _fsExtra2.default.writeFileSync(_path2.default.join(path, 'index.html'), LivePage.content);
    _fsExtra2.default.writeFileSync(_path2.default.join(path, 'style.css'), LivePage.stylesheet);

    next();
  },
  compileStylesheets: function compileStylesheets(next) {
    var content = LivePage.content;
    var stylesheets = [];

    _runtime2.default.components.forEach(function (componentPath) {
      componentPath = componentPath.replace('.cache', '');
      if (!_fsExtra2.default.existsSync(componentPath + '/style.scss')) {
        return;
      }

      stylesheets.push(_nodeSass2.default.renderSync({
        file: componentPath + '/style.scss'
      }).css.toString());
    });

    LivePage.stylesheet = stylesheets.join('');

    next();
  },
  removeEmptyElements: function removeEmptyElements(next) {
    LivePage.content = LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
    next();
  },

  // Gulp methods.
  wrap: function wrap(next) {
    var content = LivePage.content;

    var wrapper = '\n        import React from \'react\';\n        import Header from \'./ui/header\';\n        import Config from \'./ui/config\';\n\n        class Page extends React.Component{\n          render(){\n            return <div>' + content + '</div>;\n          }\n        };\n\n        // Makes require possible.\n        module.exports = Page;\n    ';

    LivePage.content = wrapper;

    next();
  },
  compress: function compress(next) {
    // Add the html wrapper.
    var endfile = ['<html>', '\n\t<head>', '\n\t', LivePage.head, '\n\t</head>', '\n\t\t<body>', '\n\t\t\t', LivePage.content, "<script src=\"http://localhost:35729/livereload.js?snipver=1\"></script>", '\n\t\t</body>', '\n</html>'].join('');

    LivePage.content = endfile;

    next();
  },
  createHead: function createHead(next) {
    var data = _runtime2.default.data;

    var head = ['<title>' + data.title + '</title>', "\n<link href='./style.css' rel='stylesheet' />"].join('');

    LivePage.head = head;

    next();
  },
  renderReact: function renderReact(next) {
    var content = LivePage.content;

    // Store the file.
    var filename = (0, _uid2.default)() + '.tmp';
    var path = _cache2.default.store(undefined, filename, content);

    // Reload the file in js context.
    var Page = undefined;
    try {
      Page = require(path);
    } catch (error) {
      Log.error('An error occured in page `' + LivePage.key + '`: ', error);
      return;
    }

    // Removed the cached file.
    _cache2.default.remove(undefined, filename);

    // Create React element from the react component.
    var element = _react2.default.createElement(Page);

    // Render the element into static html.
    var html = _server2.default.renderToStaticMarkup(element);

    // Remove the unnecessary div.
    html = html.substr(5, html.length - 5);

    LivePage.content = html;

    next();
  }
};

exports.default = Pages;