<template>
	<view>
		 
		<!-- 轮播 -->
		<view class="detaiLunBo">
			<u-swiper height="600" :list="list"></u-swiper>
			<view class="backImg" @click="nativeGetTo">
				<u-icon name="arrow-left" size="40rpx"></u-icon>
			</view>
		</view>
		 
		<!-- 标题 -->
		<view class="detailTitle bcg">
			<h3>杨先生黑芝麻芡实糕八珍杨先生黑芝麻芡实糕八珍杨先生黑芝麻芡实糕八珍</h3>
		</view>
		<view class="deatilSY bcg">
			<view class="deatilSY0">
				<view class="colorc4"> 带货价</view>
				<view class="colorc5 fontW font20 mt"> ¥19.90</view>
			</view>
			<view class="deatilSY0">
				<view class="colorc4"> 预估收益</view>
				<view class="colorc5 fontW font20 mt"> ¥19.90</view>
			</view>
			<view class="deatilSY0">
				<view class="colorc4"> 佣金</view>
				<view class="colorc5 fontW font20 mt"> ¥19.90</view>
			</view>
			<view class="deatilSY0">
				<view class="colorc4"> 公开</view>
				<view class="colorc4 mt"> 90%</view>
			</view>
		</view>
		<view class="bcg">
			<view class="deatilSY   btborder">
				<view class="deatil6">
					<view class="deatilList colorc4">
						<u-icon name="heart-fill" size="40rpx"></u-icon>
						<view class="deatilListText">收藏</view>
					</view>
				</view>
				<view class="deatil6">
					<view class="deatilList colorc4">
						<u-icon name="share-fill" size="40rpx"></u-icon>
						<view class="deatilListText">分享</view>
					</view>
				</view>
				<view class="deatil6">
					<view class="deatilList colorc4">
						<u-icon name="bookmark-fill" size="40rpx"></u-icon>
						<view class="deatilListText">复制</view>
					</view>
				</view>
			</view>
		</view>
		<view class="bcg">
			<view class="">
				<uni-view class="item-title">更换图标</uni-view>
				<view class="colorc4 pdl ptrb">
					<h4 class="pdl mt">抖音账号粉丝≥5000</h4>
				</view>
			</view>
			<view class="">
				<uni-view class="item-title">奖励规则</uni-view>
				<view class="colorc4 pdl ptrb">
					<h4 class="pdl mt">粉丝数5000～10000奖励3.00元</h4>
					<h4 class="pdl mt">粉丝数10001～30000奖励4.00元</h4>
					<h4 class="pdl mt">粉丝数30001～1000000奖励5.00元</h4>
				</view>
			</view>
			<view class="">
				<uni-view class="item-title">任务要求</uni-view>
				<view class="colorc4 pdl ptrb">

				</view>
			</view>
			<view class="">
				<uni-view class="item-title">视频文案</uni-view>
				<view class="colorc4 pdl ptrb">

				</view>
			</view>
			<view class="">
				<uni-view class="item-title">视频展示</uni-view>
				<view class="colorc4 pdl ptrb">

				</view>
			</view>
			<view class="">
				<uni-view class="item-title">带货流程</uni-view>
				<view class="colorc4 pdl ptrb">

				</view>
			</view>

		</view>
		<view class="detailbaobei bcg">
			<center>
				<h4>宝贝详情</h4>
			</center>
			<view style="height: 30px;"> </view>
			<view class="detailbaobeiImg">
				<image mode="widthFix"
					src="https://p26-item.ecombdimg.com/img/ecom-shop-material/v1_hRvdnMEv_71182650133071629160412_115a8e1e4b2b2a9762333ef49edfdd0c_sx_301116_www790-1302~tplv-5mmsx3fupr-resize:790:1302.jpeg">
				</image>
				<image mode="widthFix"
					src="https://p26-item.ecombdimg.com/img/ecom-shop-material/v1_hRvdnMEv_71182650133071629160412_115a8e1e4b2b2a9762333ef49edfdd0c_sx_301116_www790-1302~tplv-5mmsx3fupr-resize:790:1302.jpeg">
				</image>
				<image mode="widthFix"
					src="https://p26-item.ecombdimg.com/img/ecom-shop-material/v1_hRvdnMEv_71182650133071629160412_115a8e1e4b2b2a9762333ef49edfdd0c_sx_301116_www790-1302~tplv-5mmsx3fupr-resize:790:1302.jpeg">
				</image>
				<image mode="widthFix"
					src="https://p26-item.ecombdimg.com/img/ecom-shop-material/v1_hRvdnMEv_71182650133071629160412_115a8e1e4b2b2a9762333ef49edfdd0c_sx_301116_www790-1302~tplv-5mmsx3fupr-resize:790:1302.jpeg">
				</image>
			</view>
		</view>

		<view class="footerShare">
			<view class="footerShare0">
				<u-icon name="share-fill" size="40rpx"></u-icon>
				<view class="">
					分享
				</view>
			</view>
			<view class="footerShare1 bacfff">
				<view class="footerShare11">
					一键剪辑
				</view>
			</view>
			<view class="footerShare1 bacf5">
				<view class="footerShare2">
					复制商品链接
				</view>

			</view>
		</view>
	</view>
