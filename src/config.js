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
      return;
    }

    // Load the file.
    try{
      Config.data = require(Config.path);
    }catch(error){
      Log.error('We couldn\'t load the config file due to this error:', error.message);
      return;
    }

    Log.success('The telescope.config.js is loaded!');

    next();
  }
}

export default Config;