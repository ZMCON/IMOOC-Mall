// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import axios from 'axios'
import VueAxios from 'vue-axios'
import infiniteScroll from 'vue-infinite-scroll'
import { currency } from './util/currency'
import Vuex from 'vuex'


axios.defaults.withCredentials = true
Vue.prototype.$axios = axios;

Vue.use(VueLazyLoad, {
  loading: '/static/loading-svg/loading-bars.svg'
})

Vue.use(infiniteScroll);

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    nickName: '',
    cartCount: 0
  },
  mutations: {
    updateUserInfo(state, nickName){
      state.nickName = nickName
    },

    updateCartCount(state, cartCount){
      state.cartCount += cartCount;
    },

    logoutCartCount(state){
      state.cartCount = 0;
    },

    initCartCount(state, cartCount){
      state.cartCount = cartCount
    }
  }
})

Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.filter('currency', currency); // 全局过滤器

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})