import Fs from 'fs-extra';
import Path from 'path';

// Logging...
import Logger from './logger';
let Log = Logger.level('Cache');

// Module.
let Cache = {
  path: Path.join(process.cwd(), '.cache'),
  
  create(next){
    if(Fs.existsSync(Cache.path)){
      Cache.destroy();
    }

    Log.mention('created...');

    Fs.mkdirsSync(Cache.path);

    if(next){ next(); }
  },

  destroy(next){
    Fs.removeSync(Cache.path);

    Log.mention('destroyed...');

    if(next){ next(); }
  },

  store(path, filename, content){
    if(!path){ path = ''};
    path = Path.join(Cache.path, path);
    Fs.mkdirsSync(path);

    path = Path.join(path, filename);

    Fs.writeFileSync(path, content);
    return path;
  },

  remove(path, filename){
    if(!path){ path = ''};
    path = Path.join(Cache.path, path, filename);
    Fs.unlinkSync(path);
    return path;
  }

};

export default Cache;
