'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Runtime = {
  data: {},
  components: [],

  add: function add(tag, data) {
    this.data[tag] = data;
    console.log('[Collector][Add] ', tag, data);
  },
  register: function register(path) {
    if (this.components.indexOf(path) === -1) {
      this.components.push(path);
    }
  }
};

exports.default = Runtime;

module.exports = Runtime;