<template>
  <div id="app">
    <!--<router-view/>-->
    <VideoPlayer v-if="endSynchronizationCheck" />
    <Downloader @sync="endSynchronization" v-if="!endSynchronizationCheck"/>
  </div>
</template> 

<script>
import VideoPlayer from './components/Player.vue'
import Downloader from './components/Downloader.vue'

export default {
  name: 'App',
  components: {
    VideoPlayer,
    Downloader,
  },
  data(){
    return{
      endSynchronizationCheck: false,
    }
  },
  methods:{
    endSynchronization (value) {
      this.endSynchronizationCheck = value;
      console.log(`SYNCHRONIZATION IS END: ${value} `); // someValue
    }
  }
}
</script> 

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
