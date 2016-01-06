import React from 'react';
import Path from 'path';

let RuntimePath = Path.join(process.mainModule.filename, '../../build/runtime.js');
const Runtime = require(RuntimePath);

class Component extends React.Component{
  constructor(props){
    super(props);
    Runtime.registerComponent(this.constructor.name);
  }
};

export default Component;
module.exports = Component;