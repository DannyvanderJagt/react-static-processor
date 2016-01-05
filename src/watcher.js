import Chokidar from 'chokidar';
import Pages from './pages';
import UI from './ui';
import Path from 'path';
import Util from 'util';

import Logger from './logger';
let Log = Logger.level('Watcher');

let Watcher = {

  // UI.
  watchUI(next){
    Chokidar.watch('ui/**/*.*', {
      ignoreInitial: false, 
      cwd: process.cwd(), 
      ignored: /[\/\\]\./
    })
    .on('ready', Watcher.onUIReady)
    .on('close', Watcher.onUIClose)
    .on('all', Watcher.onUI);

    if(next && Util.isFunction(next)){
      next();
    }
  },

  // Callback events.
  onUIReady(){
    Log.success('Watching UI components...');
    UI.initialReadDone();
  },
  onUIClose(){
    Log.alert('Stopped watching UI components...');
  },
  onUI(event, path){
    // On initial read we only compile
    // when an .js file is found.
    if(UI.initialRead === false && Path.extname(path) !== '.js'){
      return;
    } 

    // Get the component file name.
    let arrPath = path.split('/');
    if(!arrPath[1]){ return; }

    let componentName = arrPath[1];
    UI.compile(componentName);
  },

  // Pages.
  watchPages(next){
    Chokidar.watch('pages/*.*', {
      ignoreInitial: false, 
      cwd: process.cwd(), 
      ignored: /[\/\\]\./
    })
    .on('ready', Watcher.onPageReady)
    .on('close', Watcher.onPageClose)
    .on('all', Watcher.onPage);


    if(next && Util.isFunction(next)){
      next();
    }
  },

  // Callback events.
  onPageReady(){
    Log.success('Watching pages...');
    Pages.initialReadDone();
  },
  onPageClose(){
    Log.alert('Stopped watching pages...');
  },
  
  onPage(event, path){
    // Get the component file name.
    let arrPath = path.split('/');
    if(!arrPath[1]){ return; }

    let componentName = arrPath[1];

    // Remove the extention.
    componentName = componentName.replace('.tmpl', '');

    Pages.compile(componentName);
  }

};

export default Watcher;