<?php

namespace app\admin\controller\shopro\commission;

use think\Db;
use app\admin\controller\shopro\Base;
use addons\shopro\library\commission\Log as LogLibrary;
use addons\shopro\exception\Exception;

/**
 * 分销商管理
 *
 */
class Agent extends Base
{

    // protected $relationSearch = true;


    /**
     * @var \app\admin\model\shopro\commission\Agent
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\shopro\commission\Agent;
        $this->userModel = new \app\admin\model\shopro\user\User;
    }

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax()) {
            $nobuildfields = ['nickname', 'mobile'];
            list($where, $sort, $order, $offset, $limit) = $this->custombuildparams(null, $nobuildfields);

            $total = $this->buildSearch()
                ->where($where)
                ->order($sort, $order)
                ->count();

            $list = $this->buildSearch()
                ->with(['user' => function ($query) {
                    return $query->withField('id, avatar, nickname, mobile, child_user_count, child_user_count_1, total_consume');
                }, 'agent_level' => function ($query) {
                    return $query->withField('image, name, level, commission_rules');
                }, 'parent_agent' => function ($query) {
                    return $query->withField('id, avatar, nickname');
                }])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $result = array("total" => $total, "rows" => $list);

            $this->success('查看分销商', null, $result);
        }
        return $this->view->fetch();
    }


    /**
     * 查看团队
     */
    public function team()
    {
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax()) {
            $filter = json_decode($this->request->get("filter", ''), true);
            $parent_user_id = $filter && isset($filter['parent_user_id']) ? $filter['parent_user_id'] : 0;

            $nobuildfields = ['level'];
            list($where, $sort, $order, $offset, $limit) = $this->custombuildparams(null, $nobuildfields);

            $sort = $sort == 'user_id' ? 'id' : $sort;  // 这里用的是 userModel , sort 会自动取 this->model 的主键（user_id）
            $total = $this->buildUserSearch()
                ->where($where)
                ->order($sort, $order)
                ->count();

            $list = $this->buildUserSearch()
                ->with(['agent.agentLevel'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $parentUser = $this->userModel->with(['agent.agentLevel'])->where('id', $parent_user_id)->find();

            $result = array("total" => $total, "rows" => $list, 'parent_user' => $parentUser);

            $this->success('查看分销商', null, $result);
        }
        return $this->view->fetch();
    }



    /**
     * 分销商详情
     */
    public function profile($id)
    {
        $row = $this->model->with(['user' => function ($query) {
            return $query->withField('id, avatar, nickname, mobile, child_user_count, child_user_count_1, child_user_count_2, total_consume');
        }, 'agent_level' => function ($query) {
            return $query->withField('image, name, level, commission_rules');
        }, 'parent_agent' => function ($query) {
            return $query->withField('id, avatar, nickname');
        }])->where('user_id', $id)->find();
        if (!$row) {
            $this->error('未找到分销商');
        }
        if ($this->request->isAjax()) {
            $this->success('分销商详情', null, $row);
        }
        $this->assignconfig('row', $row);
        return $this->view->fetch();
    }

    /**
     * 更新信息
     */
    public function update($id)
    {
        $agent = new \addons\shopro\library\commission\Agent($id);
        if (!$agent->agent) {
            $this->error('未找到分销商');
        }
        $key = $this->request->post('key');
        $value = $this->request->post('value');
        $data = null;
        $runUpgradeAgent = true;     // 升级当前分销商
        $runUpgradeLastAgentId = 0;  // 升级原分销商
        $result = Db::transaction(function () use ($agent, $key, $value, &$data, &$runUpgradeAgent, &$runUpgradeLastAgentId) {
            switch ($key) {
                case 'status':                  // 变更分销商状态
                    $data = $value;
                    if ($value === 'normal' && $agent->user->parent_user_id === 0 && $agent->agent->parent_agent_id !== 0) {
                        $agent->user->parent_user_id = $agent->agent->parent_agent_id;
                        $agent->user->save();
                        \addons\shopro\library\commission\Log::write($agent->agent->parent_agent_id, 'share', ['user' => $agent->user], ['oper_type' => 'user', 'oper_id' => $agent->user->id]);
                    }
                    break;
                case 'level':                   // 变更分销商等级
                    $data = \app\admin\model\shopro\commission\Level::get($value);
                    if (!$data) {
                        throw new Exception('未找到该等级');
                    }
                    break;
                case 'level_status':            // 审核分销商升级
                    if ($agent->agent->level_status == 0) {
                        throw new Exception('该分销商没有审核升级条件');
                    } else {
                        $level = \app\admin\model\shopro\commission\Level::get(['level' => $agent->agent->level_status]);
                        if ($value != 0) {
                            if ($level) {
                                $data['level'] = $level;
                                $data['action'] = 'agree';
                                $agent->agent->level = $level->level;
                                $agent->agent->save();
                            } else {
                                throw new Exception('该等级不存在');
                            }
                        } else {
                            $data['action'] = 'reject';
                        }
                        $value = 0;
                    }
                    break;
                case 'parent_agent_id':         // 变更分销商上级
                    $data = null;
                    if ($agent->agent->parent_agent_id == $value) {
                        throw new Exception('请勿重复选择');
                    }
                    if ($agent->agent->user_id == $value) {
                        throw new Exception('不能绑定本人');
                    }
                    if ($value != 0) {
                        $data = \app\admin\model\shopro\user\User::get($value);
                        if (!$data) {
                            throw new Exception('未找到该分销商');
                        }
                        if (!$this->checkChangeParentAgent($agent->agent->user_id, $value)) {
                            throw new Exception('不能绑定该分销商');
                        }
                    }
                    $runUpgradeLastAgentId = $agent->agent->parent_agent_id;
                    $agent->user->parent_user_id = $value;
                    $agent->user->save();
                    break;
                case 'upgrade_lock':
                case 'apply_info':
                case 'info_status':
                    if ($value === '') {
                        $value = null;
                    }
                    $data = $value;
                    $runUpgradeAgent = false;
                    break;
            }
            return $agent->agent->allowField('status,level,apply_info,parent_agent_id,upgrade_lock,info_status,level_status')->save([
                $key => $value
            ]);
        });

        if ($result) {
            if ($runUpgradeAgent) {
                $agent = new \addons\shopro\library\commission\Agent($agent->agent->user_id);
                $agent->asyncAgentUpgrade($agent->agent->user_id);


                if ($runUpgradeLastAgentId) {
                    $agent->asyncAgentUpgrade($runUpgradeLastAgentId);
                }
            }
            LogLibrary::write($agent->agent->user_id, 'agent', ['type' => $key, $key => $data]);
            return $this->success('更新成功', null, $agent->agent);
        } else {
            return $this->error('更新失败');
        }
    }

    /**
     * 选择
     */
    public function select()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $searchWhere = $this->request->request('searchWhere');
            $total = $this->model
                ->where($where)
                ->whereOr('id', '=', $searchWhere)
                ->whereOr('nickname', 'like', "%$searchWhere%")
                ->whereOr('mobile', 'like', "%$searchWhere%")
                ->order($sort, $order)
                ->field('id, nickname, mobile, avatar')
                ->count();
            $list = $this->model
                ->where($where)
                ->whereOr('id', '=', $searchWhere)
                ->whereOr('nickname', 'like', "%$searchWhere%")
                ->whereOr('mobile', 'like', "%$searchWhere%")
                ->order($sort, $order)
                ->field('id, nickname, mobile, avatar')
                ->limit($offset, $limit)
                ->select();
            $result = array("total" => $total, "rows" => $list);

            $this->success('选择用户', null, $result);
        }
        return $this->view->fetch();
    }


    /**
     * 分销商搜索
     */
    public function buildSearch()
    {
        $filter = $this->request->get("filter", '');
        $filter = (array)json_decode($filter, true);
        $filter = $filter ? $filter : [];

        $nickname = isset($filter['nickname']) ? $filter['nickname'] : '';
        $mobile = isset($filter['mobile']) ? $filter['mobile'] : '';

        $name = $this->model->getQuery()->getTable();
        $tableName = $name . '.';

        $agents = $this->model;

        if ($nickname || $mobile) {
            $agents = $agents->whereExists(function ($query) use ($nickname, $mobile, $tableName) {
                $userTableName = (new \app\admin\model\User())->getQuery()->getTable();

                $query = $query->table($userTableName)->where($userTableName . '.id=' . $tableName . 'user_id');

                if ($nickname) {
                    $query = $query->where('nickname', 'like', "%{$nickname}%");
                }

                if ($mobile) {
                    $query = $query->where('mobile', 'like', "%{$mobile}%");
                }

                return $query;
            });
        }

        return $agents;
    }



    /**
     * 用户 team 搜索 
     */
    public function buildUserSearch()
    {
        $filter = $this->request->get("filter", '');
        $filter = (array)json_decode($filter, true);
        $filter = $filter ? $filter : [];

        $level = isset($filter['level']) ? $filter['level'] : '';

        $name = $this->userModel->getQuery()->getTable();
        $tableName = $name . '.';

        $users = $this->userModel;

        if ($level) {
            $users = $users->whereExists(function ($query) use ($level, $tableName) {
                $agentTableName = (new \app\admin\model\shopro\commission\Agent())->getQuery()->getTable();

                $query = $query->table($agentTableName)->where($tableName . 'id=' . $agentTableName . '.user_id')
                    ->where('level', $level);

                return $query;
            });
        }

        return $users;
    }


    // 递归往上找推荐人，防止出现推荐闭环
    private function checkChangeParentAgent($agentId, $parentAgentId)
    {
        if ($agentId === $parentAgentId) {
            return false;
        }
        if ($parentAgentId == 0) {
            return true;
        }

        $parentAgent = \app\admin\model\shopro\commission\Agent::get($parentAgentId);
        if ($parentAgent) {
            if ($parentAgent->parent_agent_id === 0) {
                return true;
            } else {
                return $this->checkChangeParentAgent($agentId, $parentAgent->parent_agent_id);
            }
        }

        return false;
    }
}
