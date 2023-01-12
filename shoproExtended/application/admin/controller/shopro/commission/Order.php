<?php

namespace app\admin\controller\shopro\commission;

use app\admin\controller\shopro\Base;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;


/**
 * 分销订单管理
 *
 * @icon fa fa-circle-o
 */
class Order extends Base
{

    /**
     * Order模型对象
     * @var \app\admin\model\shopro\commission\Order
     */
    protected $model = null;

    public function _initialize()
    {
        $this->loadlang('shopro/order/order_item');
        $this->loadlang('shopro/order/order');

        parent::_initialize();
        $this->model = new \app\admin\model\shopro\commission\Order;
        $this->rewardModel = new \app\admin\model\shopro\commission\Reward;
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
                'commission_user_id', 'commission_nickname', 'commission_mobile',
                'order_createtime', 'order_sn','goods_title',
            ];
            list($where, $sort, $order, $offset, $limit) = $this->custombuildparams(null, $nobuildfields);

            // 查询所有数据，计算统计数据
            $total = $this->buildSearch()
                ->where($where)
                ->order($sort, $order)
                ->count();
            // 查询分页数据
            $list = $this->buildSearch()
                ->with(['order' => function ($query) {
                    $query->removeOption('soft_delete')->field('id,type,order_sn,user_id,activity_type,goods_amount,status,total_amount,score_amount,total_fee,pay_fee,score_fee,pay_type,paytime,platform,ext,createtime,updatetime');
                }, 'item' => function ($query) {
                    $query->field('id,user_id,order_id,goods_id,goods_type,activity_id,activity_type,goods_sku_text,goods_title,goods_image,goods_original_price,discount_fee,goods_price,goods_num,dispatch_status,dispatch_fee,dispatch_type,aftersale_status,comment_status,refund_status,refund_fee,ext,createtime,updatetime');
                }, 'agent', 'reward.agent', 'buyer' => function ($query) {
                    $query->field('id,nickname,avatar,mobile,prevtime,logintime,jointime');
                }])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $list = collection($list)->toArray();

            // 处理分页数据格式
            $newList = [];
            foreach ($list as $key => $data) {
                $rewards = $data['reward'];

                $commission_total = 0;
                $commissioned_total = 0;
                foreach ($rewards as $reward) {
                    if ($reward['status'] == 1) {
                        $commissioned_total += $reward['commission'];
                    }
                    $commission_total += $reward['commission'];
                }
                $data['commission_total'] = number_format($commission_total, 2, '.', '');
                $data['commissioned_total'] = number_format($commissioned_total, 2, '.', '');
                $newList[] = $data;
            }

            // 处理顶部统计数据
            $amount_total = 0;              // 商品结算总金额
            $commission_total = 0;          // 分佣总金额
            $commission_waiting_total = 0;  // 待结算
            $commissioned_total = 0;        // 已结算
            $commission_back_total = 0;     // 已退回
            $commission_cancel_total = 0;   // 已取消

            $total_page = intval(ceil($total / 1000));
            for ($i = 0; $i < $total_page; $i++) {
                $totalList = $this->buildSearch()
                    ->with(['reward' => function ($query) {
                        $query->field('id,status,commission,commission_order_id');
                    }])
                    ->field('id,amount,commission_reward_status,commission_event')
                    ->where($where)
                    ->order($sort, $order)
                    ->limit(($i * 1000), 1000)
                    ->select();

                foreach ($totalList as $key => $li) {
                    $amount_total += $li['amount'];
                    foreach ($li['reward'] as $reward) {
                        if ($reward['status'] == 1) {
                            $commissioned_total += $reward['commission'];
                        } else if ($reward['status'] == -1) {
                            $commission_back_total += $reward['commission'];
                        } else if ($reward['status'] == 0) {
                            $commission_waiting_total += $reward['commission'];
                        } else if ($reward['status'] == -2) {
                            $commission_cancel_total += $reward['commission'];
                        }
                        $commission_total += $reward['commission'];
                    }
                }
            }

            $result = [
                "total" => $total, 
                "rows" => $newList,
                "amount_total" => number_format($amount_total, 2, '.', ''),
                "commission_total" => number_format($commission_total, 2, '.', ''),
                "commissioned_total" => number_format($commissioned_total, 2, '.', ''),
                "commission_back_total" => number_format($commission_back_total, 2, '.', ''),
                "commission_waiting_total" => number_format($commission_waiting_total, 2, '.', ''),
                "commission_cancel_total" => number_format($commission_cancel_total, 2, '.', '')
            ];

