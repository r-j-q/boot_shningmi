<?php

namespace addons\shopro\library\commission;

use addons\shopro\library\Oper;
use addons\shopro\model\commission\Level as LevelModel;
use addons\shopro\model\commission\Order as OrderModel;
use addons\shopro\model\commission\Reward as RewardModel;
use addons\shopro\model\User as UserModel;


/**
 * 结算奖金
 */
class Reward
{
    // 分销订单业绩状态 table: commission_order, field: commission_order_status
    const COMMISSION_ORDER_STATUS_NO = 0;  // 不计入
    const COMMISSION_ORDER_STATUS_YES = 1;  // 已计入
    const COMMISSION_ORDER_STATUS_BACK = -1;  // 已退回
    const COMMISSION_ORDER_STATUS_CANCEL = -2;  // 已取消
    // 分销订单佣金处理状态 table: commission_order, field: commission_reward_status
    // 分销佣金状态  table: commission_reward, field: status
    const COMMISSION_REWARD_STATUS_WAITING = 0;  // 未结算、待入账
    const COMMISSION_REWARD_STATUS_ACCOUNTED = 1;  // 已结算、已入账
    const COMMISSION_REWARD_STATUS_BACK = -1;  // 已退回
    const COMMISSION_REWARD_STATUS_CANCEL = -2;  // 已取消
    protected $oper = null;
    /**
     * 执行奖金计划,直接派发佣金
     * 
     * @param string    $event                     分佣的事件
     * @param mixed     $commissionOrder|$commissionOrderId           分销订单 
     * @param array     $oper                      操作人
     */
    public function __construct($oper = null)
    {
        if ($oper) {
            $this->oper = $oper;
        } else {
            $this->oper = Oper::set();
        }
    }
    /**
     * 执行奖金计划, 派发整单佣金
     * 
     * @param string     $event                      事件
     * @param mixed     $commissionOrder|$commissionOrderId           分销订单 
     */
    public function runCommissionRewardByOrder($event, $commissionOrder)
    {
        if (is_numeric($commissionOrder)) {
            $commissionOrder = OrderModel::get($commissionOrder);
        }

        // 未找到分销订单
        if (!$commissionOrder) {
            return false;
        }

        // 已经操作过了
        if ($commissionOrder['commission_reward_status'] !== self::COMMISSION_REWARD_STATUS_WAITING) {
            return false;
        }

        $commissionEvent = $commissionOrder['commission_event'];

        // 不满足分佣事件
        if ($commissionEvent !== $event && $event !== 'admin') {
            return false;
        }

        // 更新分销订单结算状态
        $commissionOrder->commission_reward_status = self::COMMISSION_REWARD_STATUS_ACCOUNTED;
        $commissionOrder->commission_time = time();
        $commissionOrder->save();

        // 防止重复添加佣金
        $commissionRewards = RewardModel::all([
            'commission_order_id' => $commissionOrder['id'],
            'status' => self::COMMISSION_REWARD_STATUS_WAITING,
        ]);

        // 添加分销商收益、余额添加钱包、更新分销佣金结算状态、提醒分销商到账
        if ($commissionRewards) {
            foreach ($commissionRewards as $commissionReward) {
                $this->runCommissionReward($event, $commissionReward);
            }
            return true;
        }
        return false;
    }

    /**
     * 执行奖金计划,直接派发佣金
     * 
     * @param string     $event                      事件
     * @param mixed     $commissionReward|$commissionRewardId           奖金记录 
     */
    public function runCommissionReward($event, $commissionReward)
    {
        if (is_numeric($commissionReward)) {
            $commissionReward = RewardModel::get($commissionReward);
        }

        // 未找到奖金记录
        if (!$commissionReward) {
            return false;
        }

        if ($commissionReward->status == self::COMMISSION_REWARD_STATUS_WAITING) {
            $rewardAgent = new Agent($commissionReward->agent_id);
            if ($rewardAgent && $rewardAgent->isAgentAvaliable()) {
                $rewardAgent->agent->setInc('total_income', $commissionReward->commission);
                UserModel::money($commissionReward->commission, $commissionReward->agent_id,  'commission_income', $commissionReward->id, '', $commissionReward);
                $commissionReward->status = self::COMMISSION_REWARD_STATUS_ACCOUNTED;
                $commissionReward->save();
                Log::write($rewardAgent->user->id, 'reward', [
                    'action' => $event,
                    'reward' => $commissionReward
                ], $this->oper);
                return true;
            }
        }
        return false;
    }


