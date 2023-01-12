<?php

namespace addons\shopro\library\commission;

use addons\shopro\library\commission\Config;
use addons\shopro\model\User as UserModel;
use addons\shopro\model\commission\Agent as AgentModel;
use addons\shopro\model\commission\Level as LevelModel;
use addons\shopro\model\commission\Reward as RewardModel;

/**
 * 分销商业务
 */
class Agent
{

    public $user;     // 商城用户
    public $agent;    // 分销商用户
    public $_config;    // 分销设置
    public $parentAgentId;

    // 分销商状态 AGENT_STATUS
    const AGENT_STATUS_NORMAL = 'normal';       // 正常 
    const AGENT_STATUS_PENDING = 'pending';     // 审核中 不分佣、不打款、没有团队信息
    const AGENT_STATUS_FREEZE = 'freeze';       // 冻结 正常记录分佣、不打款，记录业绩和团队信息 冻结解除后立即打款
    const AGENT_STATUS_FORBIDDEN = 'forbidden'; // 禁用 不分佣、不记录业绩和团队信息
    const AGENT_STATUS_NEEDINFO = 'needinfo';   // 需要完善表单资料 临时状态
    const AGENT_STATUS_REJECT = 'reject';       // 审核驳回, 重新修改   临时状态
    const AGENT_STATUS_NULL = NULL;             // 未满足成为分销商条件

    // 完善资料状态 INFO_STATUS
    const INFO_STATUS_REJECT = -1;  // 资料驳回
    const INFO_STATUS_NONE = 0;  // 未完善资料
    const INFO_STATUS_COMPLETED = 1;     // 已完善
    const INFO_STATUS_NULL = null;     // 无需完善资料

    // 分销商升级锁 UPGRADE_LOCK
    const UPGRADE_LOCK_OPEN = 1;  // 禁止分销商升级
    const UPGRADE_LOCK_CLOSE = 0;  // 允许分销商升级

    /**
     * 构造函数
     * 
     * @param int      $user_id     用户ID
     */
    public function __construct($user_id)
    {
        $this->user = UserModel::where('id', $user_id)->field('id, nickname, parent_user_id, child_user_count, child_user_count_1, total_consume')->find();
        $this->agent = AgentModel::get($user_id);
        $this->_config = new Config();
    }

    // 获取分销商状态
    public function getAgentStatus()
    {
        if (empty($this->agent)) {
            return self::AGENT_STATUS_NULL;
        }
        if ($this->agent->status === self::AGENT_STATUS_PENDING && $this->_config->needAgentForm() && $this->agent->info_status === self::INFO_STATUS_REJECT) {
            return self::AGENT_STATUS_REJECT;
        }
        return $this->agent->status;
    }

    // 获取分销商可参与状态 正常和冻结都可正常浏览
    public function isAgentAvaliable()
    {
        $status = $this->getAgentStatus();
        if (in_array($status, [self::AGENT_STATUS_NORMAL, self::AGENT_STATUS_FREEZE])) {
            return true;
        }
        return false;
    }

    // 获取分销商等级
    public function getAgentLevel()
    {
        if (empty($this->agent)) {
            return 0;
        }
        $level = LevelModel::get($this->agent->level);
        if (!$level) {
            return 1;
        }
        return $level->level;
    }

    // 获取分销商等级信息
    public function getAgentLevelInfo()
    {
        if (empty($this->agent)) {
            return null;
        }
        $level = LevelModel::get($this->agent->level);
        if (!$level) {
            return LevelModel::get(1);;  // 找不到分销商等级 则默认为初级
        }
        return $level;
    }

    // 获取分销商待入账佣金
    public function getAgentDelayMoney()
    {
        return round(RewardModel::waiting()->where('agent_id', $this->user->id)->sum('commission'), 2);
    }

    // 分销商升级是否锁定
    public function getAgentUpgradeLock()
    {
        if (empty($this->agent)) {
            return true;
        }
        if ($this->agent->upgrade_lock == self::UPGRADE_LOCK_OPEN) {
            return true;
        }

        return false;
    }

