<?php

namespace addons\shopro\job;

use think\queue\Job;
use think\Db;

/**
 * 处理分销任务
 */
class CommissionJob extends BaseJob
{
    /**
     * 分销商升级
     *
     * @param Job $job      当前的任务对象
     * @param int $userId   升级用户ID  
     */
    public function agentUpgradeJob(Job $job, $data)
    {
        // 1.统计用户表、分销商表信息 使用library的Agent类去更新
        // 2.检查是否能成为分销商 如果刚好能成为分销商，走新增分销商流程 走library的成为分销商条件
        // 3.检查是否能往上升级 走AgentLevel方法 按照权重排序倒序检查
        // 4.递归往上继续走
        try{
            Db::transaction(function () use ($job, $data) {
                $agent = new \addons\shopro\library\commission\Agent($data['userId']);
                if(!$agent->user) {
                    \think\Log::error('queue-' . get_class() . '：分销商ID' . $data['userId'] . '不存在');
                }else {
                    $agent->runUpgradeAgentPlan();
                }
                $job->delete();
            });
        }catch(\Exception $e) {
            \think\Log::error('queue-' . get_class() . '：分销商升级执行失败,错误信息：' . $e->getMessage() . '|' . $e->getLine());
        }
    }
}