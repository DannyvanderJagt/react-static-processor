import Path from 'path';
import Fs from 'fs';
import Cache from './cache';

const Babel = require('babel-core');
const BabelEs2015 = require('babel-preset-es2015');
const BabelReact = require('babel-preset-react');

// Logging.
import Logger from './logger';
let Log = Logger.level('UI');

// Module.
let UI = {
  path: Path.join(process.cwd(), 'ui'),
  index:{},
  components: [],

  createIndex(next){
    let components = Fs.readdirSync(UI.path);
    let valid;

    components = components.filter((component) => {
      valid = UI.isValidComponent(Path.join(UI.path, component));

      if(!valid){
        Log.error('The component `'+component+'` is missing an index.js file!');
      }

      return valid;
    });

    Log.mention('Telescope found', components.length, 'UI component(s).');

    UI.components = components;

    next();
  },

  isValidComponent(path){
    return Fs.existsSync(Path.join(path, 'index.js'));
  },

  compileAll(next){
    UI.components.forEach((component) => {
      UI.compile(component);
    });

    next();
  },

  compile(name, next){
    // Load the file.
    let path = Path.join(UI.path, name, 'index.js');
    let file = Fs.readFileSync(path, 'utf-8');


    // Compile.
    let compiled = Babel.transform(file, {
      presets: [BabelEs2015, BabelReact]
    });

    // Store in cache.
    Cache.store('ui/'+name, 'index.js', compiled.code);
    
    Log.mention('Component `'+name+'` is compiled!')
  }

};

export default UI;