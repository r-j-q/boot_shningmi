<?php

namespace addons\shopro\controller\commission;

use addons\shopro\model\commission\Log as CommissionLog;

class Log extends Commission
{

    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];


    /**
     * 分销动态
     */
    public function index()
    {
        $params = $this->request->get();

        $rewards = CommissionLog::getList($params);

        $this->success('获取成功', $rewards);
    }
}
