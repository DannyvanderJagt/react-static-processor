import Path from 'path';
import Fs from 'fs';
import Cache from './cache';
import Relations from './relations';
import Pages from './pages';
import Telescope from './index';

import Sass from 'node-sass';

const Babel = require('babel-core');
const BabelEs2015 = require('babel-preset-es2015');
const BabelReact = require('babel-preset-react');

// Logging.
import Logger from './logger';
let Log = Logger.level('UI');

// Module.
let UI = {
  path: Path.join(process.cwd(), 'ui'),
  initialRead: false,
  initialReadWaiter: undefined,

  imports: [],
  clearCache: [],

  exists(next){
    if(!Fs.existsSync(UI.path)){
      Log.error('Please create a ui directory at:', UI.path);
      Telescope.stop();
      return;
    }
    next();
  },

  initialReadDone(){
    UI.initialRead = true;
    if(UI.initialReadWaiter){
      let waiter = UI.initialReadWaiter;
      UI.initialReadWaiter = undefined;

      waiter();
    }
  },

  waitUntilInitialReadIsDone(next){
    UI.initialReadWaiter = next;
  },

  removeComponent(name){
    UI.removeImportStatement(name);
    Relations.removeUIComponent(name);

    Cache.remove('ui/'+name);

    Log.success('UI component `' + name + '` is removed!');
  },

  getImports(){
    return UI.imports.join('\n');
  },

  generateImportStatement(name){
    let Uppercase = name[0].toUpperCase();
    name = Uppercase + name.substring(1, name.length);
    let importStatement = `import ${name} from './ui/${name}';`;
    let clearCache = `delete require.cache[require.resolve("./ui/${name}")];`;
    return {importStatement, clearCache};
  },

  addImportStatement(name){
    let {importStatement, clearCache} = UI.generateImportStatement(name);

    if(UI.imports.indexOf(importStatement) === -1){
      UI.imports.push(importStatement);
    }
    if(UI.clearCache.indexOf(clearCache) === -1){
      UI.clearCache.push(clearCache);
    }
  },

  removeImportStatement(name){
   let {importStatement, clearCache} = UI.generateImportStatement(name);
    
    let pos;
    pos = UI.imports.indexOf(importStatement);
    if(pos !== -1){
      UI.imports.splice(pos, 1);
    }

    pos = UI.clearCache.indexOf(clearCache);
    if(pos === -1){
      UI.clearCache.splice(pos, 1);
    }
  },

  compile(name){
    UI.compileReactComponent(name);
    UI.compileStylesheet(name);

    UI.addImportStatement(name);

    Log.success('UI Component `'+name+'` is compiled!');

    // Recompile pages that are using this ui component.
    let relations = Relations.getUIRelations(name); 
    
    relations.forEach((page) => {
      Pages.compile(page);
    });
  },

  compileReactComponent(name){
    // Load the file.
    let path = Path.join(UI.path, name, 'index.js');

    if(!Fs.existsSync(path)){
      Log.error('UI component does not have an index.js file!');
      return false;
    }

    let file = Fs.readFileSync(path, 'utf-8');

    // Compile.
    let compiled;
    try{
      compiled = Babel.transform(file, {
        presets: [BabelEs2015, BabelReact]
      });
    }catch(error){
      Log.error('Could not compile the .js file of UI component:', name, 'due to:', error); 
      return;
    }

    // Store in cache.
    Cache.store(Path.join('ui',name,'index.js') , compiled.code);
  },

  compileStylesheet(name){
    let path = Path.join(UI.path, name, 'style.scss');

    if(!Fs.existsSync(path)){
      return false;
    }

    let file = Fs.readFileSync(path, 'utf-8');

    // Compile.
    let css;
    try{
      css = Sass.renderSync({
        file: path
      }).css.toString();
    }catch(error){
      Log.error('Could not compile the .scss file of UI component:', name, 'due to:', error); 
      return;
    }
    
    // Store in cache.
    Cache.store(Path.join('ui',name, 'style.css'), css);
  }

};

export default UI;