<?php

namespace app\admin\model\shopro\commission;


use app\admin\model\shopro\user\MoneyLog;
use app\admin\model\shopro\user\ScoreLog;
use addons\shopro\library\commission\Agent as AgentLibrary;
use think\Model;
use think\Db;

class Agent extends Model
{
    // 表名
    protected $name = 'shopro_commission_agent';
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    // 追加属性
    protected $append = [
        'status_text',
        'delay_money',
        'level_status_text'
    ];


    public function getStatusTextAttr($value, $data) 
    {
        $status_text = '';

        switch ($data['status']) {
            case AgentLibrary::AGENT_STATUS_NORMAL:
                $status_text = '正常';
                break;
            case AgentLibrary::AGENT_STATUS_PENDING:
                $status_text = '审核中';
                break;
            case AgentLibrary::AGENT_STATUS_FREEZE:
                $status_text = '冻结';
                break;
            case AgentLibrary::AGENT_STATUS_FORBIDDEN:
                $status_text = '禁用';
                break;
            case AgentLibrary::AGENT_STATUS_NEEDINFO:
                $status_text = '完善资料';
                break;
            case AgentLibrary::AGENT_STATUS_REJECT:
                $status_text = '审核驳回';
                break;
        }

        return $status_text;
    }

     // 获取分销商待入账佣金
    public function getDelayMoneyAttr($value, $data)
    {
        return number_format(Reward::waiting()->where('agent_id', $data['user_id'])->sum('commission'), 2, '.', '');
    }


    public function user()
    {
        return $this->belongsTo('\app\admin\model\shopro\user\User', 'user_id', 'id');
    }

    public function agentLevel()
    {
        return $this->belongsTo('\app\admin\model\shopro\commission\Level', 'level', 'level');
    }

    public function parentAgent()
    {
        return $this->belongsTo('\app\admin\model\shopro\user\User', 'parent_agent_id', 'id');
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

    public function getLevelStatusTextAttr($value ,$data) {
        if($data['level_status'] != 0) {
            $text = Level::get($data['level_status']);
            if($text) {
                return $text->name;
            }
        }
        return '';
    }

}
