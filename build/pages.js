'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

  createIndex: function createIndex(next) {
    var routes = _config2.default.data.routes;
    var pages = [];
    var keys = Object.keys(routes);
    var path = undefined,
        valid = undefined;

    keys.forEach(function (key) {
      path = _path2.default.join(process.cwd(), routes[key]);

      if (!_path2.default.extname(path)) {
        path = path + '.tmpl';
      }

      valid = Pages.isValidPage(path);
      if (!valid) {
        Log.error('The page `' + routes[key] + '` does not exists!');
        return;
      }

      pages.push(path);
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

    return _fs2.default.existsSync(path);
  },
  compileAll: function compileAll() {
    Pages.pages.forEach(function (page) {
      Pages.compile(page);
    });
  },
  compile: function compile(path) {
    LivePage = {
      content: _fs2.default.readFileSync(path, 'utf-8')
    };

    _async2.default.series([Pages.wrap, Pages.compileReactToEs5, Pages.renderReact, Pages.removeEmptyElements, Pages.compileStylesheets]);

    // Gulp
    //   .src(path)

    //   // Add a react wrap.
    //   .pipe(Pages.wrap())

    //   // Babelify.
    //   .pipe(GulpBabel({
    //     presets: [BabelEs2015, BabelReact]
    //   }))

    //   // Render react.
    //   .pipe(Pages.renderReact())

    //   // React work-around for empty modules.
    //   // See: https://github.com/facebook/react/issues/4550
    //   .pipe(Pages.removeEmptyElements())

    //   // Add Stylesheets.
    //   .pipe(Pages.compileStylesheets())

    //   // Add Header info.
    //   .pipe(Pages.createHeader())

    //   // Compress react, stylesheets and header into one file.
    //   .pipe(Pages.compress())

    //   // Rename.
    //   .pipe(Pages.rename())

    //   // Store.
    //   .pipe(Pages.store());
    // .pipe(Gulp.dest('./dist'))
  },
  compileReactToEs5: function compileReactToEs5(next) {
    LivePage.content = Babel.transform(LivePage.content, {
      presets: [BabelEs2015, BabelReact]
    }).code;
    next();
  },
  store: function store() {
    return _through2.default.obj(function (file, enc, next) {
      var path = file.path.split('/');
      var part = path.slice(path.length - 2, 2);

      part = part.join('');
      console.log('dir', part);
      // Fs.writeFileSync(file.path)
    });
  },
  compileStylesheets: function compileStylesheets(next) {
    var content = LivePage.content;
    var stylesheets = [];

    _runtime2.default.components.forEach(function (componentPath) {
      if (!_fs2.default.existsSync(componentPath + '/style.scss')) {
        return;
      }

      stylesheets.push(_fs2.default.readFileSync(componentPath + '/style.scss'), 'utf-8');
    });

    // Compile to css.
    var css = _nodeSass2.default.renderSync({
      data: stylesheets.join('')
    });

    LivePage.stylesheet = css;

    next();
  },
  removeEmptyElements: function removeEmptyElements(next) {
    LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
    next();
  },

  // Gulp methods.
  wrap: function wrap(next) {
    var content = LivePage.content;

    var wrapper = '\n        import React from \'react\';\n        import Header from \'./ui/header\';\n        import Config from \'./ui/config\';\n\n        class Page extends React.Component{\n          render(){\n            return <div>' + content + '</div>;\n          }\n        };\n\n        // Makes require possible.\n        module.exports = Page;\n    ';

    LivePage.content = wrapper;

    next();
  },
  rename: function rename() {
    return _through2.default.obj(function (file, enc, next) {
      file.path = file.path.replace('.js', '.html');
      next(null, file);
    });
  },
  compress: function compress() {
    return _through2.default.obj(function (file, enc, next) {
      var content = file.contents.toString();
      var head = file.htmlHeader.toString();

      // Add the html wrapper.
      var endfile = ['<html>', '\n\t<head>', '\n\t', head, '\n\t</head>', '\n\t\t<body>', '\n\t\t\t', content, '\n\t\t</body>', '\n</html>'].join('');

      file.contents = new Buffer(endfile);
      next(null, file);
    });
  },
  createHeader: function createHeader() {
    return _through2.default.obj(function (file, enc, next) {
      var data = _runtime2.default.data;

      var header = ['<title>' + data.title + '</title>'].join('');

      file.htmlHeader = new Buffer(header);

      next(null, file);
    });
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
      Log.error('An error occured in page: ', file.path, error);
      return;
    }

    // Removed the cached file.
    _cache2.default.remove(undefined, filename);

    // Create React element from the react component.
    var element = _react2.default.createElement(Page);

    // Render the element into static html.
    var html = _server2.default.renderToStaticMarkup(element);

    LivePage.content = html;
    console.log('html', html);
    next();
  }
};

exports.default = Pages;