import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VideoPlayer from '@/components/Player.vue'
import Downloader from '@/components/Downloader.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/d',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/video.html',
      name: 'VideoPlayer',
      component: VideoPlayer
    },
    {
      path: '/download',
      name: 'Downloader',
      component: Downloader
    }
  ]
})