</template>

<script>
	export default {


		data() {
			return {
				list: [{
						image: 'https://cdn.uviewui.com/uview/swiper/1.jpg',
						title: '昨夜星辰昨夜风，画楼西畔桂堂东'
					},
					{
						image: 'https://cdn.uviewui.com/uview/swiper/2.jpg',
						title: '身无彩凤双飞翼，心有灵犀一点通'
					},
					{
						image: 'https://cdn.uviewui.com/uview/swiper/3.jpg',
						title: '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳'
					}
				]
			}
		},

		methods: {

			nativeGetTo() {
				uni.navigateBack()
			}
		},

	}
</script>

<style scoped lang="scss">
	.detaiLunBo{
		position: relative;
	}
	.backImg {
		position: absolute;
		top: 30px;
		left: 20px;
		z-index: 99;
		background-color: #f5f5f5;
		width: 60upx;
		height: 60upx;
		line-height: 60upx;
		text-align: center;
		border-radius: 30upx;
	}

	.bcg {
		background-color: #fff;
	}

	.colorc4 {
		color: #999;
	}

	.colorc5 {
		color: #7C75F5;
	}

	.font20 {
		font-size: 20px;
	}

	.fontW {
		font-weight: bold;
	}

	.mt {
		margin-top: 20upx;
	}

	.detailTitle {
		padding: 40upx 40upx 0 40upx;
	}

	.deatilSY {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		padding: 40upx;
	}

	.deatilSY0 {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.detailShare {}

	.btborder {
		width: 90%;
		margin: 0 auto;
		border-top: .5px solid #c4c4c4;
	}

	.deatilList {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.deatil6 {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.deatilListText {
		margin-left: 10upx;
	}

	.pdl {
		padding-left: 60upx;
	}

	.ptrb {
		padding: 40upx 0 40upx 0;
	}

	// 右侧title
	.item-title {
		position: relative;
		padding-left: 60upx;
		font-weight: bold;
	}


	.item-title:after {
		position: absolute;
		width: 12upx;
		height: 50upx;
		top: -8upx;
		content: "";
		left: 0;
		border-radius: 10px;
		background-color: #7C75F5;

	}

	.detailbaobei {
		padding: 40upx 20upx;

	}

	.detailbaobeiImg,
	.detailbaobeiImg image {
		width: 100%;
		display: flex;
		flex-direction: column;

	}

	.footerShare {
		height: 160upx;
		background-color: #333;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
	}

	.footerShare0 {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 12px;
	}

	.footerShare1 {
		flex: 2;
		// background-color: red;
		color: #fff;
	}

	.footerShare11 {
		width: 100%;
		border-radius: 20%;
		padding: 14px 0;
	}

	.bacfff {
		border: 1px solid #fff;
	}

	.footerShare1 {

		width: 100%;
		border-radius: 50px;
		font-size: 26upx;
		text-align: center;
		margin-right: 10px;

	}

	.bacf5 {
		background-color: #7C75F5;
	}

	.footerShare2 {
		width: 100%;
		font-size: 12px;
		text-align: center;
		padding: 14px 0;

	}
</style>
