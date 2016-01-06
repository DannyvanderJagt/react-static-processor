import Livereload from 'livereload';
import Express from 'express';
import Path from 'path';
import Util from 'util';
import ServeIndex from 'serve-index';
import Config from './config';

import Logger from './logger';
let Log = Logger.level('Server');

let Server = {
  livereload: undefined,
  server: undefined,
  app: undefined, 

  start(next){
    let path = Path.join(process.cwd() , 'dist');
    
    // Express server.
    Server.app = Express();

    // Middleware.
    Server.app.use(Express.static(path));
    Server.app.use(ServeIndex(path, {'icons': true}));

    // Config.
    if(Config.data.server && Util.isObject(Config.data.server)){
      let keys = Object.keys(Config.data.server);
      
      keys.forEach((key) => {
        console.log(key, Config.data.server[key]);
        Server.app.use(key, Express.static(Config.data.server[key]));
      });
    }

    Server.server = Server.app.listen(4000, () => {
      let port = Server.server.address().port;
      Log.note('The server is available at: http://localhost:' + port);
    });

    // Live reload server.
    Server.livereload = Livereload.createServer();
    Server.livereload.watch(path);
    Log.note('The server is listening for changes.');

    next();
  }
};

export default Server;