import util from 'util';
import logger from './index';
import dateFormat from 'dateformat';
import chalk from 'chalk';

class Tag{
  constructor(tag, color){
    this.tag = tag;
    this.color = color;
  }
  write(...args){
    let message = [
      // Time
      chalk.gray([
        '[', dateFormat(new Date(), 'HH:MM:ss'),']'].join('')
      ),

      // Tag.
      chalk[this.color]([
        ' [', this.tag , '] '].join('')
      ),

      // Message.
      args.join(' ')
    ].join('');
    
    console.log(message);
  }
}

export default Tag;