    /**
     * 扣除/取消 分销订单
     * 
     * @param string   $event                     事件
     * @param mixed    $commissionOrder|$commissionOrderId           分销订单 
     * @param array     $deleteOrder               扣除分销商的订单业绩  默认扣除
     * @param array     $deleteReward              扣除分销订单奖金     默认扣除
     */
    public function backCommissionRewardByOrder($event, $commissionOrder, $deleteOrder = true, $deleteReward = true)
    {
        if ($event == 'refund') {
            $config = new Config();
            $deleteOrder = $config->getRefundCommissionOrder();
            $deleteReward = $config->getRefundCommissionReward();
        }

        if (!$deleteOrder && !$deleteReward) {
            return false;
        }

        if (is_numeric($commissionOrder)) {
            $commissionOrder = OrderModel::get($commissionOrder);
        }

        // 未找到分销订单
        if (!$commissionOrder) {
            return false;
        }

        // 扣除分销商的订单业绩
        if ($deleteOrder) {
            // 变更分销订单状态
            if ($commissionOrder->commission_order_status == self::COMMISSION_ORDER_STATUS_YES) {    // 扣除
                $commissionOrder->commission_order_status = self::COMMISSION_ORDER_STATUS_BACK;
                $commissionOrder->save();
            }
            if ($commissionOrder->commission_order_status == self::COMMISSION_ORDER_STATUS_NO) {    // 取消
                $commissionOrder->commission_order_status = self::COMMISSION_ORDER_STATUS_CANCEL;
                $commissionOrder->save();
            }
            $orderAgent = new Agent($commissionOrder->agent_id);
            // 扣除分销订单业绩
            if ($commissionOrder->commission_order_status == self::COMMISSION_ORDER_STATUS_BACK) {
                if ($orderAgent->agent->order_money < $commissionOrder->amount) {
                    $orderAgent->agent->order_money = 0;
                    $orderAgent->agent->save();
                } else {
                    $orderAgent->agent->setDec('order_money', $commissionOrder->amount);
                }
                if ($orderAgent->agent->order_count < 1) {
                    $orderAgent->agent->order_count = 0;
                    $orderAgent->agent->save();
                } else {
                    $orderAgent->agent->setDec('order_count', 1);
                }
                // 业绩变更，重新统计团队业绩
                $orderAgent->asyncAgentUpgrade($orderAgent->agent->user_id);
                Log::write($commissionOrder['agent_id'], 'order', [
                    'action' => $event,
                    'order' => $commissionOrder,
                    'buyer' => \addons\shopro\model\User::get($commissionOrder->buyer_id)
                ], $this->oper);
            }
        }

        // 变更分销订单佣金执行状态
        if ($deleteReward) {
            if ($commissionOrder->commission_reward_status == self::COMMISSION_REWARD_STATUS_ACCOUNTED) { // 扣除
                $commissionOrder->commission_reward_status = self::COMMISSION_REWARD_STATUS_BACK;
                $commissionOrder->save();
                // 防止重复扣除佣金
                $commissionRewards = RewardModel::all([
                    'commission_order_id' => $commissionOrder->id,
                    'status' => self::COMMISSION_REWARD_STATUS_ACCOUNTED,
                ]);
                // 扣除分销佣金
                if ($commissionRewards) {
                    foreach ($commissionRewards as $commissionReward) {
                        $this->backCommissionReward($event, $commissionReward);
                    }
                }
                return true;
            }

            if ($commissionOrder->commission_reward_status == self::COMMISSION_REWARD_STATUS_WAITING) {  // 取消
                $commissionOrder->commission_reward_status = self::COMMISSION_REWARD_STATUS_CANCEL;
                $commissionOrder->save();
                $commissionRewards = RewardModel::all([
                    'commission_order_id' => $commissionOrder->id,
                    'status' => self::COMMISSION_REWARD_STATUS_WAITING
                ]);
                // 扣除分销佣金
                if ($commissionRewards) {
                    foreach ($commissionRewards as $commissionReward) {
                        $this->cancelCommissionReward($event, $commissionReward);
                    }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 扣除 分销佣金
     * 
     * @param string     $event                      事件
     * @param mixed     $commissionReward|$commissionRewardId           奖金记录 
     */
    public function backCommissionReward($event, $commissionReward)
    {
        if (is_numeric($commissionReward)) {
            $commissionReward = RewardModel::get($commissionReward);
        }

        // 未找到奖金记录
        if (!$commissionReward) {
            return false;
        }

        if ($commissionReward->status == self::COMMISSION_REWARD_STATUS_ACCOUNTED) {
            $rewardAgent = new Agent($commissionReward->agent_id);
            if ($rewardAgent->agent->total_income < $commissionReward->commission) {
                $rewardAgent->agent->total_income = 0;
                $rewardAgent->agent->save();
            } else {
                $rewardAgent->agent->setDec('total_income', $commissionReward->commission);
            }
            UserModel::money(-$commissionReward->commission, $commissionReward->agent_id, 'commission_back', $commissionReward->id, '', $commissionReward);
            $commissionReward->status = self::COMMISSION_REWARD_STATUS_BACK;
            $commissionReward->save();
            Log::write($rewardAgent->user->id, 'reward', [
                'action' => $event,
                'reward' => $commissionReward,
            ], $this->oper);
            return true;
        }
        return false;
    }

    /**
     * 取消 分销佣金
     * 
     * @param string     $event                      事件
     * @param mixed     $commissionReward|$commissionRewardId           奖金记录 
     */
    public function cancelCommissionReward($event, $commissionReward)
    {
        if (is_numeric($commissionReward)) {
            $commissionReward = RewardModel::get($commissionReward);
        }

        // 未找到奖金记录
        if (!$commissionReward) {
            return false;
        }

        if ($commissionReward->status == self::COMMISSION_REWARD_STATUS_WAITING) {
            $commissionReward->status = self::COMMISSION_REWARD_STATUS_CANCEL;
            $commissionReward->save();

            $rewardAgent = new Agent($commissionReward->agent_id);
            Log::write($rewardAgent->user->id, 'reward', [
                'action' => $event,
                'reward' => $commissionReward,
            ], $this->oper);
            return true;
        }
        return false;
    }
}