    // 获取分销商信息 返回实时状态
    public function getAgentInfo()
    {
        $agentStatus = $this->getAgentStatus();

        // 检查用户是否达成分销商条件 达成->添加分销商记录
        if ($agentStatus == self::AGENT_STATUS_NULL) {
            $agentStatus = $this->becomeAgent();
        }

        $response = [
            'status' => $agentStatus,
            'data'   => null,
            'msg'    => ''
        ];

        switch ($agentStatus) {
            case self::AGENT_STATUS_NULL:
                $response['msg'] = '您暂时不能成为分销商';
                break;
            case self::AGENT_STATUS_NORMAL:
                $response['data'] = $this->agent;
                $response['msg'] = '分销商详情';
                break;
            case self::AGENT_STATUS_FORBIDDEN:
                $response['msg'] = '您的账户已禁用,请联系客服解决';
                break;
            case self::AGENT_STATUS_PENDING:
                $response['msg'] = '您的资料正在审核,请耐心等待';
                break;
            case self::AGENT_STATUS_FREEZE:
                $response['data'] = $this->agent;
                $response['msg'] = '您的账户已被冻结,部分功能暂不可用';
                break;
            case self::AGENT_STATUS_NEEDINFO:
                $response['msg'] = '请前往完善您的信息';
                break;
            case self::AGENT_STATUS_REJECT:
                $response['data'] = $this->agent;
                $response['msg'] = '您的信息被驳回,请修改后重新提交';
                break;
        }
        return $response;
    }

    // 查询上级用户是否为分销商 是则返回分销商用户ID
    public function getParentAgentId()
    {
        if ($this->parentAgentId === null) {
            $this->parentAgentId = 0;
            $parent_user_id = $this->user->parent_user_id;
            // 未绑定分销商,从分享记录查找最近的分销商
            if ($parent_user_id === null) {
                $sharedLog = \addons\shopro\model\Share::checkLatestShareLogByAgent($this->user->id);
                if ($sharedLog) {
                    $parent_user_id = $sharedLog['share_id'];
                }
            }
            if ($parent_user_id > 0) {
                // 再次检查上级分销商是否可用
                $parentAgent = AgentModel::avaliable()->where(['user_id' => $parent_user_id])->find();
                if ($parentAgent) {
                    $this->parentAgentId = $parentAgent->user_id;
                }
            }
        }

        return $this->parentAgentId;
    }

    /**
     * 成为分销商
     */
    public function becomeAgent($applyInfo = '')
    {
        $condition = $this->_config->getBecomeAgentEvent();
        $agentStatus = self::AGENT_STATUS_NULL;
        $infoStatus = self::INFO_STATUS_NULL;
        // 无需成为分销商
        if ($this->getAgentStatus() !== $agentStatus) {
            return $this->getAgentStatus();
        }

        $check = false;  // 是否满足条件
        switch ($condition['type']) {
            case 'apply':   // 直接自助申请
                $check = true;
                break;
            case 'goods':   // 需购买指定产品
                $isPayed = \addons\shopro\model\OrderItem::checkUserPayedByGoodsIds($this->user->id, $condition['value']);
                if ($isPayed) {
                    $check = true;
                }
                break;
            case 'consume': // 消费累计
                if ($this->user->total_consume >= $condition['value']) {
                    $check = true;
                }
                break;
        }
        // 可以成为分销商 检查系统设置
        if ($check) {
            // 需后台审核
            if ($this->_config->isAgentCheck()) {
                $agentStatus = self::AGENT_STATUS_PENDING;
            } else {
                $agentStatus = self::AGENT_STATUS_NORMAL;
            }
            // 需要提交资料
            if ($this->_config->needAgentForm()) {
                if ($applyInfo !== '') {
                    $infoStatus = self::INFO_STATUS_COMPLETED;  // 已完善资料
                } else {
                    $infoStatus = self::INFO_STATUS_NONE;   // 未完善资料 
                    $agentStatus = self::AGENT_STATUS_NEEDINFO;  // 需要主动提交资料,暂时不加分销商信息
                }
            } else {
                $infoStatus = self::INFO_STATUS_NULL;   // 不需要完善表单
            }
        }

        // 可以直接添加分销商信息
        if ($agentStatus === self::AGENT_STATUS_NORMAL || $agentStatus === self::AGENT_STATUS_PENDING) {
            AgentModel::create([
                'user_id' => $this->user->id,
                'level' => 1,  // 默认分销商等级ID
                'parent_agent_id' => $this->getParentAgentId(),
                'status' => $agentStatus,
                'info_status' => $infoStatus,
                'apply_info' => $applyInfo,
                'apply_num' => $applyInfo == '' ? 0 : 1,
                'becometime' => time()
            ]);

            // 当分销商需审核并且绑定关系事件等于成为子分销商时，先不绑定用户关系
            if($this->_config->getInviteLockEvent() === 'agent' && $agentStatus === self::AGENT_STATUS_PENDING) {
                $this->user->parent_user_id = 0;
                $this->user->save();
            }else {
                $this->user->parent_user_id = $this->getParentAgentId();
                $this->user->save();
            }
            if($this->user->parent_user_id !== 0) {
                Log::write($this->user->parent_user_id, 'share', ['user' => $this->user], ['oper_type' => 'user', 'oper_id' => $this->user->id]);
            }

            if ($this->user->parent_user_id !== 0 && $agentStatus === self::AGENT_STATUS_NORMAL) {
                $this->asyncAgentUpgrade($this->user->id);
            }
            $this->agent = AgentModel::get($this->user->id);
            Log::write($this->agent->user_id, 'agent', ['type' => 'status', 'status' => $agentStatus]);
        }
        return $agentStatus;
    }


