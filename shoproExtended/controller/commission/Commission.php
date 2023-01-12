<?php

namespace addons\shopro\controller\commission;

use addons\shopro\controller\Base;
use addons\shopro\library\commission\Agent as AgentLibrary;
use addons\shopro\library\commission\Config as ConfigLibrary;

class Commission extends Base
{

    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];
    protected $agent;


    public function _initialize()
    {

        parent::_initialize();
        $user = $this->auth->getUserinfo();
        $this->config = new ConfigLibrary();
        if($this->config->getCommissionLevel() === 0) {
            $this->success('分销中心已关闭', [
                'status' => 'close',
                'msg' => '分销中心已关闭'
            ]);
        }
        $this->agent = new AgentLibrary($user['id']);
        $agentInfo = $this->agent->getAgentInfo();
        if($agentInfo['status'] === AgentLibrary::AGENT_STATUS_FORBIDDEN) {
            $this->success('您的账户被禁用', [
                'status' => $agentInfo['status'],
                'msg' => $agentInfo['msg']
            ]);
        }
    }
}
