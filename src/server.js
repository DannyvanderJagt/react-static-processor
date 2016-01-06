import Livereload from 'livereload';
import Express from 'express';
import Path from 'path';
import ServeIndex from 'serve-index';

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