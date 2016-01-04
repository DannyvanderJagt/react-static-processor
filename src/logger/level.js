import {Tags} from './index';
import Tag from './tag';
import Util from 'util';

let Level = function(prefix){
    if(!(this instanceof Level)){
      return new Level(prefix);
    }

    let tags = {};

    let keys = Object.keys(Tags);
    let name, tag;

    keys.forEach((name) => {
      tag = new Tag(prefix || Tags[name][0], Tags[name][1]);
      tags[name] = tag.write.bind(tag);
    });
    
    return tags;
};

export default Level;