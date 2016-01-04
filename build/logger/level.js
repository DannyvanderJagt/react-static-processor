'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

var _tag = require('./tag');

var _tag2 = _interopRequireDefault(_tag);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Level = function Level(prefix) {
  if (!(this instanceof Level)) {
    return new Level(prefix);
  }

  var tags = {};

  var keys = Object.keys(_index.Tags);
  var name = undefined,
      tag = undefined;

  keys.forEach(function (name) {
    tag = new _tag2.default(prefix || _index.Tags[name][0], _index.Tags[name][1]);
    tags[name] = tag.write.bind(tag);
  });

  return tags;
};

exports.default = Level;