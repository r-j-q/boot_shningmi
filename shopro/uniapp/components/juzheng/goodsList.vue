<template>
	<view class="goodsList" @click="nagatorToDetail">
		<view class="goodsListTop">
			<view class="goodsListTopImg">
				<image src="http://file.shopro.top/uploads/20210519/356bead1ea234354168954aa55e98d7a.jpeg" alt=""
					srcset="">
			</view>
			<view class="goodsListTopText">
				<view class="goodsListTopTitle ellipsis2">杨先生黑芝麻芡实糕八珍杨先生黑芝麻芡实糕八珍杨先生黑芝麻芡实糕八珍 </view>
				<view class="goodsListTag m20 ">
					短视频任务
				</view>
				<view class="goodsListMonly m20">
					最高奖励5元
				</view>
				<view class="goodsListjy m20">
					<view class="as1">价格：¥19.90 </view>
					<view class="as2">佣金：¥19.90 </view>
				</view>
				<view class="m20">
					<LineProgress  :currentIndex="11" :total="100"/>
				</view>
			</view>
		</view>
		<view class="goodsListbottom">
              <view class="goodsListbottomLeft">
              	 <view class=""><h4>奖励规则</h4> </view>
              	 <view class="colorC m20"><h6>粉丝数3000～10000 奖励2元</h6> </view>
              	 <view class="colorC m20"><h6>粉丝数10001～50000 奖励5元</h6> </view>
              </view>
			  <view class="goodsListbottomRight">
			  <view class="goodsListbottomRightLeft">
			  	<view class=""><h4>参与要求</h4> </view>
			  	 <view class="colorC m20"><h6>粉丝数≥3000 </h6> </view>
			  	<view class="colorC m20"><h6>橱销≥0</h6> </view>
			  	<view class="colorC m20"><h6>积分≥500.0</h6> </view>
			  </view>
			  <view class="goodsListbottomRightRight">
			  	 <view class="buttomOver">
			  	 	已领完
			  	 </view>
			  </view>
			  </view>
			 
		</view>
	</view>
</template>

<script>
	import LineProgress from "./lineProgress.vue"
	export default {
				components: {LineProgress},
		data() {
			return {


			};
		},


		methods: {
             nagatorToDetail(){
				uni.navigateTo({
					url:"/pages/dkdetail/detail"
				})
			 }

		}
	};
</script>

<style scoped>
	.goodsList {
	 
		overflow: hidden;
	      margin-bottom: 30upx;
	}
	 

	.goodsListjy {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: #7972a8;
		font-size: 12px;
	}

	.as1 {
		margin-right: 20upx;
	}

	.as2 {}

	.goodsListTop {
		display: flex;
		flex-direction: row;
		padding: 20upx;
		border-bottom: .5px solid #ccc;
		background-color: #fff;
	}

	.goodsListTopImg {
		width: 330upx;
		height: 330upx;
		overflow: hidden;
		border-radius: 4px
	}

	.goodsListTopImg image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.goodsListTopText {
		flex: 1;
		margin-left: 20upx;
	}

	.goodsListTopTitle {
		color: #333;
		font-size: 16px;
		font-weight: bold;
	}

	.ellipsis2 {
		text-overflow: -o-ellipsis-lastline;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical
	}

	.goodsListTag {
		color: #7C75F5;
		font-size: 12px;
	 width: 160upx;
	 height: 50upx;
	 line-height: 50upx;
	 text-align: center;
		background-color: #F3E5F6;
		border-radius: 8upx;
	}

	.goodsListMonly {
		color: #7972a8;
		font-size: 40upx;
		font-weight: bold;
	}
	.m20{
		margin-top: 20upx;
		 
	}
	.goodsListbottom{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
	}
	.goodsListbottomLeft{
		flex: 1;
		height: 300upx;
		padding: 60upx;
	}
	.colorC{
		color: #999;
	}
	.goodsListbottomRight{
		flex: 1;
		height: 300upx; 
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.goodsListbottomRightLeft{
		flex: 1;
	}
	.goodsListbottomRightRight{
		flex: 1;
	}
	.buttomOver{
		width: 120upx;
		height: 120upx;
		line-height: 120upx;
		text-align: center;
		border-radius: 60upx;
		color: #fff;
		background-color:#ff9900 ;
	}
</style>
