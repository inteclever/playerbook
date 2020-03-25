
     
<template> 
  <video style="width:100%" height="300"  id="playerbook" 
    class="video-js"
    poster='../assets/img/poster.jpg' playsinline controls>
  </video>
</template>


<script>
// require styles
//import Plyr from 'plyr';
//import 'plyr/dist/plyr.css';
import videojs from'video.js'
import 'video.js/dist/video-js.min.css'
export default{
  name: 'VideoPlayer',
  data(){
    return{
      timingConfig : require('../../timingConfig.json'),
      player       : null,
      advIndex     : 0,
      adverstsScope: [],
      patnersScope : [],
      player       : null,
      indexPlaying : 0,
      indexCategory: 3,
      advIteration : [],
      appDirectory : '',
    }
  },
  mounted(){
    document.addEventListener("deviceready", 
      this.inizializePlayer
    , false);
  },
  beforeDestroy(){
    document.removeEventListener('deviceready', this.inizializePlayer)
  },
  methods: {
    storageMovies(){ 
      return this.timingConfig.playLists.map((item)=>{
        return {
          src:`${this.appDirectory}${this.getName(item.src)}`, 
          type: item.type,
          category : item.category,
        };
      })
    },
    inizializePlayer(){
      this.appDirectory = `${cordova.file.externalRootDirectory}/playerbook/`;       

      let index       = 0;
      var moviesScope = this.storageMovies();
      console.log(moviesScope);

      this.player = videojs('playerbook',{
        sources: moviesScope,
        autoplay: true,
      });
      let contextPlayer = this.player;

      console.log(this.player)
      this.player.on('ended', event => {
        index++;
        this.indexCategory = moviesScope[index].category;

        this.player.src(moviesScope[index].src);
        console.log(`set src: ${moviesScope[index].src}`);        
        this.player.play();
      });     
      this.setupAdvertsVido();
    },
    getName(url){
        return url.substring(url.lastIndexOf('/')+1);
    },
    setupAdvertsVido(){
      /* sort adv video index - category*/
      console.log('sort video adverts');
      let tmp = [];
      this.adverstsScope = this.timingConfig.adverst.map((item, index)=>{
        console.log(item);
        let pathToLocalVideo = `${this.appDirectory}${this.getName(item.src)}`;
        tmp[item.category] = (typeof tmp[item.category] == "undefined") ? 
                              [...[{'name':item.title, 'src':pathToLocalVideo}]] :
                              [...tmp[item.category], ...[{'name':item.title, 'src':pathToLocalVideo}]]
      });      
      this.adverstsScope = tmp;
      tmp = [];
      
      /* sort patners video index - category*/
      this.timingConfig.patners.map((item, index)=>{
        let pathToLocalVideo = `${this.appDirectory}${this.getName(item.src)}`;
        tmp[item.category] = (typeof tmp[item.category] == "undefined") ? 
                              [...[{'name':item.title, 'src':pathToLocalVideo}]] :
                              [...tmp[item.category], ...[{'name':item.title, 'src':pathToLocalVideo}]]
      });
      this.patnersScope = tmp;
      
      setInterval((()=>{
        let index = (typeof this.advIteration[this.indexCategory] != "undefined") ?
                                          this.advIteration[this.indexCategory] : 0;

        if(typeof this.adverstsScope[this.indexCategory][index].src != "undefined"){
          this.player.pause();
          this.player.src(this.adverstsScope[this.indexCategory][index].src);
          this.player.play();
          this.advIteration[this.indexCategory]++;
        }
      }), this.timingConfig.timeLine * 1000)
    }

  }

};
</script>