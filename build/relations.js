'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Relations = {

  // ui component - page.
  ui: {
    'Header': ['index', 'aboutme']
  },
  pages: {
    'aboutme': ['Header']
  },

  getUIRelations: function getUIRelations(name) {
    return Relations.ui[name] || [];
  },
  removeUIComponent: function removeUIComponent(name) {
    name = name.toLowerCase();

    if (Relations.ui[name]) {
      delete Relations.ui[name];
    }

    var pages = Object.keys(Relations.pages);
    var pos = undefined;

    pages.forEach(function (page) {
      pos = Relations.pages[page].indexOf(name);
      if (pos === -1) {
        return;
      }
      Relations.pages[page].splice(pos, 1);
    });
  },
  removePage: function removePage(name) {
    name = name.toLowerCase();

    if (Relations.pages[name]) {
      delete Relations.pages[name];
    }

    var components = Object.keys(Relations.ui);
    var pos = undefined;

    components.forEach(function (component) {
      pos = Relations.ui[component].indexOf(name);
      if (pos === -1) {
        return;
      }
      Relations.ui[component].splice(pos, 1);
    });
  },
  setPageComponents: function setPageComponents(pageName, components) {
    // Get the difference.
    var old = Relations.pages[pageName] || [];

    var pos = undefined;

    // Remove all the old ones.
    old.forEach(function (com) {
      com = com.toLowerCase();
      if (!Relations.ui[com]) {
        return;
      }
      pos = Relations.ui[com].indexOf(pageName);

      if (pos === -1) {
        return;
      }
      Relations.ui[com].splice(pos, 1);
    });

    var current = components;

    // Add the new ones.
    current.forEach(function (com) {
      com = com.toLowerCase();
      if (!Relations.ui[com]) {
        Relations.ui[com] = [];
      }
      pos = Relations.ui[com].indexOf(pageName);

      if (pos !== -1) {
        return;
      }

      Relations.ui[com].push(pageName);
    });

    Relations.pages[pageName] = current;
  }
};

exports.default = Relations;