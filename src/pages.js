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

import Compiler from './compiler';

// Logging...
import Logger from './logger';
let Log = Logger.level('Pages');


let Pages = {
  path: Path.join(process.cwd(), 'pages'),
  
  initialRead: false,
  initialReadWaiter: undefined,

  initialReadDone(){
    Pages.initialRead = true;

    if(Pages.initialReadWaiter){
      let waiter = Pages.initialReadWaiter;
      Pages.initialReadWaiter = undefined;

      waiter();
    }
  },

  waitUntilInitialReadIsDone(next){
    Pages.initialReadWaiter = next;
  },

  compile(name){
    Compiler.compile(name);
    Log.mention('Compiling page: ', name);
  }


};

export default Pages;