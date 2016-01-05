import React from 'react';
import Component from '../component';
import Runtime from '../runtime';

class Config extends Component{
  render(){
    Runtime.add('title', this.props.title);
    return <telescope-empty-element/>;
  }
}

export default Config;