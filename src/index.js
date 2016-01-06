import Async from 'async';
import UI from './ui';
import Config from './config';
import Cache from './cache';
import Pages from './pages';
import Server from './server';
import Watcher from './watcher';
import Pkg from '../package.json';

// Import doesn't work when used in 
// a UI component because 
// of the .default added by babel.
const Component = require('./component');

// Logging.
import Logger from './logger';
let Log = Logger.level('Telescope');

// Welcome message
var welcome = (next) => {
  Log.note('Welcome!')
  next();
};

var leave = () => {
  Log.note(`Thank you for using Telescope.`);
  Log.note(`Have an awesome day!`);
};

var Telescope = {
  Component: Component,
  start(){  
    Async.series([
      welcome,

      Config.load,
        
      // The /ui and /pages directory are required!
      UI.exists,
      Pages.exists,

      // Watch ui components.
      Watcher.watchUI,

      // Wait until all the ui components are compiled.
      UI.waitUntilInitialReadIsDone,

      // Watch pages.
      Watcher.watchPages,

      // Wait until all the pages are compiled.
      Pages.waitUntilInitialReadIsDone,
      
      Watcher.watchConfig,
      Watcher.watchConfigStylesheets,

      Server.start
    ]);
  },
  stop(){
    process.exit();
  }
};

// Remove the cache on exit.
process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  Cache.destroy();
  leave();
});

// Support import es2015.
export default Telescope;
export {Component};

// Support require es5.
module.exports = Telescope;
exports.Component = Component;