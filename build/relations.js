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