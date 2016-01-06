import Async from 'async';
import Path from 'path';
import Fs from 'fs-extra';
import Uid from 'uid';
import React from 'react';
import ReactDom from 'react-dom/server';
import Util from 'util';
import Sass from 'node-sass';

import Pages from './pages';
import UI from './ui';
import Runtime from './runtime';
import Cache from './cache';
import Relations from './relations';
import Dist from './dist';
import Config from './config';

// Babel has to be load the old fashion way!
const Babel = require('babel-core');
const BabelEs2015 = require('babel-preset-es2015');
const BabelReact = require('babel-preset-react');

// Logging...
import Logger from './logger';
let Log = Logger.level('Pages');

// Data for the page we are compiling.
let LivePage = undefined;

let Compiler = {
  queue: [],
  compile(name, cb){
    Compiler.queue.push({name, cb});

    if(LivePage === undefined){
      Compiler.execute();
    }
  },

  abort(error){
    Log.error(LivePage.name, 'stopped compiling due to this error: ', error);
  },

  execute(){
    if(Compiler.queue.length === 0){ 
      return;
    }

    LivePage = undefined;

    // Copy over the data.
    LivePage = Compiler.queue.pop();

    Async.series([
      Compiler.exists,
      Compiler.getContent,
      Compiler.addReactWrapper,

      Compiler.compileReact,
      Compiler.renderReactToHtml,
      Compiler.removeEmptyElements,

      Compiler.storeUsedUIComponents,

      Compiler.compileStylesheets,

      Compiler.createHeadTag,

      Compiler.compileIntoHtmlPage,

      // Store the file.
      Compiler.store
    ], () => {
      Log.success('Compiled page:', LivePage.name);

      LivePage = undefined;
      Compiler.execute();
    });
  },

  // Compiler methods...
  
  // Check if the page really exists.
  exists(next){
    let name = LivePage.name;
    let path = Path.join(Pages.path, name);

    if(!Fs.existsSync(path + '/index.tmpl')){
      Compiler.abort('The .tmpl file does not exist!');
      return;
    }

    LivePage.path = path;

    next();
  },

  getContent(next){
    try{
      LivePage.content = Fs.readFileSync(Path.join(LivePage.path, 'index.tmpl'), 'utf-8');
    }catch(error){
      Compiler.abort('The file could not be loaded!')
    }

    next();
  },
  
  addReactWrapper(next){
    let imports = UI.getImports();
    let clearCache = UI.clearCache.join('\n');

    // Note: Indentation is not a point here
    // the outputed file will be only be used by this module.
    let wrapper = `

      ${clearCache}
      import React from 'react';
      import Config from '${Path.join(__dirname, 'ui/config')}';
      ${imports}
    
      class Page extends React.Component{
        render(){
          return (<div>${LivePage.content}</div>);
        }
      };

      module.exports = Page;
    `;

    LivePage.content = wrapper;

    next();
  },

  // Compile all the react code to es5.
  compileReact(next){
    try{
      LivePage.content = Babel.transform(LivePage.content, {
        presets: [BabelEs2015, BabelReact]
      }).code;
    }catch(error){
      Compiler.abort(error);
      return;
    }
    next();
  },

  renderReactToHtml(next){
    let tempFilename = Uid() + '.tmp';

    // Store the content in a temporary file.
    let path = Cache.store(tempFilename, LivePage.content);

    // Reload the content from the temporary file.
    // We write the content to a file and required it here
    // to execute the code and keep the original context.
    let Page; // React Page component.
    try{
      Page = require(path);
    }catch(error){
      Log.error('React could not be rendered due to: ');
      console.log(error);
      console.log(error.stack);
      return;
    }
    // Remove the temporary file.
    Cache.remove(tempFilename);

    // Create the react Element from the Page component.
    let element;
    try{
      element = React.createElement(Page);
    }catch(error){
      Log.error('React could not create an element of your page: ');
      console.log(error);
      return;
    }

    // Render the element into static html.
    let html;
    try{
      html = ReactDom.renderToStaticMarkup(element);
    }catch(error){
      Log.error('React could not render the page into static html: ');
      console.log(error);
      return;
    }

    // Remove the unnecessary react wrapper div.
    html = html.substr(5,html.length-11);
    
    LivePage.content = html;

    next();
  },

  // Used to fix a React issue internally.
  // See: https://github.com/facebook/react/issues/4550
  // Removes: <telescope-empty-element></telescope-empty-element>
  removeEmptyElements(next){
    LivePage.content = LivePage.content.replace(/<telescope-empty-element><\/telescope-empty-element>/g, '');
    next();
  },

  storeUsedUIComponents(next){
    Relations.setPageComponents(LivePage.name, Runtime.components);
    next();
  },

  compileStylesheets(next){
    let content = LivePage.content;
    let stylesheets = [];
    let path;

    // Read config.
    if(Config.data.stylesheets && Util.isArray(Config.data.stylesheets)){

      Config.data.stylesheets.forEach((path) => {
        path = Path.join(path);
        if(!Fs.existsSync(path)){
          return;
        }
        
        if(Path.extname(path) === '.scss'){
          try{
            stylesheets.push(
              Sass.renderSync({
                file: path
              }).css.toString()
            )
          }catch(error){
            Compiler.abort(error);
          }
          return;
        }

        stylesheets.push(
          Fs.readFileSync(path, 'utf-8')
        );
      })
    }

    Runtime.components.forEach((component) => {
      path = Path.join(process.cwd(), '.cache/ui', component, 'style.css');
      if(!Fs.existsSync(path)){
        return;
      }

      stylesheets.push(
        Fs.readFileSync(path, 'utf-8')
      );
    });

    if(Fs.existsSync(Path.join(LivePage.path, 'style.scss'))){
      try{
        stylesheets.push(
          Sass.renderSync({
            file: Path.join(LivePage.path, 'style.scss')
          }).css.toString()
        )
      }catch(error){
        Compiler.abort(error);
      }
    }

    LivePage.stylesheet = stylesheets.join('');

    next();
  },

  createHeadTag(next){
    let data = Runtime.data;

    let head = [
      '<title>' + data.title + '</title>',
      "\n<link href='./style.css' rel='stylesheet' />",
    ].join('');

    if(Config.data.head){
      head = head.concat(Config.data.head);
    }

    LivePage.head = head;

    next();
  },

  compileIntoHtmlPage(next){
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

  store(next){
    Dist.store(Path.join(LivePage.name, 'index.html'), LivePage.content);
    Dist.store(Path.join(LivePage.name, 'style.css'), LivePage.stylesheet);
    
    next();
  }
  
  
};

export default Compiler;