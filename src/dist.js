import Path from 'path';
import Fs from 'fs-extra';

// Logging...
import Logger from './logger';
let Log = Logger.level('Dist');

let Dist = {
  path: Path.join(process.cwd(), 'dist'),
  store(path, content){
    let dirPath;
    let filePath;

    if(Path.extname(path)){
      let parts = path.split('/');
      dirPath = parts.slice(0, parts.length -1).join('/');
      dirPath = Path.join(Dist.path, dirPath);
      filePath = Path.join(Dist.path, path);
    }else{
      Log.error('Can not write due to path error: ', path);
      return;
    }

    Fs.mkdirsSync(dirPath);

    Fs.writeFileSync(filePath, content);
  },

  remove(path){
    path = Path.join(Dist.path, path);

    if(Path.extname(path)){
      Fs.unlinkSync(path);
      return;
    }
    
    Fs.remove(path);
  }
};

export default Dist;