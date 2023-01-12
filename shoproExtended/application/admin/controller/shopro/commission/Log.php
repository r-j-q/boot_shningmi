<?php

namespace app\admin\controller\shopro\commission;

use app\admin\controller\shopro\Base;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;


/**
 * 分销动态
 *
 * @icon fa fa-circle-o
 */
class Log extends Base
{

    /**
     * Order模型对象
     * @var \app\admin\model\shopro\commission\Log
     */
    protected $model = null;
    protected $noNeedRight = ['getEventAll'];
    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\shopro\commission\Log;
    }


    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax()) {
            $nobuildfields = [
                'agent_nickname', 'agent_mobile',
                'oper_nickname', 'oper_mobile',
            ];

            list($where, $sort, $order, $offset, $limit) = $this->custombuildparams(null, $nobuildfields);

            $total = $this->buildSearch()
                ->where($where)
                ->order($sort, $order)
                ->count();

            // 查询分页数据
            $list = $this->buildSearch()
                ->with(['agent', 'oper'])       // 默认oper 只关联用户，下面循环关联管理员
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $list = collection($list)->toArray();
            foreach ($list as $key => $log) {
                if ($log['oper_type'] == 'admin') {
                    $list[$key]['oper'] = $log['oper_id'] ? \app\admin\model\Admin::field('id,username,nickname,avatar')->where('id', $log['oper_id'])->find() : null;
                }
            }

            $result = [
                "total" => $total,
                "rows" => $list,
            ];

            $this->success('分销动态', null, $result);
        }
        return $this->view->fetch();
    }


    // 获取所有 event
    public function getEventAll() {
        $event = $this->model->getEventList();

        $newData[] = ['name' => '全部', 'type' => 'all'];

        foreach ($event as $k => $v) {
            $newData[] = [
                'name' => $v,
                'type' => $k
            ];
        }

        return $this->success('获取成功', null, $newData);
    }



    private function buildSearch()
    {
        $filter = $this->request->get("filter", '');
        $filter = (array)json_decode($filter, true);
        $filter = $filter ? $filter : [];

        // 操作人
        $oper_type = isset($filter['oper_type']) ? $filter['oper_type'] : 'all';
        $oper_nickname = isset($filter['oper_nickname']) ? $filter['oper_nickname'] : '';
        $oper_mobile = isset($filter['oper_mobile']) ? $filter['oper_mobile'] : '';
        // 分销商
        $agent_nickname = isset($filter['agent_nickname']) ? $filter['agent_nickname'] : '';
        $agent_mobile = isset($filter['agent_mobile']) ? $filter['agent_mobile'] : '';

        // 当前表名
        $tableName = $this->model->getQuery()->getTable();

        $logs = $this->model;

        // 分销商
        if ($agent_nickname || $agent_mobile) {
            $logs = $logs->whereExists(function ($query) use ($agent_nickname, $agent_mobile, $tableName) {
                $userTableName = (new \app\admin\model\User())->getQuery()->getTable();
                $query = $query->table($userTableName)->where($userTableName . '.id=' . $tableName . '.agent_id');

                if ($agent_nickname) {
                    $query = $query->where('nickname', 'like', "%{$agent_nickname}%");
                }

                if ($agent_mobile) {
                    $query = $query->where('mobile', 'like', "%{$agent_mobile}%");
                }

                return $query;
            });
        }

        if ($oper_type != 'all') {
            if ($oper_type == 'user') {
                if ($oper_nickname || $oper_mobile) {
                    $logs = $logs->whereExists(function ($query) use ($oper_nickname, $oper_mobile, $tableName) {
                        $userTableName = (new \app\admin\model\User())->getQuery()->getTable();
                        $query = $query->table($userTableName)->where($userTableName . '.id=' . $tableName . '.oper_id');

                        if ($oper_nickname) {
                            $query = $query->where('nickname', 'like', "%{$oper_nickname}%");
                        }

                        if ($oper_mobile) {
                            $query = $query->where('mobile', 'like', "%{$oper_mobile}%");
                        }

                        return $query;
                    });
                }
            } else if ($oper_type == 'admin') {
                if ($oper_nickname) {
                    $logs = $logs->whereExists(function ($query) use ($oper_nickname, $tableName) {
                        $userTableName = (new \app\admin\model\User())->getQuery()->getTable();
                        $query = $query->table($userTableName)->where($userTableName . '.id=' . $tableName . '.oper_id');

                        if ($oper_nickname) {
                            $query = $query->where(function ($query) use ($oper_nickname) {
                                $query->where('nickname', 'like', "%{$oper_nickname}%")->whereOr('username', 'like', "%{$oper_nickname}%");
                            });
                        }
                        return $query;
                    });
                }
            }
        }
        return $logs;
    } 

}
