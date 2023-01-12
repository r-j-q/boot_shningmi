<?php

namespace addons\shopro\model\commission;

use think\Model;
use addons\shopro\library\commission\Agent as AgentLibrary;
use addons\shopro\model\User;

class Reward extends Model
{
    // 表名
    protected $name = 'shopro_commission_reward';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 追加属性
    protected $append = [
        'status_name'
    ];

    // 分销佣金状态  table: commission_reward, field: status
    const COMMISSION_REWARD_STATUS_WAITING = 0;  // 未结算、待入账
    const COMMISSION_REWARD_STATUS_ACCOUNTED = 1;  // 已结算、已入账
    const COMMISSION_REWARD_STATUS_BACK = -1;  // 已退回
    const COMMISSION_REWARD_STATUS_CANCEL = -2;  // 已取消


    /**
     * 获取佣金明细
     *
     * @return array
     */
    public static function getList($params)
    {
        extract($params);

        // 获取佣金记录
        $rewards = self::buildSearch($params)->with(['buyer'])->order('id', 'desc')->paginate($per_page ?? 10);

        // 获取查询条件的总佣金
        $type = $type ?? 'all';
        if ($type == 'all') {
            // 收入，包含待入账
            $total_money = self::buildSearch($params)->income()->sum('commission');
        } else {
            $total_money = self::buildSearch($params)->sum('commission');
        }

        return [
            'rewards' => $rewards,
            'total_money' => $total_money,
        ];
    }


    /**
     * 构建查询条件
     */
    private static function buildSearch($params)
    {
        $user = User::info();
        extract($params);

        $date = isset($date) ? explode('-', $date) : [];
        $start = $date[0] ? strtotime($date[0]) : strtotime(date('Y-m') . '-01');
        $end = $date[1] ? (strtotime($date[1]) + 86399) : strtotime(date('Y-m-d')) + 86399;

        $rewards = self::where('agent_id', $user->id);

        $type = $type ?? 'all';
        if ($type != 'all' && in_array($type, ['waiting', 'back', 'accounted', 'cancel'])) {
            $rewards = $rewards->{$type}();
        }

        $rewards = $rewards->whereBetween('createtime', [$start, $end]);

        return $rewards;
    }

    public function getStatusNameAttr($value, $data)
    {
        $status_name = '';

        switch ($data['status']) {
            case self::COMMISSION_REWARD_STATUS_BACK:
                $status_name = '已退回';
                break;
            case self::COMMISSION_REWARD_STATUS_WAITING:
                $status_name = '待入账';
                break;
            case self::COMMISSION_REWARD_STATUS_ACCOUNTED:
                $status_name = '已入账';
                break;
            case self::COMMISSION_REWARD_STATUS_ACCOUNTED:
                $status_name = '已取消';
                break;
        }

        return $status_name;
    }


    /**
     * 待入账
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', self::COMMISSION_REWARD_STATUS_WAITING);
    }
    /**
     * 已退回
     */
    public function scopeBack($query)
    {
        return $query->where('status', self::COMMISSION_REWARD_STATUS_BACK);
    }

    /**
     * 已入账
     */
    public function scopeAccounted($query)
    {
        return $query->where('status', self::COMMISSION_REWARD_STATUS_ACCOUNTED);
    }

    /**
     * 已取消
     */
    public function scopeCancel($query)
    {
        return $query->where('status', self::COMMISSION_REWARD_STATUS_CANCEL);
    }

    /**
     * 待入账和已入账
     *
     * @return void
     */
    public function scopeIncome($query)
    {
        return $query->where('status', 'in', [self::COMMISSION_REWARD_STATUS_ACCOUNTED, self::COMMISSION_REWARD_STATUS_WAITING]);
    }


    public function buyer()
    {
        return $this->belongsTo(\addons\shopro\model\User::class, 'buyer_id');
    }


    public function order()
    {
        // 要把 下单人信息移除
        return $this->belongsTo(\addons\shopro\model\Order::class, 'order_id')
            ->field('id,type,order_sn,user_id,activity_type,goods_amount,dispatch_amount,status,total_amount,score_amount,total_fee,discount_fee,pay_fee,score_fee,goods_original_amount,pay_type,paytime,ext,createtime');
    }

    public function orderItem()
    {
        return $this->belongsTo(\addons\shopro\model\OrderItem::class, 'order_item_id')->field('id,user_id,order_id,goods_id,goods_title, goods_sku_text,goods_image,goods_original_price,goods_price,goods_num');
    }
}
