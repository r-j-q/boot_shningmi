<?php

namespace addons\shopro\model\commission;

use addons\shopro\model\User;

use think\Model;

class Order extends Model
{
    const COMMISSION_ORDER_STATUS_NO = 0;  // 不计入
    const COMMISSION_ORDER_STATUS_YES = 1;  // 已计入
    const COMMISSION_ORDER_STATUS_BACK = -1;  // 已退回
    const COMMISSION_ORDER_STATUS_CANCEL = -2;  // 已取消
    // 表名
    protected $name = 'shopro_commission_order';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;
    protected $append = [
        'commission_order_status_text',
        // 'commission_reward_status_text',
    ];

    /**
     * 获取分销订单明细
     *
     * @return array
     */
    public static function getList($params)
    {
        extract($params);
        $user = User::info();
        $agentId = $user->id;
        // 获取佣金记录
        $oldModes = closeStrict(['ONLY_FULL_GROUP_BY']);
        $orders = self::buildSearch($params)->field('id, order_id, buyer_id')->with(['buyer', 'order', 'commission_order' => function ($query) use($agentId){
            $query->with(['order_item', 'reward' =>function($query) use($agentId) {
                $query->where('agent_id', $agentId);
            }]);
        }])->group('order_id')->order('id', 'desc')->paginate($per_page ?? 10);

        recoverStrict($oldModes);

        // 获取查询条件的总佣金
        $type = $type ?? 'all';
        if ($type == 'all') {
            // 收入，包含待入账
            $amount = self::buildSearch($params)->yes()->sum('amount');
        } else {
            $amount = self::buildSearch($params)->sum('amount');
        }

        return [
            'orders' => $orders,
            'amount' => $amount,
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
        if ($type != 'all' && in_array($type, ['yes', 'back', 'cancel'])) {
            $rewards = $rewards->{$type}();
        }

        $rewards = $rewards->whereBetween('createtime', [$start, $end]);

        return $rewards;
    }

    /**
     * 已计入
     */
    public function scopeYes($query)
    {
        return $query->where('commission_order_status', self::COMMISSION_ORDER_STATUS_YES);
    }

    /**
     * 已退回
     */
    public function scopeBack($query)
    {
        return $query->where('commission_order_status', self::COMMISSION_ORDER_STATUS_BACK);
    }

    /**
     * 已取消
     */
    public function scopeCancel($query)
    {
        return $query->where('commission_order_status', self::COMMISSION_ORDER_STATUS_CANCEL);
    }

    /**
     * 不计入
     */
    public function scopeNo($query)
    {
        return $query->where('commission_order_status', self::COMMISSION_ORDER_STATUS_NO);
    }

    public function buyer()
    {
        return $this->belongsTo(\addons\shopro\model\User::class, 'buyer_id')->field('id, avatar, nickname');
    }

    public function order()
    {
        return $this->belongsTo(\addons\shopro\model\Order::class, 'order_id')
            ->field('id, order_sn, activity_type, status, ext, createtime');
    }

    public function commissionOrder()
    {
        return $this->hasMany(Order::class, 'order_id', 'order_id');
    }

    public function reward()
    {
        return $this->hasOne(\addons\shopro\model\commission\Reward::class, 'commission_order_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(\addons\shopro\model\OrderItem::class, 'order_item_id')->field('id,user_id,order_id,goods_id,goods_title, goods_sku_text,goods_image,goods_original_price,goods_price,goods_num,refund_status,comment_status,aftersale_status,dispatch_status,dispatch_type');
    }

    public function getCommissionOrderStatusTextAttr($value, $data)
    {
        $status_name = '';

        if (isset($data['commission_order_status'])) {
            switch ($data['commission_order_status']) {
                case self::COMMISSION_ORDER_STATUS_NO:
                    $status_name = '不计入';
                    break;
                case self::COMMISSION_ORDER_STATUS_YES:
                    $status_name = '已计入';
                    break;
                case self::COMMISSION_ORDER_STATUS_BACK:
                    $status_name = '已退回';
                    break;
                case self::COMMISSION_ORDER_STATUS_CANCEL:
                    $status_name = '已取消';
                    break;
            }
        }
        return $status_name;
    }
}
