import Tag from './tag';
import Level from './level'

let Tags = {
  log: ['Log', 'green'],
  error: ['Error', 'red'],
  mention: ['Mention', 'gray'],
  success: ['Success', 'gray'],
  alert: ['Alert', 'yellow'],
  note: ['Note', 'cyan']
};

export {Tags};

let Log = new Level();
Log.level = Level;

export default Log;