<?php

namespace addons\shopro\controller\commission;

use addons\shopro\model\commission\Order as CommissionOrder;

class Order extends Commission
{

    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];


    /**
     * 分销订单列表
     */
    public function index()
    {
        $params = $this->request->get();

        $rewards = CommissionOrder::getList($params);

        $this->success('获取成功', $rewards);
    }
}
