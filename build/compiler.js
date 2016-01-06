'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _uid = require('uid');

var _uid2 = _interopRequireDefault(_uid);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _relations = require('./relations');

var _relations2 = _interopRequireDefault(_relations);

var _dist = require('./dist');

var _dist2 = _interopRequireDefault(_dist);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

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
    Compiler.queue.push({ name: name, cb: cb });

    if (LivePage === undefined) {
      Compiler.execute();
    }
  },
  abort: function abort(error) {
    Log.error(LivePage.name, 'stopped compiling due to this error: ', error);
  },
  execute: function execute() {
    if (Compiler.queue.length === 0) {
      return;
    }

    LivePage = undefined;

    // Copy over the data.
    LivePage = Compiler.queue.pop();

    _async2.default.series([Compiler.exists, Compiler.getContent, Compiler.addReactWrapper, Compiler.compileReact, Compiler.renderReactToHtml, Compiler.removeEmptyElements, Compiler.storeUsedUIComponents, Compiler.compileStylesheets, Compiler.createHeadTag, Compiler.compileIntoHtmlPage,

    // Store the file.
    Compiler.store], function () {
      Log.success('Compiled page:', LivePage.name);

      LivePage = undefined;
      Compiler.execute();
    });
  },

  // Compiler methods...

  // Check if the page really exists.
  exists: function exists(next) {
    var name = LivePage.name;
    var path = _path2.default.join(_pages2.default.path, name) + '.tmpl';

    if (!_fsExtra2.default.existsSync(path)) {
      Compiler.abort('The .tmpl file does not exist!');
      return;
    }

    LivePage.path = path;

    next();
  },
  getContent: function getContent(next) {
    try {
      LivePage.content = _fsExtra2.default.readFileSync(LivePage.path, 'utf-8');
    } catch (error) {
      Compiler.abort('The file could not be loaded!');
    }

    next();
  },
  addReactWrapper: function addReactWrapper(next) {
    var imports = _ui2.default.getImports();
    var clearCache = _ui2.default.clearCache.join('\n');

    // Note: Indentation is not a point here
    // the outputed file will be only be used by this module.
    var wrapper = '\n\n      ' + clearCache + '\n      import React from \'react\';\n      import Config from \'' + _path2.default.join(__dirname, 'ui/config') + '\';\n      ' + imports + '\n    \n      class Page extends React.Component{\n        render(){\n          return (<div>' + LivePage.content + '</div>);\n        }\n      };\n\n      module.exports = Page;\n    ';

    LivePage.content = wrapper;

    next();
  },

  // Compile all the react code to es5.
  compileReact: function compileReact(next) {
    try {
      LivePage.content = Babel.transform(LivePage.content, {
        presets: [BabelEs2015, BabelReact]
      }).code;
    } catch (error) {
      Compiler.abort(error);
      return;
    }
    next();
  },
  renderReactToHtml: function renderReactToHtml(next) {
    var tempFilename = (0, _uid2.default)() + '.tmp';

    // Store the content in a temporary file.
    var path = _cache2.default.store(tempFilename, LivePage.content);

    // Reload the content from the temporary file.
    // We write the content to a file and required it here
    // to execute the code and keep the original context.
    var Page = undefined; // React Page component.
    try {
      Page = require(path);
    } catch (error) {
      Log.error('React could not be rendered due to: ');
      console.log(error);
      console.log(error.stack);
      return;
    }
    // Remove the temporary file.
    _cache2.default.remove(tempFilename);

    // Create the react Element from the Page component.
    var element = undefined;
    try {
      element = _react2.default.createElement(Page);
    } catch (error) {
      Log.error('React could not create an element of your page: ');
      console.log(error);
      return;
    }

    // Render the element into static html.
    var html = undefined;
    try {
      html = _server2.default.renderToStaticMarkup(element);
    } catch (error) {
      Log.error('React could not render the page into static html: ');
      console.log(error);
      return;
    }

    // Remove the unnecessary react wrapper div.
    html = html.substr(5, html.length - 11);

    LivePage.content = html;

    next();
  },

  // Used to fix a React issue internally.
  // See: https://github.com/facebook/react/issues/4550
  // Removes: <telescope-empty-element></telescope-empty-element>
  removeEmptyElements: function removeEmptyElements(next) {
    LivePage.content = LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
    next();
  },
  storeUsedUIComponents: function storeUsedUIComponents(next) {
    _relations2.default.setPageComponents(LivePage.name, _runtime2.default.components);
    next();
  },
  compileStylesheets: function compileStylesheets(next) {
    var content = LivePage.content;
    var stylesheets = [];
    var path = undefined;

    // Read config.
    if (_config2.default.data.stylesheets && _util2.default.isArray(_config2.default.data.stylesheets)) {

      _config2.default.data.stylesheets.forEach(function (path) {
        path = _path2.default.join(path);
        if (!_fsExtra2.default.existsSync(path)) {
          return;
        }

        if (_path2.default.extname() === '.scss') {
          try {
            stylesheets.push(_nodeSass2.default.renderSync({
              file: path
            }).css.toString());
          } catch (error) {
            Compiler.abort(error);
          }
          return;
        }

        stylesheets.push(_fsExtra2.default.readFileSync(path, 'utf-8'));
      });
    }

    _runtime2.default.components.forEach(function (component) {
      path = _path2.default.join(process.cwd(), '.cache/ui', component, 'style.css');
      if (!_fsExtra2.default.existsSync(path)) {
        return;
      }

      stylesheets.push(_fsExtra2.default.readFileSync(path, 'utf-8'));
    });

    LivePage.stylesheet = stylesheets.join('');

    next();
  },
  createHeadTag: function createHeadTag(next) {
    var data = _runtime2.default.data;

    var head = ['<title>' + data.title + '</title>', "\n<link href='./style.css' rel='stylesheet' />"].join('');

    if (_config2.default.data.head) {
      head = head.concat(_config2.default.data.head);
    }

    LivePage.head = head;

    next();
  },
  compileIntoHtmlPage: function compileIntoHtmlPage(next) {
    // Add the html wrapper.
    var endfile = ['<html>', '\n\t<head>', '\n\t', LivePage.head, '\n\t</head>', '\n\t\t<body>', '\n\t\t\t', LivePage.content, "<script src=\"http://localhost:35729/livereload.js?snipver=1\"></script>", '\n\t\t</body>', '\n</html>'].join('');

    LivePage.content = endfile;

    next();
  },
  store: function store(next) {
    _dist2.default.store(_path2.default.join(LivePage.name, 'index.html'), LivePage.content);
    _dist2.default.store(_path2.default.join(LivePage.name, 'style.css'), LivePage.stylesheet);

    next();
  }
};

exports.default = Compiler;