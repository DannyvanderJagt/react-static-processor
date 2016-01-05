let Relations = {

  // ui component - page.
  ui: {
    'Header': ['index', 'aboutme']
  },
  pages: {
    'aboutme': ['Header']
  },

  getUIRelations(name){
    return Relations.ui[name] || [];
  },

  setPageComponents(pageName, components){
    // Get the difference.
    let old = Relations.pages[pageName] || [];

    let pos;
    
    // Remove all the old ones.
    old.forEach((com) => {
      com = com.toLowerCase();
      if(!Relations.ui[com]){ return; }
      pos = Relations.ui[com].indexOf(pageName);

      if(pos === -1){ return; }
      Relations.ui[com].splice(pos, 1);
    });

    let current = components;

    // Add the new ones.
    current.forEach((com) => {
      com = com.toLowerCase();
      if(!Relations.ui[com]){ 
        Relations.ui[com] = [];
      }
      pos = Relations.ui[com].indexOf(pageName);

      if(pos !== -1){ return; }

      Relations.ui[com].push(pageName);
    });

    Relations.pages[pageName] = current;
  }
};

export default Relations;