import Async from 'async';
import UI from './ui';
import Config from './config';
import Cache from './cache';
import Pages from './pages';
import Server from './server';
import Watcher from './watcher';
import Component from './component';

// Logging.
import Logger from './logger';
let Log = Logger.level('Telescope');

// Compile all the UI elements.
Log.mention('Starting...');


Async.series([
  Config.load,
  
  // Watch ui components.
  Watcher.watchUI,

  // Wait until all the ui components are compiled.
  UI.waitUntilInitialReadIsDone,

  // Watch pages.
  Watcher.watchPages,

  // Wait until all the pages are compiled.
  Pages.waitUntilInitialReadIsDone,

  Server.start

]);

// Remove the cache on exit.
process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  Cache.destroy();
});

export default {};
export {Component};