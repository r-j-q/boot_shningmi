<?php

namespace addons\shopro\listener\commission;

use addons\shopro\library\commission\Agent as AgentLibrary;
use addons\shopro\library\commission\Commission as CommissionLibrary;
use addons\shopro\library\commission\Reward as RewardLibrary;
use addons\shopro\model\Order;
use addons\shopro\model\OrderItem;

/**
 * 分销钩子处理
 */
class CommissionHook
{

    // 订单支付成功 
    // 执行顺序:累计用户总计消费->查看是否能绑定关系->分佣->查看是否能成为分销商->分销商升级
    public function orderPayedAfter(&$params)
    {
        // Attention:
        // 一个订单购买多件产品时，可能会因为佣金到账的时间不同，引起中间的某一件产品分佣导致分销商的数据变动，由此引发整个链条的分销商等级升级，所以此处采用先整单结算佣金，后统一处理分销商等级变动，这样是最稳妥也最节省性能的方法。
        // 根据业务需求可以在每件商品的处理环节都加入分销商升级判断

        // 订单支付成功
        $order = $params['order'];
        // 重新查询订单
        $order = Order::with('item')->where('id', $order['id'])->find();
        if (!$order) return false;
        $agent = new AgentLibrary($order['user_id']);
        if (!$agent->user)  return false;
        // 加用户消费金额
        if ($order['total_fee'] > 0) {
            $agent->user->setInc('total_consume', $order['total_fee']);
        }

        // 绑定关系
        $agent->bindUserRelation('pay');

        if ($order['type'] !== 'score') {   // 积分商品订单不参与分销
            // 先记录分佣 再处理记录业绩、升级等情况
            $items = $order ? $order['item'] : [];
            foreach ($items as $item) {
                $commission = new CommissionLibrary($item);
                // 检查能否分销
                if ($commission->checkAndSetCommission()) {
                    // 添加分销订单
                    $commissionOrder = $commission->addCommissionOrder();
                    // 执行奖金计划
                    $commission->runCommissionPlan($commissionOrder);
                    // 支付后拨款
                    (new RewardLibrary())->runCommissionRewardByOrder('payed', $commissionOrder->id);
                }
            }
        }

        // 检测成为分销商  分销商递归升级 
        $agent->becomeAgent();
        $agent->asyncAgentUpgrade($agent->user->id);
    }

    // 用户通过分享进入后 判断是否绑定用户推广关系
    public function shareAfter($shareLog)
    {
        // 点击分享链接后即锁定关系
        if ($shareLog) {
            $user_id = intval($shareLog->user_id); // 受邀用户
            $share_id = intval($shareLog->share_id); // 邀请人
            $agent = new AgentLibrary($user_id);
            $bindCheck = $agent->bindUserRelation('share', $share_id);
            if ($bindCheck) {
                $agent->asyncAgentUpgrade($agent->user->id);
            }
        }
    }


    // 订单同意退款后
    public function orderRefundAfter(&$params)
    {
        $item = $params['item'];
        // 扣除用户消费总计金额
        $orderItem = OrderItem::where(['id' => $item['id'], "refund_status" => ['in', [OrderItem::REFUND_STATUS_FINISH, OrderItem::REFUND_STATUS_OK]]])->find();
        if($orderItem && $orderItem->refund_fee > 0) {
            $user = \addons\shopro\model\User::get($orderItem['user_id']);
            $user->setDec('total_consume', $orderItem->refund_fee);
        }
        // 订单退款成功
        $commissionOrder = \addons\shopro\model\commission\Order::get(['order_item_id' => $item['id']]);
        if ($commissionOrder) {
            (new RewardLibrary())->backCommissionRewardByOrder('refund', $commissionOrder);
        }
    }

    // 订单确认收货后
    public function orderConfirmAfter(&$params)
    {
        $item = $params['item'];

        $commissionOrder = \addons\shopro\model\commission\Order::get(['order_item_id' => $item['id']]);
        if ($commissionOrder) {
            (new RewardLibrary())->runCommissionRewardByOrder('confirm', $commissionOrder);
        }
    }

    // 订单完成后
    public function orderFinish(&$params)
    {
        $order = $params['order'];
        foreach ($order['item'] as $item) {
            $commissionOrder = \addons\shopro\model\commission\Order::get(['order_item_id' => $item['id']]);
            if ($commissionOrder) {
                (new RewardLibrary())->runCommissionRewardByOrder('finish', $commissionOrder);
            }
        }
    }
}
