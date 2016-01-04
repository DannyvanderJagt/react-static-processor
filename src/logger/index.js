import Tag from './tag';
import Level from './level'

let Tags = {
  log: ['Log', 'green'],
  error: ['Error', 'red'],
  mention: ['Mention', 'gray']
};

export {Tags};

let Log = new Level();
Log.level = Level;

export default Log;