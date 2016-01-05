let Runtime = {
  data:{},
  components: [],

  add(tag, data){
    this.data[tag] = data;
  },

  registerComponent(path){
    if(this.components.indexOf(path) === -1){
      this.components.push(path);
    }
  }

};

export default Runtime;
module.exports = Runtime;