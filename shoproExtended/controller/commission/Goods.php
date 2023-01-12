<?php

namespace addons\shopro\controller\commission;

use addons\shopro\model\commission\Goods as CommissionGoods;
use addons\shopro\library\commission\Agent as AgentLibrary;
use addons\shopro\library\commission\Config as ConfigLibrary;

class Goods extends Commission
{

    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];

    /**
     * 推广商品
     */
    public function index()
    {
        $params = $this->request->get();

        $goods = CommissionGoods::getList($params);

        $this->success('获取成功', $goods);
    }
}
