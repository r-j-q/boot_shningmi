<?php

namespace addons\shopro\model\commission;

use think\Model;
use addons\shopro\model\User;

class Log extends Model
{
    // 表名
    protected $name = 'shopro_commission_log';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = false;


    /**
     * 获取动态明细
     *
     * @return array
     */
    public static function getList($params)
    {
        $user = User::info();
        extract($params);

        // 全部关联用户，然后循环处理
        $logs = self::where('agent_id', $user->id)->with(['oper'])->order('id', 'desc')->paginate($per_page ?? 10)->toArray();

        foreach ($logs['data'] as $key => &$log) {
            if (in_array($log['oper_type'], ['admin', 'system'])) {
                $log['oper'] = null;
            }
        }

        return $logs;
    }




    public function oper() {
        return $this->belongsTo(\addons\shopro\model\User::class, 'oper_id')->field('id,nickname,avatar');
    }
}
