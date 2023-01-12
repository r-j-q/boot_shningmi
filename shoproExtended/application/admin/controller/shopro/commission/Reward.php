<?php

namespace app\admin\controller\shopro\commission;

use app\admin\controller\shopro\Base;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;


/**
 * 佣金明细
 *
 * @icon fa fa-circle-o
 */
class Reward extends Base
{

    /**
     * Order模型对象
     * @var \app\admin\model\shopro\commission\Reward
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\shopro\commission\Reward;
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
                'buyer_nickname','buyer_mobile',
                'agent_nickname','agent_mobile',
                'order_sn',
            ];

            list($where, $sort, $order, $offset, $limit) = $this->custombuildparams(null, $nobuildfields);

            $total = $this->buildSearch()
                ->where($where)
                ->order($sort, $order)
                ->count();

            // 查询分页数据
            $list = $this->buildSearch()
                ->with(['order' => function ($query) {
                    $query->removeOption('soft_delete')->field('id,type,order_sn,user_id,activity_type,goods_amount,status,total_amount,score_amount,total_fee,pay_fee,score_fee,pay_type,paytime,platform,ext,createtime,updatetime');
                }, 'buyer', 'agent'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            // 处理顶部统计数据
            $commission_total = 0;
            $commissioned_total = 0;
            $delay_total = 0;
            $commission_back_total = 0;

            $total_page = intval(ceil($total / 1000));
            for ($i = 0; $i < $total_page; $i++) {
                $totalList = $this->buildSearch()
                    ->where($where)
                    ->order($sort, $order)
                    ->limit(($i * 1000), 1000)
                    ->select();

                foreach ($totalList as $key => $reward) {
                    if ($reward['status'] == 1) {
                        $commissioned_total += $reward['commission'];
                    } else if ($reward['status'] == -1) {
                        $commission_back_total += $reward['commission'];
                    } else if ($reward['status'] == 0) {
                        $delay_total += $reward['commission'];
                    }
                    $commission_total += $reward['commission'];
                }
            }

            $result = [
                "total" => $total,
                "rows" => $list,
                "commission_total" => number_format($commission_total, 2, '.', ''),
                "commissioned_total" => number_format($commissioned_total, 2, '.', ''),
                "delay_total" => number_format($delay_total, 2, '.', ''),
                "commission_back_total" => number_format($commission_back_total, 2, '.', '')
            ];

            $this->success('佣金明细', null, $result);
        }
        return $this->view->fetch();
    }


    /**
     * 修改佣金金额
     *
     * @param int $id
     * @return void
     */
    public function edit ($id = null) {
        $params = $this->request->post();
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        if (!$row) {
            $this->error(__('No Results were found'));
        }

        if ($row['status'] != 0) {
            $this->error('当前状态不可修改');
        }

        $row->commission = $params['commission'];
        $row->save();

        $this->success('修改成功', null, $row);
    }


    /**
     * 分佣
     *
     * @param int $id
     * @return void
     */
    public function runCommission($id = null)
    {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = \think\Db::transaction(function () use ($row) {
            return (new \addons\shopro\library\commission\Reward)->runCommissionReward('admin', $row);
        });

        if ($result) {
            $this->success('结算成功');
        } else {
            $this->error('佣金已结算，请不要重复结算');
        }
    }


    /**
     * 佣金退回
     *
     * @param int $id
     * @return void
     */
    public function backCommission($id = null)
    {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = \think\Db::transaction(function () use ($row) {
            return (new \addons\shopro\library\commission\Reward)->backCommissionReward('admin', $row);
        });

        if ($result) {
            $this->success('退回成功');
        } else {
            $this->error('佣金已退回或未结算');
        }
    }

    /**
     * 取消佣金
     *
     * @param int $id
     * @return void
     */
    public function cancelCommission($id = null)
    {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = \think\Db::transaction(function () use ($row) {
            return (new \addons\shopro\library\commission\Reward)->cancelCommissionReward('admin', $row);
        });

        if ($result) {
            $this->success('退回成功');
        } else {
            $this->error('佣金已退回或未结算');
        }
    }



    private function buildSearch()
    {
        $filter = $this->request->get("filter", '');
        $filter = (array)json_decode($filter, true);
        $filter = $filter ? $filter : [];

        // 用户'parent_nickname','parent_mobile',
        // 购买人
        $buyer_nickname = isset($filter['buyer_nickname']) ? $filter['buyer_nickname'] : '';
        $buyer_mobile = isset($filter['buyer_mobile']) ? $filter['buyer_mobile'] : '';
        // 分销用户
        $agent_nickname = isset($filter['agent_nickname']) ? $filter['agent_nickname'] : '';
        $agent_mobile = isset($filter['agent_mobile']) ? $filter['agent_mobile'] : '';
        // 订单 & 商品
        $order_sn = isset($filter['order_sn']) ? $filter['order_sn'] : '';

        // 当前表名
        $tableName = $this->model->getQuery()->getTable();

        $orders = $this->model;

        // 购买人查询
        if ($buyer_nickname || $buyer_mobile) {
            $orders = $orders->whereExists(function ($query) use ($buyer_nickname, $buyer_mobile, $tableName) {
                $userTableName = (new \app\admin\model\User())->getQuery()->getTable();
                $query = $query->table($userTableName)->where($userTableName . '.id=' . $tableName . '.buyer_id');

                if ($buyer_nickname) {
                    $query = $query->where('nickname', 'like', "%{$buyer_nickname}%");
                }

                if ($buyer_mobile) {
                    $query = $query->where('mobile', 'like', "%{$buyer_mobile}%");
                }

                return $query;
            });
        }

        // 分销用户昵称，手机号
        if ($agent_nickname || $agent_mobile) {
            $orders = $orders->whereExists(function ($query) use ($agent_nickname, $agent_mobile, $tableName) {
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

        // 订单号查询
        if ($order_sn) {
            $orders = $orders->whereExists(function ($query) use ($order_sn, $tableName) {
                $orderTableName = (new \app\admin\model\shopro\order\Order())->getQuery()->getTable();
                $query = $query->table($orderTableName)->where($orderTableName . '.id=' . $tableName . '.order_id');

                if ($order_sn) {
                    $query = $query->where('order_sn', 'like', "%{$order_sn}%");
                }

                return $query;
            });
        }

        return $orders;
    } 

}
