'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tags = undefined;

var _tag = require('./tag');

var _tag2 = _interopRequireDefault(_tag);

var _level = require('./level');

var _level2 = _interopRequireDefault(_level);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tags = {
  log: ['Log', 'green'],
  error: ['Error', 'red'],
  mention: ['Mention', 'gray']
};

exports.Tags = Tags;

var Log = new _level2.default();
Log.level = _level2.default;

exports.default = Log;