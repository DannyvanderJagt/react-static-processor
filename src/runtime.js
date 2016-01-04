let Runtime = {
  data:{},
  components: [],

  add(tag, data){
    this.data[tag] = data;
    console.log('[Collector][Add] ', tag, data);
  },

  register(path){
    if(this.components.indexOf(path) === -1){
      this.components.push(path);
    }
  }

};

export default Runtime;
module.exports = Runtime;