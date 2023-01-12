<?php

namespace addons\shopro\controller;

use addons\shopro\exception\Exception;

class Goods extends Base
{

    protected $noNeedLogin = ['index', 'detail', 'lists', 'activity', 'seckillList', 'grouponList', 'store'];
    protected $noNeedRight = ['*'];

    public function index()
    {
        // 测试腾讯云短信
        $user = \addons\shopro\model\User::get(10011);
        $walletLog = \addons\shopro\model\UserWalletLog::get(61);

        $user && $user->notify(
            new \addons\shopro\notifications\Wallet([
                'walletLog' => $walletLog,
                'event' => 'wallet_change'
            ])
        );
    }

    public function detail()
    {
        $id = $this->request->get('id');
        $detail = \addons\shopro\model\Goods::getGoodsDetail($id);
        
        // 记录足记
        \addons\shopro\model\UserView::addView($detail);

        $sku_price = $detail['sku_price'];      // 处理过的规格
        // tp bug json_encode 或者 toArray 的时候 sku_price 会重新查询数据库，导致被处理过的规格又还原回去了
        $detail = json_decode(json_encode($detail), true);
        $detail['sku_price'] = $sku_price;

        $this->success('商品详情', $detail);
    }

    public function lists()
    {
        $params = $this->request->get();
        $data = \addons\shopro\model\Goods::getGoodsList($params);

        $this->success('商品列表', $data);

    }


    /**
     * 获取商品支持的 自提点
     */
    public function store()
    {
        $params = $this->request->get();
        $data = \addons\shopro\model\Goods::getGoodsStore($params);

        $this->success('自提列表', $data);
    }


    // 秒杀列表
    public function seckillList() {
        $params = $this->request->get();

        $this->success('秒杀商品列表', \addons\shopro\model\Goods::getSeckillGoodsList($params));
    }


    // 拼团列表
    public function grouponList() {
        $params = $this->request->get();

        $this->success('拼团商品列表', \addons\shopro\model\Goods::getGrouponGoodsList($params));
    }


    public function activity()
    {
        $activity_id = $this->request->get('activity_id');
        $activity = \addons\shopro\model\Activity::get($activity_id);
        if (!$activity) {
            $this->error('活动不存在', null, -1);
        }
        
        $goods = \addons\shopro\model\Goods::getGoodsList(['goods_ids' => $activity->goods_ids]);
        $activity->goods = $goods;
        
        $this->success('活动列表', $activity);
    }

    public function favorite()
    {
        $params = $this->request->post();
        $result = \addons\shopro\model\UserFavorite::edit($params);
        $this->success($result ? '收藏成功' : '取消收藏', $result);
    }

    public function favoriteList()
    {
        $data = \addons\shopro\model\UserFavorite::getGoodsList();
        $this->success('商品收藏列表', $data);
    }


    public function viewDelete()
    {
        $params = $this->request->post();
        $result = \addons\shopro\model\UserView::del($params);
        $this->success('删除成功', $result);
    }


    public function viewList()
    {
        $data = \addons\shopro\model\UserView::getGoodsList();
        $this->success('商品浏览列表', $data);
    }



}
