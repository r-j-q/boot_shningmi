<template>
	<view class="line-progress-w">
		<u-line-progress :percent="70" :round="true" height="40upx"  active-color="#ff9900">
			<view class="u-percentage-slot row-center">
				<text style="font-size: 12px; ">已抢</text>/<text style="margin-right: 20rpx;font-size: 12px;">70%</text>
			 </view>
		</u-line-progress>
		 
	</view>
</template>

<script> 
	export default {
		props: ['currentIndex', 'total'],

		data() {
			return {
				percentage: 80
			}
		},
		watch: {
			currentIndex: function(newVal, oldVal) {
				this.percentage = getApp().percentageLineProgress(newVal + 1, this.total)
			}
		},
		methods: {


		},

	}
</script>

<style scoped lang="scss">
.line-progress-w{
	    width: 100%;
	    // margin: 0 auto;
}
.row-center{
	    display: flex;
	    flex-direction: row;
	    align-items: center;
		color:#7C75F5;
		 
}

</style>
