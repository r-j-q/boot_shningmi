<?php

namespace addons\shopro\model\commission;

use think\Model;
use addons\shopro\library\commission\Agent as AgentLibrary;

class Agent extends Model
{
    protected $pk = 'user_id';
    // 表名
    protected $name = 'shopro_commission_agent';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 追加属性
    protected $append = [
    ];


    public static function getRanking($params) {
        extract($params);

        $goods = self::with(['user' => function ($query) {
                        $query->field('id,avatar,nickname');
                    }])
                    ->field('user_id,level,parent_agent_id,total_income,createtime,status')
                    ->normal()
                    ->order('total_income', 'desc')->order('createtime', 'desc')
                    ->paginate($per_page ?? 10);

        return $goods;
    }


    /**
     * 正常的分销商
     */
    public function scopeNormal($query) {
        return $query->where('status', AgentLibrary::AGENT_STATUS_NORMAL);
    }
    /**
     * 可参与的分销商
     */
    public function scopeAvaliable($query) {
        return $query->where('status', 'in', [AgentLibrary::AGENT_STATUS_NORMAL, AgentLibrary::AGENT_STATUS_FREEZE]);
    }
    /**
     * 禁用的分销商
     */
    public function scopeForbidden($query) {
        return $query->where('status', AgentLibrary::AGENT_STATUS_FORBIDDEN);
    }
    /**
     * 审核中的分销商
     */
    public function scopePending($query) {
        return $query->where('status', AgentLibrary::AGENT_STATUS_PENDING);
    }

    public function user(){
        return $this->belongsTo(\addons\shopro\model\User::class, 'user_id');
    }


    public function level(){
        return $this->belongsTo(\addons\shopro\model\commission\Level::class, 'level', 'level');
    }

    public function getChildAgentLevelAttr($value, $data){
        if(!empty($value)) {
            return json_decode($value, true);
        }
        return [];
    }

    public function setChildAgentLevelAttr($value, $data){
        return json_encode($value);
    }

    public function getChildAgentLevel_1Attr($value, $data){
        if(!empty($value)) {
            return json_decode($value, true);
        }
        return [];
    }

    public function setChildAgentLevel_1Attr($value, $data){
        return json_encode($value);
    }
}