    /**
     * 绑定用户关系
     * 
     * @param string   $event          事件标识(share=点击分享链接, pay=首次支付, agent=成为子分销商)
     * @param int      $bindAgentId    可指定需绑定的分销商用户ID 默认从分享记录中去查
     */
    public function bindUserRelation($event, $bindAgentId = 0)
    {
        // 不满足绑定用户事件
        if ($this->_config->getInviteLockEvent() !== $event) {
            return false;
        }

        // 该用户已经有上级
        if ($this->user->parent_user_id !== null) {
            return false;
        }
        if ($bindAgentId) {
            $bindAgent = new Agent($bindAgentId);
        } else {
            $sharedLog = \addons\shopro\model\Share::checkLatestShareLogByAgent($this->user->id);
            if ($sharedLog) {
                $bindAgent = new Agent($sharedLog['share_id']);
            }
        }
        if (!isset($bindAgent) || !$bindAgent->isAgentAvaliable()) {
            return false;
        }

        $bindCheck = false;   // 默认不绑定
        switch ($this->_config->getInviteLockEvent()) {
            case 'share':
                $bindCheck = true;
                break;
            case 'pay':
                if ($this->user->total_consume > 0) {
                    $bindCheck = true;
                }
                break;
            case 'agent':
                // 成为子分销商绑定:无需处理 在becomeAgent里判断
                break;
        }

        // 允许绑定用户
        if ($bindCheck) {
            $this->user->parent_user_id = $bindAgent->user->id;
            $this->user->save();
            Log::write($bindAgent->user->id, 'share', ['user' => $this->user], ['oper_type' => 'user', 'oper_id' => $this->user->id]);
            return true;
        }
        return false;
    }


