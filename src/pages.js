import Fs from 'fs';
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

  createIndex(next){
    let routes = Config.data.routes;
    let pages = [];
    let keys = Object.keys(routes);
    let path, valid;
    
    keys.forEach((key) => {
      path = Path.join(process.cwd(), routes[key]);

      if(!Path.extname(path)){
        path = path + '.tmpl';
      }

      valid = Pages.isValidPage(path);
      if(!valid){
        Log.error('The page `'+routes[key]+'` does not exists!');
        return;
      }

      pages.push(path);
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

  compileAll(){
    Pages.pages.forEach((page) => {
      Pages.compile(page);
    });
  },

  compile(path){
    LivePage = {
      content: Fs.readFileSync(path, 'utf-8')
    };

    Async.series([
      Pages.wrap,
      Pages.compileReactToEs5,
      Pages.renderReact,
      Pages.removeEmptyElements,
      Pages.compileStylesheets,
    ]);

    // Gulp
    //   .src(path)

    //   // Add a react wrap.
    //   .pipe(Pages.wrap())

    //   // Babelify.
    //   .pipe(GulpBabel({
    //     presets: [BabelEs2015, BabelReact]
    //   }))

    //   // Render react.
    //   .pipe(Pages.renderReact())

    //   // React work-around for empty modules.
    //   // See: https://github.com/facebook/react/issues/4550
    //   .pipe(Pages.removeEmptyElements())

    //   // Add Stylesheets.
    //   .pipe(Pages.compileStylesheets())

    //   // Add Header info.
    //   .pipe(Pages.createHeader())
      
    //   // Compress react, stylesheets and header into one file. 
    //   .pipe(Pages.compress())

    //   // Rename.
    //   .pipe(Pages.rename())

    //   // Store.
    //   .pipe(Pages.store());
      // .pipe(Gulp.dest('./dist'))
  },

  compileReactToEs5(next){
    LivePage.content = Babel.transform(LivePage.content, {
      presets: [BabelEs2015, BabelReact]
    }).code;
    next();
  },

  store(){
    return Through.obj((file, enc, next) => {
      let path = file.path.split('/');
      let part = path.slice(path.length -2 , 2);

      part = part.join('');
      console.log('dir', part);
      // Fs.writeFileSync(file.path)
    });
  },

  compileStylesheets(next){
    let content = LivePage.content;
    let stylesheets = [];

    Runtime.components.forEach((componentPath) => {
      if(!Fs.existsSync(componentPath+'/style.scss')){
        return;
      }

      stylesheets.push(Fs.readFileSync(componentPath+'/style.scss'), 'utf-8');
    });
   
    // Compile to css.
    let css = Sass.renderSync({
      data: stylesheets.join('')
    });

    LivePage.stylesheet = css;

    next();
  },

  removeEmptyElements(next){
    LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
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

  rename(){
    return Through.obj((file, enc, next) => {
      file.path = file.path.replace('.js', '.html');
      next(null, file);
    });
  },

  compress(){
    return Through.obj((file, enc, next) => {
      let content = file.contents.toString();
      let head = file.htmlHeader.toString();

      // Add the html wrapper.
      let endfile = [
        '<html>',
        '\n\t<head>',
        '\n\t',
        head,
        '\n\t</head>',
        '\n\t\t<body>',
        '\n\t\t\t',
        content,
        '\n\t\t</body>',
        '\n</html>'
      ].join('')
    
      file.contents = new Buffer(endfile);
      next(null, file);
    });
  },

  createHeader(){
    return Through.obj((file, enc, next) => {
      let data = Runtime.data;

      let header = [
        '<title>' + data.title + '</title>'
      ].join('');

      file.htmlHeader = new Buffer(header);

      next(null, file);
    });
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
        Log.error('An error occured in page: ', file.path, error);
        return;
      }

      // Removed the cached file.
      Cache.remove(undefined, filename);
      
      // Create React element from the react component.
      let element = React.createElement(Page);

      // Render the element into static html.
      let html = ReactDom.renderToStaticMarkup(element);

      LivePage.content = html;
      console.log('html', html);
      next();
  }

};

export default Pages;