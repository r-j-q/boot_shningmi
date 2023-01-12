<?php

namespace addons\shopro\library\commission;

use addons\shopro\model\commission\Config as ConfigModel;
use addons\shopro\model\User;
use think\Model;
use fast\Http;

/**
 *
 */
class Config
{
    protected $config = [];

    public function __construct()
    {
        $this->config = ConfigModel::column('value', 'name');
    }

    // 覆盖默认分销设置
    public function setConfig($config)
    {
        foreach ($config as $name => $value) {
            $this->config[$name] = $value;
        }
    }

    // 获取绑定推广关系的事件节点
    public function getInviteLockEvent()
    {
        return $this->config['invite_lock'];
    }

    // 获取成为分销商的条件
    public function getBecomeAgentEvent()
    {
        return json_decode($this->config['become_agent'], true);
    }

    // 分销商是否需要审核
    public function isAgentCheck()
    {
        return boolval($this->config['agent_check']);
    }

    // 分销商升级审核
    public function isUpgradeCheck()
    {
        return boolval($this->config['upgrade_check']);
    }

    // 分销商允许越级升级
    public function isUpgradeJump()
    {
        return boolval($this->config['upgrade_jump']);
    }

    // 是否需要完善分销商表单信息
    public function needAgentForm()
    {
        return boolval($this->config['agent_form']);
    }

    // 获取申请资料表单信息
    public function getAgentForm()
    {
        if ($this->needAgentForm()) {
            return json_decode($this->config['agent_form'], true);
        }
        return false;
    }

    // 申请协议
    public function getApplyProtocol()
    {
        if ($this->config['apply_protocol']) {
            return json_decode($this->config['apply_protocol'], true);
        }
        return null;
    }

    // 分销层级
    public function getCommissionLevel()
    {
        return intval($this->config['commission_level']);
    }

    // 是否允许分销内购
    public function isSelfBuy()
    {
        return boolval($this->config['self_buy']);
    }

    // 是否显示升级条件
    public function isUpgradeDisplay()
    {
        return boolval($this->config['upgrade_display']);
    }

    // 佣金结算价格类型 pay_price=支付金额  goods_price=商品价格 （都不含运费 因为运费对于平台和用户没有实际价值）
    public function getCommissionPriceType()
    {
        return $this->config['commission_price_type'];
    }

    // 佣金结算节点 payed=支付后
    public function getCommissionEvent()
    {
        return $this->config['commission_event'];
    }

    // 退款是否扣除分销业绩
    public function getRefundCommissionOrder()
    {
        return boolval($this->config['refund_commission_order']);
    }

    // 退款是否扣除佣金
    public function getRefundCommissionReward()
    {
        return boolval($this->config['refund_commission_reward']);
    }
}