            $this->success('分销订单', null, $result);
        }
        return $this->view->fetch();
    }


    /**
     * 分销订单结算
     *
     * @param int       $id         分销订单ID
     */
    public function runCommission($id = null) {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = Db::transaction(function () use ($row) {
            return (new \addons\shopro\library\commission\Reward)->runCommissionRewardByOrder('admin', $row);
        });

        if ($result) {
            $this->success('结算成功');
        } else {
            $this->error('订单已结算或没有要结算的佣金');
        }
    }


    /**
     * 分销订单退回
     *
     * @param int       $id         分销订单ID
     * @param int       $delete     是否删除业绩
     */
    public function backCommission($id = null, $delete = 0)
    {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = Db::transaction(function () use ($row, $delete) {
            return (new \addons\shopro\library\commission\Reward)->backCommissionRewardByOrder('admin', $row, $delete);
        });

        if ($result) {
            $this->success('退回成功');
        } else {
            $this->error('订单已退回或未结算');
        }
    }

    /**
     * 分销订单取消
     *
     * @param int       $id         分销订单ID
     * @param int       $delete     是否删除业绩
     */
    public function cancelCommission($id = null, $delete = 0)
    {
        if (!$id) {
            $id = $this->request->get('id');
        }
        $row = $this->model->get($id);

        $result = Db::transaction(function () use ($row, $delete) {
            return (new \addons\shopro\library\commission\Reward)->backCommissionRewardByOrder('admin', $row, $delete);
        });

        if ($result) {
            $this->success('退回成功');
        } else {
            $this->error('订单已退回或未结算');
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
        // 推广用户
        $agent_nickname = isset($filter['agent_nickname']) ? $filter['agent_nickname'] : '';
        $agent_mobile = isset($filter['agent_mobile']) ? $filter['agent_mobile'] : '';
        // 分销用户
        $commission_user_id = isset($filter['commission_user_id']) ? $filter['commission_user_id'] : 0;
        $commission_nickname = isset($filter['commission_nickname']) ? $filter['commission_nickname'] : '';
        $commission_mobile = isset($filter['commission_mobile']) ? $filter['commission_mobile'] : '';

        // 时间区间
        $order_createtime = isset($filter['order_createtime']) ? $filter['order_createtime'] : '';
        $order_createtime = array_filter(explode(' - ', $order_createtime));
        // 订单 & 商品
        $order_sn = isset($filter['order_sn']) ? $filter['order_sn'] : '';
        $goods_title = isset($filter['goods_title']) ? $filter['goods_title'] : '';

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

        // 推广人昵称，手机号
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


        // 分销用户查询
        if ($commission_user_id || $commission_nickname || $commission_mobile) {
            $orders = $orders->whereExists(function ($query) use ($commission_user_id, $commission_nickname, $commission_mobile, $tableName) {
                $rewardTableName = (new \app\admin\model\shopro\commission\Reward())->getQuery()->getTable();

                $query = $query->table($rewardTableName)->where($rewardTableName . '.commission_order_id=' . $tableName . '.id');

                $query->where(function ($query) use ($commission_user_id, $commission_nickname, $commission_mobile, $rewardTableName) {
                    $is_or = false;
                    if ($commission_user_id) {
                        $is_or = true;
                        $query = $query->where('agent_id', $commission_user_id);
                    }

                    if ($commission_nickname || $commission_mobile) {
                        $query->whereOr(function ($query) use ($commission_nickname, $commission_mobile, $rewardTableName) {
                            $query->whereExists(function ($query) use ($commission_nickname, $commission_mobile, $rewardTableName) {
                                $userTableName = (new \app\admin\model\User())->getQuery()->getTable();
                                $query = $query->table($userTableName)->where($userTableName . '.id=' . $rewardTableName . '.agent_id');

                                if ($commission_nickname) {
                                    $query = $query->whereOr('nickname', 'like', "%{$commission_nickname}%");
                                }

                                if ($commission_mobile) {
                                    $query = $query->whereOr('mobile', 'like', "%{$commission_mobile}%");
                                }

                                return $query;
                            });

                            return $query;
                        });
                    }

                    return $query;
                });
            });
        }

        // 订单号查询
        if ($order_sn || $order_createtime) {
            $orders = $orders->whereExists(function ($query) use ($order_sn, $order_createtime, $tableName) {
                $orderTableName = (new \app\admin\model\shopro\order\Order())->getQuery()->getTable();
                $query = $query->table($orderTableName)->where($orderTableName . '.id=' . $tableName . '.order_id');

                if ($order_sn) {
                    $query = $query->where('order_sn', 'like', "%{$order_sn}%");
                }

                if ($order_createtime) {
                    $query = $query->where('createtime', 'BETWEEN time', $order_createtime);
                }

                return $query;
            });
        }

        // 商品名称
        if ($goods_title) {
            $orders = $orders->whereExists(function ($query) use ($goods_title, $tableName) {
                $orderTableName = (new \app\admin\model\shopro\order\OrderItem())->getQuery()->getTable();
                $query = $query->table($orderTableName)->where($orderTableName . '.id=' . $tableName . '.order_item_id');

                $query = $query->where('goods_title', 'like', "%{$goods_title}%");

                return $query;
            });
        }

        return $orders;
    } 

}
