import Fs from 'fs-extra';
import Path from 'path';
import Config from './config';

import Through from 'through2';
import React from 'react';
import ReactDom from 'react-dom/server';
import Uid from 'uid';
import Cache from './cache';
import Runtime from './runtime';
import Sass from 'node-sass';
import Async from 'async';

import Compiler from './compiler';
import Relations from './relations';
import Dist from './dist';

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

  removePage(name){
    Relations.removePage(name);
    
    Dist.remove(name);

    Log.mention('Page `' + name + '` is removed!');
  },

  waitUntilInitialReadIsDone(next){
    Pages.initialReadWaiter = next;
  },

  compile(name){
    Compiler.compile(name);
  }


};

export default Pages;