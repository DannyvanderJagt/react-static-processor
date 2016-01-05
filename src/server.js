import Livereload from 'livereload';

import Logger from './logger';
let Log = Logger.level('Server');

let Server = {
  instance: undefined,
  start(next){
    Server.instance = Livereload.createServer();
    Server.instance.watch(process.cwd() + "/dist");

    Log.log('The server is listening for changes.');

    next();
  }
};

export default Server;