    public function asyncAgentUpgrade($userId)
    {
        if ($userId) {
            \think\Queue::later(0, '\addons\shopro\job\CommissionJob@agentUpgradeJob', [
                'userId' => $userId
            ], 'shopro');
        }
    }
    /**
     * 执行用户统计、分销商信息统计、分销商等级升级计划 (递归往上升级，为了防止阻塞，使用异步递归)
     * 
     * @param bool      $upgrade                   执行分销商等级升级
     */
    public function runUpgradeAgentPlan($upgrade = true)
    {
        // 获取下级直推团队用户信息
        $nextUserTeam = UserModel::where(['parent_user_id' => $this->user->id, 'status' => 'normal'])->column('id, child_user_count, child_user_count_1, total_consume');
        // 一级用户人数 = 直推用户人数
        $this->user->child_user_count_1 = count($nextUserTeam);
        // 二级用户人数 = 直推用户的直推用户人数
        $this->user->child_user_count_2 = array_sum(array_column($nextUserTeam, 'child_user_count_1'));
        // 团队用户人数 = 直推用户人数 + 直推用户的团队用户人数
        $this->user->child_user_count = $this->user->child_user_count_1 + array_sum(array_column($nextUserTeam, 'child_user_count'));
        $this->user->save();

        $nextAgentTeam = $this->getNextAgentTeam();
        if ($this->isAgentAvaliable()) {
            // 一级分销商人数
            $this->agent->child_agent_count_1 = count($nextAgentTeam);
            // 二级分销商人数 = 一级分销商的一级分销商人数
            $this->agent->child_agent_count_2 = array_sum(array_column($nextAgentTeam, 'child_agent_count_1'));
            // 团队分销商人数 = 一级分销商人数 + 一级的团队分销商人数
            $this->agent->child_agent_count = $this->agent->child_agent_count_1 + array_sum(array_column($nextAgentTeam, 'child_agent_count'));
            // 一级分销订单金额 = 一级分销商的订单金额
            $this->agent->child_order_money_1 = array_sum(array_column($nextAgentTeam, 'order_money'));
            // 二级分销订单金额 = 一级分销商的一级分销订单金额
            $this->agent->child_order_money_2 = array_sum(array_column($nextAgentTeam, 'child_order_money_1'));
            // 团队分销订单金额 = 一级分销商的团队分销订单金额 + 我的直推分销订单金额
            $this->agent->child_order_money = array_sum(array_column($nextAgentTeam, 'child_order_money')) + $this->agent->order_money;
            // 一级分销订单数量 = 一级分销商的订单数量
            $this->agent->child_order_count_1 = array_sum(array_column($nextAgentTeam, 'order_count'));
            // 二级分销订单数量 = 一级分销商的二级分销订单数量
            $this->agent->child_order_count_2 = array_sum(array_column($nextAgentTeam, 'child_order_count_1'));
            // 团队分销订单数量 = 一级分销商的团队分销订单金额 + 我的直推分销订单金额
            $this->agent->child_order_count = array_sum(array_column($nextAgentTeam, 'child_order_count')) + $this->agent->order_count;
            // 一级分销商等级统计
            $child_agent_level_1 = array_count_values(array_column($nextAgentTeam, 'level'));
            ksort($child_agent_level_1);
            $this->agent->child_agent_level_1 = $child_agent_level_1;
            // 团队分销商等级统计 = 一级分销商等级 + 一级分销商的团队分销商等级
            $child_agent_level = $this->childAgentLevelCount(array_column($nextAgentTeam, 'child_agent_level'), $this->agent->child_agent_level_1);
            ksort($child_agent_level);
            $this->agent->child_agent_level = $child_agent_level;
            $this->agent->save();

            // 分销商自动升级
            if (!$this->getAgentUpgradeLock() && $upgrade) {
                $canUpgradeLevel = $this->checkAgentUpgradeLevel();
                if ($canUpgradeLevel) {
                    if ($this->_config->isUpgradeCheck()) {
                        $this->agent->level_status = $canUpgradeLevel;
                        Log::write($this->agent->user_id, 'agent', ['type' => 'level_status', 'level_status' => ['level' => LevelModel::get($canUpgradeLevel), 'action' => 'apply']]);
                    } else {
                        $this->agent->level = $canUpgradeLevel;
                        Log::write($this->agent->user_id, 'level', ['level' =>  LevelModel::get($canUpgradeLevel)]);
                    }
                    $this->agent->save();
                }
            }
        }
        $parentAgentId = $this->getParentAgentId();
        if ($parentAgentId) {
            $this->asyncAgentUpgrade($parentAgentId);
        }
    }

    private function childAgentLevelCount($childAgentLevelArray, $childAgentLevel1Array)
    {
        $childAgentLevelCount = [];
        foreach ($childAgentLevelArray as &$agentLevel) {
            if (!empty($agentLevel)) {
                $agentLevel = json_decode($agentLevel, true);
                array_walk($agentLevel, function ($count, $level) use (&$childAgentLevelCount) {
                    if (isset($childAgentLevelCount[$level])) {
                        $childAgentLevelCount[$level] += $count;
                    } else {
                        $childAgentLevelCount[$level] = $count;
                    }
                });
            }
        }
        array_walk($childAgentLevel1Array, function ($count, $level) use (&$childAgentLevelCount) {
            if (isset($childAgentLevelCount[$level])) {
                $childAgentLevelCount[$level] += $count;
            } else {
                $childAgentLevelCount[$level] = $count;
            }
        });
        return $childAgentLevelCount;
    }

