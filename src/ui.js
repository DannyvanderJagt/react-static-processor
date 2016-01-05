import Path from 'path';
import Fs from 'fs';
import Cache from './cache';
import Relations from './relations';
import Pages from './pages';

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

  getImports(){
    return UI.imports.join('\n');
  },

  addImportStatement(name){
    // Capitialize the first character for React.
    let Uppercase = name[0].toUpperCase();
    name = Uppercase + name.substring(1, name.length);
    
    let importStatement = `import ${name} from './ui/${name}';`;
    let clearCache = `delete require.cache[require.resolve("./ui/${name}")];`;

    if(UI.imports.indexOf(importStatement) === -1){
      UI.imports.push(importStatement);
    }
    if(UI.clearCache.indexOf(clearCache) === -1){
      UI.clearCache.push(clearCache);
    }
  },

  compile(name){
    UI.compileReactComponent(name);
    UI.compileStylesheet(name);

    UI.addImportStatement(name);

    Log.mention('UI Component `'+name+'` is compiled!');

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
    let compiled = Babel.transform(file, {
      presets: [BabelEs2015, BabelReact]
    });

    // Store in cache.
    Cache.store('ui/'+name, 'index.js', compiled.code);
  },

  compileStylesheet(name){
    let path = Path.join(UI.path, name, 'style.scss');

    if(!Fs.existsSync(path)){
      return false;
    }

    let file = Fs.readFileSync(path, 'utf-8');

    // Compile.
    let css = Sass.renderSync({
      file: path
    }).css.toString();

    // Store in cache.
    Cache.store('ui/'+name, 'style.css', css);
  }

};

export default UI;