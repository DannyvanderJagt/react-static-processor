'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tag = (function () {
  function Tag(tag, color) {
    _classCallCheck(this, Tag);

    this.tag = tag;
    this.color = color;
  }

  _createClass(Tag, [{
    key: 'write',
    value: function write() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var message = [
      // Time
      _chalk2.default.gray(['[', (0, _dateformat2.default)(new Date(), 'HH:MM:ss'), ']'].join('')),

      // Tag.
      _chalk2.default[this.color]([' [', this.tag, '] '].join('')),

      // Message.
      args.join(' ')].join('');

      console.log(message);
    }
  }]);

  return Tag;
})();

exports.default = Tag;