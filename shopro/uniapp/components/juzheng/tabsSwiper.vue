

<template>
  <view>
    <v-tabs v-model="current" :tabs="tabs" @change="changeTab"></v-tabs> 
  </view>
</template>

<script>
export default {
  data() {
    return {
		current: 0,
		tabs: ['直播任务', '视频任务'] 

    };
  },


  methods: {

 changeTab(index) {
       console.log('当前选中的项：' + index)
     },
  }
};
</script>

<style> 

</style>