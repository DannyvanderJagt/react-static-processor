import Fs from 'fs-extra';
import Path from 'path';

// Logging...
import Logger from './logger';
let Log = Logger.level('Cache');

// Module.
let Cache = {
  path: Path.join(process.cwd(), '.cache'),
  
  destroy(next){
    Fs.removeSync(Cache.path);

    Log.mention('destroyed...');

    if(next){ next(); }
  },
  store(path, content){
    let dirPath;
    let filePath;

    if(Path.extname(path)){
      let parts = path.split('/');
      dirPath = parts.slice(0, parts.length -1).join('/');
      dirPath = Path.join(Cache.path, dirPath);
      filePath = Path.join(Cache.path, path);
    }else{
      Log.error('Can not write due to path error: ', path);
      return;
    }

    Fs.mkdirsSync(dirPath);

    Fs.writeFileSync(filePath, content);
    return filePath;
  },

  // store(path, filename, content){
  //   if(!path){ path = ''};
  //   path = Path.join(Cache.path, path);
  //   Fs.mkdirsSync(path);

  //   path = Path.join(path, filename);

  //   Fs.writeFileSync(path, content);
  //   return path;
  // },
  remove(path){
    path = Path.join(Cache.path, path);

    if(Path.extname(path)){
      Fs.unlinkSync(path);
      return;
    }
    
    Fs.remove(path);
  }
  // remove(path, filename){
  //   if(!path){ path = ''};
  //   path = Path.join(Cache.path, path, filename);
  //   Fs.unlinkSync(path);
  //   return path;
  // }

};

export default Cache;
