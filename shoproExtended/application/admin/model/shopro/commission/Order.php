<?php

namespace app\admin\model\shopro\commission;

use think\Model;

class Order extends Model
{
    // 表名
    protected $name = 'shopro_commission_order';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 追加属性
    protected $append = [
        'commission_reward_status_text',
        'commission_order_status_text',
        'commission_event_text'
    ];

    // 分销订单业绩状态 table: commission_order, field: commission_order_status
    const COMMISSION_ORDER_STATUS_NO = 0;  // 不计入
    const COMMISSION_ORDER_STATUS_YES = 1;  // 已计入
    const COMMISSION_ORDER_STATUS_BACK = -1;  // 已退回
    const COMMISSION_ORDER_STATUS_CANCEL = -2;  // 已取消

    // 分销订单佣金处理状态 table: commission_order, field: commission_reward_status
    const COMMISSION_REWARD_STATUS_WAITING = 0;  // 未结算、待入账
    const COMMISSION_REWARD_STATUS_ACCOUNTED = 1;  // 已结算、已入账
    const COMMISSION_REWARD_STATUS_BACK = -1;  // 已退回
    const COMMISSION_REWARD_STATUS_CANCEL = -2;  // 已取消

    // 商品结算方式
    const COMMISSION_TYPE_PAY_PRICE = 'pay_price';      // 实际支付价
    const COMMISSION_TYPE_GOODS_PRICE = 'goods_price';    // 商品价

    // 佣金结算方式
    const COMMISSION_EVENT_PAYED = 'payed';             // 支付后结算
    const COMMISSION_EVENT_CONFIRM = 'confirm';         // 确认收货后结算
    const COMMISSION_EVENT_FINISH = 'finish';           // 订单完成结算
    const COMMISSION_EVENT_ADMIN = 'admin';             // 手动打款


    public function getCommissionOrderStatusTextAttr($value, $data)
    {
        $status_name = '-';

        switch ($data['commission_order_status']) {
            case self::COMMISSION_ORDER_STATUS_NO:
                $status_name = '不计入';
                break;
            case self::COMMISSION_ORDER_STATUS_YES:
                $status_name = '已计入';
                break;
            case self::COMMISSION_ORDER_STATUS_BACK:
                $status_name = '已扣除';
                break;
            case self::COMMISSION_ORDER_STATUS_CANCEL:
                $status_name = '已取消';
                break;
        }

        return $status_name;
    }

    public function getCommissionRewardStatusTextAttr($value, $data)
    {
        $status_name = '-';

        switch ($data['commission_reward_status']) {
            case self::COMMISSION_REWARD_STATUS_WAITING:
                $status_name = '未结算';
                break;
            case self::COMMISSION_REWARD_STATUS_ACCOUNTED:
                $status_name = '已结算';
                break;
            case self::COMMISSION_REWARD_STATUS_BACK:
                $status_name = '已退回';
                break;
            case self::COMMISSION_ORDER_STATUS_CANCEL:
                $status_name = '已取消';
                break;
        }

        return $status_name;
    }

    public function getCommissionEventTextAttr($value, $data)
    {
        $event_name = '-';

        switch ($data['commission_event']) {
            case self::COMMISSION_EVENT_PAYED:
                $event_name = '支付后结算';
                break;
            case self::COMMISSION_EVENT_CONFIRM:
                $event_name = '确认收货结算';
                break;
            case self::COMMISSION_EVENT_FINISH:
                $event_name = '订单完成结算';
                break;
            case self::COMMISSION_EVENT_ADMIN:
                $event_name = '手动打款';
                break;
        }

        return $event_name;
    }


    public function agent()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'agent_id')->field('id,nickname,avatar,mobile,prevtime,logintime,jointime');
    }


    public function order()
    {
        return $this->belongsTo(\app\admin\model\shopro\order\Order::class, 'order_id');
    }


    public function item()
    {
        return $this->belongsTo(\app\admin\model\shopro\order\OrderItem::class, 'order_item_id');
    }

    public function reward()
    {
        return $this->hasMany(\app\admin\model\shopro\commission\Reward::class, 'commission_order_id');
    }

    public function buyer()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'buyer_id');
    }
}
