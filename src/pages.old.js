import Fs from 'fs-extra';
import Path from 'path';
import Config from './config';
import Gulp from 'gulp';
import Through from 'through2';
import GulpBabel from 'gulp-babel';
import React from 'react';
import ReactDom from 'react-dom/server';
import Uid from 'uid';
import Cache from './cache';
import Runtime from './runtime';
import Sass from 'node-sass';
import Async from 'async';

const Babel = require('babel-core');
const BabelEs2015 = require('babel-preset-es2015');
const BabelReact = require('babel-preset-react');

// Logging...
import Logger from './logger';
let Log = Logger.level('Pages');

let LivePage = undefined;

let Pages = {
  pages: [],
  queue:[],

  createIndex(next){
    let routes = Config.data.routes;
    let pages = [];
    let keys = Object.keys(routes);
    let path, valid;
    
    keys.forEach((key) => {
      let output = routes[key];
      path = Path.join(process.cwd(), routes[key]);

      if(!Path.extname(path)){
        path = path + '.tmpl';
      }

      valid = Pages.isValidPage(path);
      if(!valid){
        Log.error('The page `'+routes[key]+'` does not exists!');
        return;
      }

      pages.push({key, path, output});
    });

    Log.mention('Telescope found', pages.length, 'page(s).');

    Pages.pages = pages;

    next();
  },


  isValidPage(path){

    // Ignore non template files.
    if(Path.extname(path) !== '.tmpl'){
      return false;
    }

    return Fs.existsSync(path);
  },

  addToQueue(path){
    let output = path;
    let routes = Object.keys(Config.data.routes);
    let paths = Object.keys(Config.data.routes).map(key => Config.data.routes[key]);

    let pos = paths.indexOf(path);
    if(pos === -1){ return; }

    let key = routes[pos];
    path = Path.join(process.cwd(), paths[pos]);

    if(!Path.extname(path)){
        path = path + '.tmpl';
      }

      Pages.queue.push({key: pos, path, output});
      Pages.compile();
  },

  compileAll(next){
    Pages.pages.forEach((page) => {
      Pages.queue.push(page);
    });

    Pages.compile();
    next();
  },

  compile(){
    if(Pages.queue.length < 1){
      return;
    }

    let page = this.queue.shift();
    LivePage = {
      key: page.key,
      path: page.path,
      output: page.output,
      content: Fs.readFileSync(page.path, 'utf-8')
    };

    Async.series([
      Pages.wrap,
      Pages.compileReactToEs5,
      Pages.renderReact,
      Pages.removeEmptyElements,
      Pages.compileStylesheets,
      Pages.createHead,
      Pages.compress,
      Pages.store,
      (next) => {
        Log.success('Page `' + LivePage.key + '` is compiled!');
        Pages.compile();
      }
    ]);
  },

  compileReactToEs5(next){
    LivePage.content = Babel.transform(LivePage.content, {
      presets: [BabelEs2015, BabelReact]
    }).code;
    next();
  },

  store(next){
    let path = Path.join(process.cwd(), 'dist', LivePage.output);

    Fs.mkdirsSync(path);

    Fs.writeFileSync(Path.join(path, 'index.html'), LivePage.content);
    Fs.writeFileSync(Path.join(path, 'style.css'), LivePage.stylesheet);

    next();
  },

  compileStylesheets(next){
    let content = LivePage.content;
    let stylesheets = [];

    Runtime.components.forEach((componentPath) => {
      componentPath = componentPath.replace('.cache', '');
      if(!Fs.existsSync(componentPath+'/style.scss')){
        return;
      }

      stylesheets.push(
        Sass.renderSync({
          file: componentPath+'/style.scss'
        }).css.toString()
      );
    });

    LivePage.stylesheet = stylesheets.join('');

    next();
  },

  removeEmptyElements(next){
    LivePage.content = LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
    next();
  },

  // Gulp methods.
  wrap(next){
    let content = LivePage.content;

    let wrapper = `
        import React from 'react';
        import Header from './ui/header';
        import Config from './ui/config';

        class Page extends React.Component{
          render(){
            return <div>${content}</div>;
          }
        };

        // Makes require possible.
        module.exports = Page;
    `;

    LivePage.content = wrapper;

    next();
  },

  compress(next){
    // Add the html wrapper.
    let endfile = [
      '<html>',
      '\n\t<head>',
      '\n\t',
      LivePage.head,
      '\n\t</head>',
      '\n\t\t<body>',
      '\n\t\t\t',
      LivePage.content,
      "<script src=\"http://localhost:35729/livereload.js?snipver=1\"></script>",
      '\n\t\t</body>',
      '\n</html>'
    ].join('')
  
    LivePage.content = endfile;

    next();
  },

  createHead(next){
    let data = Runtime.data;

    let head = [
      '<title>' + data.title + '</title>',
      "\n<link href='./style.css' rel='stylesheet' />",
    ].join('');

    LivePage.head = head;

    next();
  },

  renderReact(next){
      let content = LivePage.content;

      // Store the file.
      let filename = Uid()+'.tmp';
      let path = Cache.store(undefined, filename, content);

      // Reload the file in js context.
      let Page;
      try{
        Page = require(path);
      }catch(error){
        Log.error('An error occured in page `' + LivePage.key + '`: ', error);
        return;
      }

      // Removed the cached file.
      Cache.remove(undefined, filename);
      
      // Create React element from the react component.
      let element = React.createElement(Page);

      // Render the element into static html.
      let html = ReactDom.renderToStaticMarkup(element);

      // Remove the unnecessary div.
      html =  html.substr(5,html.length-5);

      LivePage.content = html;

      next();
  }

};

export default Pages;