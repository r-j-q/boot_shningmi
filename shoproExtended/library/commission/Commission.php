<?php

namespace addons\shopro\library\commission;

use addons\shopro\library\commission\Config;
use addons\shopro\model\commission\Order as OrderModel;
use addons\shopro\model\commission\Reward as RewardModel;
use addons\shopro\model\User as UserModel;



/**
 * 分佣业务
 */
class Commission
{

    public $_config;    // 分销设置
    public $item;       // 订单商品
    public $buyer;      // 购买人
    public $goods;      // 分销商品
    public $amount = 0;     // 订单商品核算价格
    public $commissionLevel = 0;    // 分销层级
    public $selfBuy;    // 是否内购

    // 分销状态
    const COMMISSION_CLOSE = 0;  // 分销中心已关闭

    /**
     * 构造函数
     * 
     * @param array      $item     分销商品
     */
    public function __construct($item)
    {
        $this->buyer = new Agent($item['user_id']);
        $this->item = $item;
        $this->_config = new Config();
    }


    /**
     * 检测 并且 设置 分销数据
     *
     * @return void
     */
    public function checkAndSetCommission()
    {
        // 未找到订单商品或购买人
        if (!$this->item || !$this->buyer->user) {
            return false;
        }

        // 获取商品分销佣金规则
        $this->goods = new Goods($this->item['goods_id'], $this->item['goods_sku_price_id']);

        // 商品有独立分销设置，覆盖默认系统配置
        if ($this->goods->getCommissionConfig()) {
            $this->_config->setConfig($this->goods->getCommissionConfig());
        }

        // 获取系统设置分销层级
        $this->commissionLevel = $this->_config->getCommissionLevel();
        
        // 分销中心已关闭
        if (self::COMMISSION_CLOSE === $this->commissionLevel) {
            return false;
        }

        // 商品不参与分销
        if (!$this->goods->getCommissionRules()) {
            return false;
        }

        // 购买人已经是分销商并且系统已经开启内购
        $this->selfBuy = $this->buyer->isAgentAvaliable() && $this->_config->isSelfBuy();
        // 未找到上级分销商且不是内购
        if (!$this->buyer->getParentAgentId() && !$this->selfBuy) {
            return false;
        }

        // 获取商品结算价格（四舍五入精确到分）
        $this->amount = $this->getGoodsCommissionAmount();
        // 没有分润的必要了
        if ($this->amount <= 0) {
            return false;
        }

        return true;
    }

    // 获取商品核算总金额
    public function getGoodsCommissionAmount()
    {
        $commissionType = $this->_config->getCommissionPriceType();
        $amount = round(0, 2);
        switch ($commissionType) {
            case 'pay_price':
                $amount = $this->item['pay_price'];
                break;
            case 'goods_price':
                $amount = round($this->item['goods_price'] * $this->item['goods_num'], 2);
                break;
        }
        return $amount;
    }

    /**
     * 添加分销订单
     * 
     */
    public function addCommissionOrder()
    {
        $commissionOrder = OrderModel::where('order_item_id', $this->item['id'])->find();
        // 已添加过分销订单
        if ($commissionOrder) {
            return $commissionOrder;
        }
        $commissionOrderParams = [
            'self_buy' => intval($this->selfBuy),
            'order_id' => $this->item['order_id'],
            'order_item_id' => $this->item['id'],
            'buyer_id' => $this->buyer->user->id,
            'goods_id' => $this->item['goods_id'],
            'agent_id' => $this->selfBuy ? $this->buyer->user->id : $this->buyer->getParentAgentId(),
            'amount' => $this->amount,
            'commission_price_type' => $this->_config->getCommissionPriceType(),
            'commission_rules' => json_encode($this->goods->getCommissionRules()),  // 记录当前设置的分佣规则，防止以后系统或者分销商设置有变导致更改历史规则
            'commission_event' => $this->_config->getCommissionEvent(),
            'commission_order_status' => $this->goods->commissionGoods->commission_order_status,  // 是否计入分销业绩
        ];
        $commissionOrder = OrderModel::create($commissionOrderParams);

        // 添加分销商推广订单业绩
        $orderAgent = new Agent($commissionOrder->agent_id);
        if ($orderAgent->isAgentAvaliable() && $commissionOrder->commission_order_status) {
            $orderAgent->agent->setInc('order_money', $commissionOrder->amount);
            $orderAgent->agent->setInc('order_count', 1);
            Log::write($commissionOrder['agent_id'], 'order', [
                'action' => 'payed',
                'order' => $commissionOrder,
                'order_item' => $this->item,
                'buyer' => $this->buyer->user
            ], ['oper_type' => 'user', 'oper_id' => $this->buyer->user->id]);
            $orderAgent->agent->save();
        }

        return $commissionOrder;
    }

