import Chokidar from 'chokidar';
import Pages from './pages';
import UI from './ui';
import Path from 'path';
import Util from 'util';
import Config from './config';

import Logger from './logger';
let Log = Logger.level('Watcher');

let Watcher = {

  // UI.
  watchUI(next){
    Watcher.ui = Chokidar.watch('ui/**/*.*', {
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

  unwatchUI(){
    if(Watcher.ui && Watcher.ui.stop){
      Watcher.ui.stop();
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
    
    if(event === 'unlink' && Path.extname(path) === '.js'){
      UI.removeComponent(componentName);
      return;
    }

    UI.compile(componentName);
  },

  // Pages.
  watchPages(next){
    Watcher.pages = Chokidar.watch('pages/*.*', {
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

  unwatchPages(){
    if(Watcher.pages && Watcher.pages.stop){
      Watcher.pages.stop();
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

    if(event === 'unlink'){
      Pages.removePage(componentName);
      return;
    }

    Pages.compile(componentName);
  },

  watchConfig(next){
    Watcher.config = Chokidar.watch('telescope.config.js', {
      ignoreInitial: true, 
      cwd: process.cwd(), 
      ignored: /[\/\\]\./
    })
    .on('all', Watcher.onConfig);


    if(next && Util.isFunction(next)){
      next();
    }
  },

  unWatchConfig(){
    if(Watcher.config && Watcher.config.close){
      Watcher.config.stop();
    }
  },

  // Callback events.
  onConfig(event, path){
    Config.load();

    Watcher.unwatchPages();
    Watcher.watchPages();
  },

  watchConfigStylesheets(next){
    if(!Config.data.stylesheets){ next(); return; }
    if(!Util.isArray(Config.data.stylesheets)){ next(); return; }

    Watcher.configStylesheets = Chokidar.watch(Config.data.stylesheets, {
      ignoreInitial: true, 
      cwd: process.cwd(), 
      ignored: /[\/\\]\./
    })
    .on('all', Watcher.onConfigStylesheets);

    if(next && Util.isFunction(next)){
      next();
    }
  },

  onConfigStylesheets(event, path){
    Watcher.unwatchPages();
    Watcher.watchPages();
  },



};

export default Watcher;