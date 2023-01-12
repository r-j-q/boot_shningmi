<?php

namespace addons\shopro\library\commission;

use addons\shopro\model\commission\Log as LogModel;
use addons\shopro\model\commission\Agent as AgentModel;



/**
 * 分销商动态通知
 */
class Log
{
    /**
     * 添加分销动态
     * @param int         $agentId       通知分销商用户ID
     * @param string      $event     事件标识: agent=分销商,level=等级变动,order=分销业绩,team=团队,reward=佣金,share=绑定关系
     * @param array      $eventInfo     事件信息
     * @param array       $oper          操作人
     * @param string      $remark        备注，传值则为自定义备注
     */
    public static function write($agentId, $event, $eventInfo = [], $oper = null, $remark = '')
    {

        $eventId = 0;

        if (!$oper) {
            $oper = \addons\shopro\library\Oper::set();
        }
        if ($remark === '') {
            switch ($event) {
                case 'agent':
                    $eventId = $agentId;
                    switch ($eventInfo['type']) {
                        case 'status':
                            switch ($eventInfo['status']) {
                                case 'pending':
                                    $remark = "您的资料已提交,等待管理员审核";
                                    break;
                                case 'forbidden':
                                    $remark = "您的账户已被禁用";
                                    break;
                                case 'normal':
                                    $remark = "恭喜您成为分销商";
                                    break;
                                case 'freeze':
                                    $remark = "您的账户已被冻结";
                                    break;
                            }
                            break;
                        case 'level': // 变更等级
                            $event = 'level';
                            $remark = "您的等级已变更为{$eventInfo['level']['name']}";
                            break;
                        case 'level_status': // 审核分销商升级
                            $event = 'level';
                            switch ($eventInfo['level_status']['action']) {
                                case 'agree':
                                    $remark = "您的升级审核已同意, 变更为{$eventInfo['level_status']['level']['name']}";
                                    break;
                                case 'apply':
                                    $remark = "您已满足{$eventInfo['level_status']['level']['name']}条件, 请等待审核";
                                    break;
                                case 'reject':
                                    $remark = "您的升级审核已被拒绝";
                                    break;
                            }
                            break;
                        case 'parent_agent_id': // 更改推荐人
                            $event = 'share';
                            if (!$eventInfo['parent_agent_id']) {
                                $remark = "您的上级推荐人已移除";
                            } else {
                                $remark = "绑定用户{$eventInfo['parent_agent']['nickname']}为您的推荐人";
                            }
                            break;
                        case 'upgrade_lock':
                            if ($eventInfo['upgrade_lock']) {
                                $remark = '已禁止升级';
                            } else {
                                $remark = '已允许升级';
                            }
                            break;
                        case 'apply_info':
                            $remark = '您的分销商资料信息已更新';
                            break;
                        case 'info_status':
                            switch ($eventInfo['info_status']) {
                                case -1:
                                    $remark = '您的资料被驳回,请重新修改';
                                    break;
                                case 0:
                                    $remark = '您的资料还未完善,请及时完善您的资料';
                                    break;
                                case 1:
                                    $remark = '恭喜! 您的资料审核已通过';
                                    break;
                            }
                            break;
                    }
                    break;
                case 'order':
                    $eventId = $eventInfo['order']['id'];
                    if ($eventInfo['action'] == 'payed') {
                        $goodsName = $eventInfo['order_item']['goods_title'];
                        if (mb_strlen($goodsName) > 9) {
                            $goodsName = mb_substr($goodsName, 0, 5) . '...' . mb_substr($goodsName, -3);
                        }
                        if ($eventInfo['order']['self_buy'] == 1) {
                            $remark = "您购买了{$goodsName},为您新增业绩{$eventInfo['order']['amount']}元, +1分销订单";
                        } else {
                            $remark = "用户{$eventInfo['buyer']['nickname']}购买了{$goodsName},为您新增业绩{$eventInfo['order']['amount']}元, +1分销订单";
                        }
                    } elseif ($eventInfo['action'] == 'refund') {
                        $remark = "用户{$eventInfo['buyer']['nickname']}已退款,已扣除业绩{$eventInfo['order']['amount']}元, -1分销订单";
                    } elseif ($eventInfo['action'] == 'admin') {
                        $remark = "扣除业绩{$eventInfo['order']['amount']}元, -1分销订单";
                    }
                    break;
                case 'level':
                    $eventId = $agentId;
                    $remark = "您的等级已变更为{$eventInfo['level']['name']}";
                    break;
                case 'reward':    // 奖金记录 入账
                    $eventId = $eventInfo['reward']['id'];
                    $actionStr = '';
                    $remark = '';
                    switch ($eventInfo['action']) {
                        case 'payed':
                            $actionStr = '支付成功';
                            break;
                        case 'confirm':
                            $actionStr = '已确认收货';
                            break;
                        case 'finish':
                            $actionStr = '已完成订单';
                            break;
                    }
                    if ($actionStr !== '') {
                        $remark = "用户{$actionStr}, ";
                    }
                    switch ($eventInfo['reward']['status']) {
                        case 0:
                            $rewardStatus = '待入账';
                            break;
                        case 1:
                            $rewardStatus = '已入账';
                            break;
                        case -1:
                            $rewardStatus = '已扣除';
                            break;
                        case -2:
                            $rewardStatus = '已取消';
                            break;
                    }
                    $remark .= "您有{$eventInfo['reward']['commission']}元佣金{$rewardStatus}";
                    break;
                case 'share':
                    $eventId = $agentId;
                    $remark = "您已成为用户{$eventInfo['user']['nickname']}的推荐人";
                    break;
            }
        }

        if ($remark !== '') {
            $logData = [
                'agent_id' => $agentId,
                'event' => $event,
                'event_id' => $eventId,
                'remark' => $remark,
                'oper_type' => $oper['oper_type'],
                'oper_id' => $oper['oper_id'],
                'createtime' => time()
            ];
            return LogModel::create($logData);
        }
        return false;
    }
}
