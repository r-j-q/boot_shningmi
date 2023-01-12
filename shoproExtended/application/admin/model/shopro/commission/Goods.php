<?php

namespace app\admin\model\shopro\commission;

use think\Model;

class Goods extends Model
{
    // 表名
    protected $name = 'shopro_commission_goods';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 追加属性
    protected $append = [
    ];

    public function getCommissionRulesAttr($value, $data)
    {
        //默认规则
        if($data['self_rules'] == 0) {
            return '';
        }
        return json_decode($value, true);
    }

    public function getCommissionConfigAttr($value, $data)
    {
        //默认规则
        if($data['self_rules'] == 0) {
            return '';
        }
        if(!$data['commission_config']) {
            return '';
        }
        return json_decode($value, true);
    }

    public function goods()
    {
        return $this->belongsTo('app\admin\model\shopro\goods\Goods', 'goods_id', 'id');
    }
}
