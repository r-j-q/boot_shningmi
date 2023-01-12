<?php

namespace app\admin\model\shopro\commission;

use think\Model;

class Reward extends Model
{
    // 表名
    protected $name = 'shopro_commission_reward';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 追加属性
    protected $append = [
        'status_text',
        'type_text'
    ];

    // 分销佣金状态  table: commission_reward, field: status
    const COMMISSION_REWARD_STATUS_WAITING = 0;  // 未结算、待入账
    const COMMISSION_REWARD_STATUS_ACCOUNTED = 1;  // 已结算、已入账
    const COMMISSION_REWARD_STATUS_BACK = -1;  // 已退回
    const COMMISSION_REWARD_STATUS_CANCEL = -2;  // 已取消

    public function getStatusTextAttr($value, $data)
    {
        $status_name = '';

        switch ($data['status']) {
            case self::COMMISSION_REWARD_STATUS_WAITING:
                $status_name = '待结算';
                break;
            case self::COMMISSION_REWARD_STATUS_ACCOUNTED:
                $status_name = '已结算';
                break;
            case self::COMMISSION_REWARD_STATUS_BACK:
                $status_name = '已退回';
                break;
            case self::COMMISSION_REWARD_STATUS_CANCEL:
                $status_name = '已取消';
                break;
        }

        return $status_name;
    }


    public function getTypeTextAttr($value, $data)
    {
        $type_text = '';

        switch ($data['type']) {
            case 'money':
                $type_text = '余额';
                break;
            case 'score':
                $type_text = '积分';
                break;
            case 'cash':
                $type_text = '现金(手动打款)';
                break;
            case 'change':
                $type_text = '企业付款到零钱';
                break;
            case 'bank':
                $type_text = '企业付款到银行卡';
                break;
        }

        return $type_text;
    }


    public function buyer()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'buyer_id')->field('id,nickname,avatar,mobile,prevtime,logintime,jointime');
    }

    public function agent()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'agent_id')->field('id,nickname,avatar,mobile,prevtime,logintime,jointime');
    }

    public function order()
    {
        return $this->belongsTo(\app\admin\model\shopro\order\Order::class, 'order_id');
    }


    /**
     * 待入账
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', 0);
    }

    public function commissionOrder()
    {
        // 要把 下单人信息移除
        return $this->belongsTo(\app\admin\model\shopro\commission\Order::class, 'commission_order_id');
    }
}
