<?php

namespace addons\shopro\job;

use addons\shopro\library\traits\ActivityCache;
use addons\shopro\library\traits\Groupon;
use addons\shopro\library\traits\StockSale;
use addons\shopro\model\Config;
use addons\shopro\model\GoodsComment;
use addons\shopro\model\Order;
use addons\shopro\model\OrderAction;
use addons\shopro\model\OrderItem;
use think\queue\Job;

/**
 * 订单支付完成
 */
class OrderPayed extends BaseJob
{
    use StockSale, ActivityCache, Groupon;

    /**
     * 订单支付完成
     */
    public function payed(Job $job, $data)
    {
        try {
            $order = $data['order'];
            $user = $data['user'];

            $order = Order::with('item')->where('id', $order['id'])->find();

            // 数据库删订单的问题常见，这里被删的订单直接把队列移除
            if ($order) {
                \think\Db::transaction(function () use ($order, $user, $data) {
                    // 订单减库存
                    $this->realForwardStockSale($order);

                    // 判断，如果是拼团 真实加入团
                    if (strpos($order['activity_type'], 'groupon') !== false) {
                        $this->joinGroupon($order, $user);
                    }

                    // 处理发票审核
                    if ($order->invoice_status == 1) {
                        $invoice = \addons\shopro\model\OrderInvoice::get(['order_id' => $order->id]);
                        if ($invoice) {
                            $invoice->status = 0;
                            $invoice->save();
                        }
                    }
                    // 处理消费返积分 TODO: 待测试
                    $scoreConfig = Config::where('name', 'score')->find();
                    $scoreConfig = json_decode($scoreConfig['value'], true);
                    if(!empty($scoreConfig['consume_get_score']) && !empty($scoreConfig['consume_get_score_ratio'])) {
                        $scoreRatio = intval($scoreConfig['consume_get_score_ratio']);
                        $score = intval($scoreRatio * 0.01 * $order->total_fee);
                        if($score > 0) {
                            \addons\shopro\model\User::score($score, $user['id'], 'consume_get_score', $order['id']);
                        }
                    }
                    
                    // 触发订单支付完成事件, 如果这个订单刚好完成拼团，并且是自动发货订单，则这个订单的自动发货事件会比订单支付之后事件早
                    $data = ['order' => $order];
                    \think\Hook::listen('order_payed_after', $data);

                    // 检测有没有自动发货的商品，有就自动发货
                    $order->checkDispatchAndSend($order, ['user' => $user]);
                });
            }

            // 删除 job
            $job->delete();
        } catch (\Exception $e) {
            // 队列执行失败
            $error = json_encode([
                'a' => $e->getLine(),
                'b' => $e->getFile(),
                'c' => $e->getTrace(),
                'd' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);


            \think\Log::error('queue-' . get_class() . '-payed' . '：执行失败，错误信息：' . $error);
        }
    }
}
