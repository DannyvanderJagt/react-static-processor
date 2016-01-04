import Async from 'async';
import UI from './ui';
import Config from './config';
import Cache from './cache';
import Pages from './pages';

// Logging.
import Logger from './logger';
let Log = Logger.level('Telescope');

// Compile all the UI elements.
Log.mention('Starting...');


Async.series([
  Config.load,
  Cache.create,
  
  // Ui components.
  UI.createIndex,
  UI.compileAll,

  // Compile pages.
  Pages.createIndex,
  Pages.compileAll


]);

process.on('exit', () => {
  // Cache.destroy();
});