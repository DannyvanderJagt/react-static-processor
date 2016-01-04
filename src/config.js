import Fs from 'fs';
import Path from 'path';

// Logging...
import Logger from './logger';
let Log = Logger.level('Config');

// Module.
let Config = {
  path: Path.join(process.cwd(), 'telescope.config.js'),
  data: {},


  load(next){

    // Check existance.
    if(!Fs.existsSync(Config.path)){
      Log.error('The config file can\'t be found!');
      return;
    }

    // Load the file.
    try{
      Config.data = require(Config.path);
    }catch(error){
      Log.error('We couldn\'t load the config file due to this error:', error.message);
      return;
    }

    Log.mention('Loaded');

    next();
  }
}

export default Config;