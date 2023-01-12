<!-- 商品列表 -->
<template>
	<view class="">
		<view class="mission-content">
			<view class="mission-c">
				<view class="mission-l">
					<u-search placeholder="搜索商品" shape="square" height="100" @custom="bandleSearch" :showAction="true"
						:animation="true" :clearabled="true" @confirm="confirmData" v-model="keyword"></u-search>
					<view class="mission-list" v-show="searchText">
						<view @click="searchTextList" class="mission-list-title"> 搜索的商品搜索的商品搜索的商品搜索的商品搜索的商品搜索的商品 </view>
						<view @click="searchTextList" class="mission-list-title"> 搜索的商品 </view>
						<view @click="searchTextList" class="mission-list-title"> 搜索的商品 </view>
					</view>
				</view>
				<button @click="navigatorToLine" class="mission-r">我的</button>
			</view>
			<view class="mission-center">
				<!-- <u-tabs name="cate_name" count="cate_count" :list="list" :is-scroll="false" :current="current" @change="change" /> -->

				<view class="mission-center-center">
					<view class="center1  borderL1" @click="tabActive(item)" :class="current == index ?'bgcolor':''"  v-for="(item,index) in listTabs" :key="index">
						 {{item.name}}
					</view>
					 
				</view>
				<!-- <view  :class="countId==1 ? 'mission-t1':'mission-t2'"    @click="tabActive(item)"
					v-for="(item,index) in listTabs" :key="index">
					{{item.name}}
				</view> -->
			</view>
		</view>
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
		<goodsListVue />
	</view>
</template>

<script>
	import {
		mapMutations,
		mapActions,
		mapState
	} from 'vuex';
	import goodsListVue from '../../components/juzheng/goodsList.vue';

	let systemInfo = uni.getSystemInfoSync();
	export default {
		components: {
			goodsListVue
		},
		data() {
			return {
				searchText: false,
				countId: 1,
				keyword: '',
				listTabs: [{
					name: '直播任务',
					id: 0
				}, {
					name: "视频任务",
					id: 1
				}],
				current: 0

			};
		},
		// 触底加载更多
		onReachBottom() {},
		onLoad() {},
		methods: {
			change() {},
			// 点击收缩时触发
			bandleSearch() {
				this.searchText = !this.searchText
				console.log("----", this.keyword)
			},
			searchTextList() {
				this.searchText = !this.searchText
			},
			tabActive(item) {
				this.current = item.id
			},
			navigatorToLine() {
				console.log("9999")
			},

		}

	};
</script>

<style lang="scss">
	.mission-center-center {
		width: 500upx;
		height: 100upx;
		margin: 0 auto;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-radius: 50upx;
	 
	}

	.center1 {
		 width: 250upx;
		height: 100upx;
		text-align: center;
		line-height: 100upx;
		color: #999;
		font-size: 30upx;

	}

	.bgcolor {
		background-color: #7C75F5;
		color: #fff;

	}

	.borderL1 {
		border-radius: 50upx;
	}

	.mission-list {
		width: 100%;
		position: absolute;
		z-index: 88;
		background-color: #fff;
	}

	.mission-list-title {
		font-size: 16px;
		padding: 20upx;
	}

	.mission-content {
		height: 332upx;
		background: linear-gradient(90deg, #F3E5F6, #E7E5FB);

		.mission-center {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-around;
			font-size: 18px;
			margin-top: 40upx;

			position: relative;

			.mission-t {
				color: #333;
			}
		}

		.c1 {
			color: #7C75F5;
		}

		.c2 {
			color: #333;
		}



		.mission-t1,
		.mission-t2 {
			color: #7C75F5;
		}

		.mission-t1::after {
			background: #7C75F5;
			color: #7C75F5;
			border-radius: 1px;
			position: absolute;
			bottom: -10px;
			content: "";
			height: 3px;
			left: 25%;
			position: absolute;
			-webkit-transform: translateX(-50%);
			-moz-transform: translateX(-50%);
			-o-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
			transform: translateX(-50%);
			width: 35px;
		}

		.mission-t2::after {
			background: #7C75F5;
			color: #7C75F5;
			border-radius: 1px;
			position: absolute;
			bottom: -10px;
			content: "";
			height: 3px;
			left: 75%;
			position: absolute;
			-webkit-transform: translateX(-50%);
			-moz-transform: translateX(-50%);
			-o-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
			transform: translateX(-50%);
			width: 35px;
		}
	}

	.mission-c {

		display: flex;
		flex-direction: row;
		padding: 0 20upx;
		padding-top: 60upx;

		.mission-l {
			width: 80%;
			margin-right: 15px;
			position: relative;
		}

		/deep/ uni-button:after {
			border: none;
			outline: none;
		}

		.mission-r {
			width: 20%;
			height: 100upx;
			line-height: 100upx;
			font-size: 16px;
			background-color: #E7E5FB;
			border: none;
			outline: none;
			color: #7C75F5;

		}
	}
</style>