    /**
     * 执行分销计划,递归往上分佣
     * 
     * @param object    $commissionOrder           分销订单 
     * @param object    $currentAgent              当前待分佣的分销商 默认自购开始算
     * @param int       $currentCommissionLevel    当前分佣层级 直推（自购）开始算
     */
    public function runCommissionPlan($commissionOrder, $currentAgent = null, $currentCommissionLevel = 1)
    {
        if ($this->commissionLevel < $currentCommissionLevel) {
            return true;
        }
        // 当前层级为1且分销订单是内购订单 则当前层级为购买人自己
        if ($currentCommissionLevel === 1) {
            $currentAgent = new Agent($commissionOrder->agent_id);
        }
        if ($currentAgent && !empty($currentAgent->user)) {
            // 防止重复添加佣金
            $commissionReward = RewardModel::get([
                'commission_order_id' => $commissionOrder->id,
                'agent_id' => $currentAgent->user->id,
                'commission_level' => $currentCommissionLevel,   // 分佣层级
            ]);
            if (!$commissionReward) {
                $currentAgentLevel = $currentAgent->getAgentLevel();
                $currentCommissionLevelRule = $this->goods->getCommissionLevelRule($currentAgentLevel, $currentCommissionLevel);
                if ($currentCommissionLevelRule) {
                    $commission = $this->goods->caculateGoodsCommission($currentCommissionLevelRule, $this->amount, $this->item['goods_num']);
                    if ($commission > 0) {
                        $commissionRewardParams = [
                            'order_id' => $commissionOrder->order_id,
                            'order_item_id' => $commissionOrder->order_item_id,
                            'buyer_id' => $commissionOrder->buyer_id,      // 购买人
                            'commission_order_id' => $commissionOrder->id,   // 分销订单ID
                            'agent_id' => $currentAgent->user->id,           // 待分佣分销商ID
                            'type' => 'money',                               // 奖金类型
                            'commission' => $commission,                     // 佣金
                            'status' => 0,                              // 佣金状态
                            'original_commission' => $commission,            // 原始佣金
                            'commission_level' => $currentCommissionLevel,   // 分佣层级
                            'commission_rules' => json_encode($currentCommissionLevelRule),   // 分佣层级
                            'agent_level' => $currentAgentLevel              // 分佣时分销商等级
                        ];
                        $commissionReward = RewardModel::create($commissionRewardParams);
                        Log::write($commissionReward['agent_id'], 'reward', [
                            'action' => 'payed',
                            'reward' => $commissionReward,
                        ], ['oper_type' => 'user', 'oper_id' => $commissionOrder->buyer_id]);
                    }
                }
            }

            // 递归执行下一次
            $currentCommissionLevel++;
            // 超出分销层级
            if ($this->commissionLevel < $currentCommissionLevel) {
                return true;
            }
            $parentAgentId = $currentAgent->getParentAgentId();
            // 执行下一级分销任务
            if ($parentAgentId) {
                $parentAgent = new Agent($parentAgentId);
                $this->runCommissionPlan($commissionOrder, $parentAgent, $currentCommissionLevel);
            } else {
                return true;
            }
        }
    }
}
