"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Runtime = {
  data: {},
  components: [],

  add: function add(tag, data) {
    this.data[tag] = data;
  },
  registerComponent: function registerComponent(path) {
    if (this.components.indexOf(path) === -1) {
      this.components.push(path);
    }
  }
};

exports.default = Runtime;

module.exports = Runtime;