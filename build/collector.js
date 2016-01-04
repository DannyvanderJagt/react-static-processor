'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Collector = {
  data: {},

  add: function add(tag, data) {
    this.data[tag] = data;
    console.log('[Collector][Add] ', tag, data);
  }
};

exports.default = Collector;

module.exports = Collector;