    // 获取下级直推团队分销商信息
    public function getNextAgentTeam()
    {
        if ($this->agent && $this->isAgentAvaliable()) {
            if (empty($this->nextAgentTeam)) {
                $this->nextAgentTeam = AgentModel::avaliable()->where([
                    'parent_agent_id' => $this->user->id
                ])->column('user_id, level, child_agent_count, child_agent_count_1, child_order_money, child_order_money_1, order_money, child_order_count, child_order_count_1, order_count, child_agent_level');
            }
            return $this->nextAgentTeam;
        }

        return [];
    }

    // 获取可升级的分销商等级
    public function getNextAgentLevel()
    {
        $nextAgentLevel = null;
        $agentLevel = $this->getAgentLevel();
        if ($agentLevel) {
            $nextAgentLevel = LevelModel::where([
                'level' => ['gt', $agentLevel]
            ])->order('level asc')->select();
        }
        return $nextAgentLevel;
    }

    // 比对当前分销商条件是否满足升级规则
    public function checkAgentUpgradeLevel()
    {
        $nextAgentLevel = $this->getNextAgentLevel();
        if ($nextAgentLevel) {
            foreach ($nextAgentLevel as $level) {
                $checkLevel[$level->level] = $this->isMatchUpgradeLevelRule($level);
                // 不允许越级升级
                if (!$this->_config->isUpgradeJump()) break;
            }
            $checkLevel = array_reverse($checkLevel, true);
            $canUpgradeLevel = array_search(true, $checkLevel);
            if ($canUpgradeLevel) {
                return $canUpgradeLevel;
            }
        }
        return 0;
    }

    // 分销商升级规则检查
    public function isMatchUpgradeLevelRule($level)
    {
        foreach ($level->upgrade_rules as $name => $value) {
            $match[$name] = false;
            switch ($name) {
                case 'total_consume':   // 用户消费金额
                case 'child_user_count':    // 团队用户人数
                case 'child_user_count_1':  // 一级用户人数
                case 'child_user_count_2':  // 二级用户人数
                    $match[$name] = $this->user->$name >= $value;
                    break;
                case 'order_money': // 自购、直推分销订单金额
                case 'child_order_money_1': // 一级分销订单金额
                case 'child_order_money_2': // 二级分销订单金额
                case 'child_order_money': // 团队分销订单金额

                case 'order_count': // 自购、直推分销订单数量
                case 'child_order_count': // 团队分销订单数量
                case 'child_order_count_1': // 一级分销订单数量
                case 'child_order_count_2': // 二级分销订单数量

                case 'child_agent_count': // 团队分销商人数
                case 'child_agent_count_1': // 一级分销商人数
                case 'child_agent_count_2': // 二级分销商人数
                    $match[$name] = $this->agent->$name >= $value;
                    break;
                case 'child_agent_level':   // 团队分销商等级统计
                case 'child_agent_level_1': // 一级分销商等级统计
                    $match[$name] = true;
                    if (count($value) > 0) {
                        if (empty($this->agent->$name)) {
                            $match[$name] = false;
                        } else {
                            foreach ($value as $k => $row) {
                                if (!isset(($this->agent->$name)[$row['level']]) || ($this->agent->$name)[$row['level']] < $row['count']) {
                                    $match[$name] = false;
                                    break;
                                }
                            }
                        }
                    }
                    break;
            }
            // ①满足任意一种条件:只要有一种符合立即返回可以升级状态
            if (!$level->upgrade_type && $match[$name]) {
                return true;
                break;
            }

            // ②满足所有条件:不满足任意一种条件立即返回不可升级状态
            if ($level->upgrade_type && !$match[$name]) {
                return false;
                break;
            }
        }
        // 循环完所有的 如果是①的情况则代表都不符合条件，如果是②则代表都符合条件 返回对应状态即可
        return boolval($level->upgrade_type);
    }
}
