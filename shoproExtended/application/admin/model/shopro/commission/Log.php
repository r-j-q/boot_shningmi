<?php

namespace app\admin\model\shopro\commission;

use think\Model;

class Log extends Model
{
    // 表名
    protected $name = 'shopro_commission_log';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = false;


    // 追加属性
    protected $append = [
        'event_text',
        'oper_type_text'
    ];


    public function getEventList()
    {
        return [
            'agent' => '分销商',
            'level' => '等级变动',
            'order' => '分销业绩',
            'team' => '团队',
            'reward' => '佣金',
            'share' => '绑定关系', 
        ];
    }


    public function getOperTypeList()
    {
        return [
            'user' => '用户',
            'admin' => '管理员',
            'system' => '系统',
        ];
    }


    public function getEventTextAttr($value, $data) {
        $value = $value ? $value : (isset($data['event']) ? $data['event'] : '');
        $list = $this->getEventList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getOperTypeTextAttr($value, $data) {
        $value = $value ? $value : (isset($data['oper_type']) ? $data['oper_type'] : '');
        $list = $this->getOperTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function oper()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'oper_id')->field('id,nickname,avatar,prevtime,logintime,jointime');
    }


    public function agent()
    {
        return $this->belongsTo(\app\admin\model\User::class, 'agent_id')->field('id,nickname,avatar,prevtime,logintime,jointime');
    }

}
