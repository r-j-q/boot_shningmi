<?php

namespace app\admin\controller\shopro\store;

use app\common\controller\Backend;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;


/**
 * 门店
 *
 * @icon fa fa-circle-o
 */
class Store extends Backend
{

    /**
     * Store模型对象
     * @var \app\admin\model\shopro\store\Store
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\shopro\store\Store;

        // 获取 amap key
        $config = \addons\shopro\model\Config::get(['name' => 'services']);
        $config = ($config && $config->value) ? json_decode($config->value, true) : [];

        $amapConfig = $config['amap'] ?? [];
        $hasAmap = ($amapConfig && $amapConfig['appkey']) ? true : false;
        $this->assignconfig("hasAmap", $hasAmap);
        $this->assign("amap", $amapConfig);
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
        //当前是否为关联查询
        $this->relationSearch = false;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax())
        {
            $search = $this->request->get('search');
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $total = $this->model
                    ->where($where)
                    ->whereOr('name', 'LIKE', "%$search%")
                    ->order($sort, $order)
                    ->count();

            $list = $this->model
                    ->where($where)
                    ->whereOr('name', 'LIKE', "%$search%")
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return $this->success('门店列表', null, $result);
        }
        return $this->view->fetch();
    }


    public function all() {
        if ($this->request->isAjax()) {
            $search = $this->request->get('search');

            $list = $this->model
                    ->where('name', 'LIKE', "%$search%")
                    ->order('id', 'desc')
                    ->select();

            return $this->success('操作成功', null, $list);
        }
    }


    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post();
            if ($params) {
                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                $params = json_decode($params['data'], true);
                Db::startTrans();
                try {
                    $result = $this->model->allowField(true)->save($params);
                    $this->setStoreManager($this->model->id, $params['user_ids']);
                    if (!$result) {
                        $this->error($this->model->getError());
                    }
                    Db::commit();

                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success("添加成功");
                } else {
                    $this->error(__('No rows were inserted'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        return $this->view->fetch();
    }


   /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }

        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            if (!in_array($row[$this->dataLimitField], $adminIds)) {
                $this->error(__('You have no permission'));
            }
        }
        if ($this->request->isPost()) {
            $params = $this->request->post();
            if ($params) {
                $params = json_decode($params['data'], true);
                $result = false;
                Db::startTrans();
                try {
                    $row->allowField(true)->save($params);
                    $this->setStoreManager($row->id, $params['user_ids']);
                    $row->save();
                    $result = true;
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success();
                } else {
                    $this->error(__('No rows were updated'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        
        $this->assignconfig("row", $row);
        return $this->view->fetch();
    }

    public function setStatus($ids, $status) {
        if ($ids) {
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $count = 0;
            Db::startTrans();
            try {
                foreach ($list as $k => $v) {
                    $v->status = $status;
                    $count += $v->save();
                }
                Db::commit();
            } catch (PDOException $e) {
                Db::rollback();
                $this->error($e->getMessage());
            } catch (Exception $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }
            if ($count) {
                $this->success();
            } else {
                $this->error(__('No rows were updated'));
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    public function select()
    {
        //当前是否为关联查询
        $this->relationSearch = false;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax())
        {
            $searchWhere = $this->request->get('searchWhere');
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $total = $this->model
                        ->where($where)
                        ->where(function($query) use($searchWhere) {
                        return $query
                        ->whereOr('id', 'LIKE', "%$searchWhere%")
                        ->whereOr('name', 'LIKE', "%$searchWhere%")
                        ->whereOr('address', 'LIKE', "%$searchWhere%")
                        ->whereOr('province_name', 'LIKE', "%$searchWhere%")
                        ->whereOr('city_name', 'LIKE', "%$searchWhere%")
                        ->whereOr('area_name', 'LIKE', "%$searchWhere%");
                    })
                    ->order($sort, $order)
                    ->count();

            $list = $this->model
                       ->where($where)
                       ->where(function($query) use($searchWhere) {
                        return $query
                        ->whereOr('id', 'LIKE', "%$searchWhere%")
                       ->whereOr('name', 'LIKE', "%$searchWhere%")
                       ->whereOr('address', 'LIKE', "%$searchWhere%")
                       ->whereOr('province_name', 'LIKE', "%$searchWhere%")
                       ->whereOr('city_name', 'LIKE', "%$searchWhere%")
                       ->whereOr('area_name', 'LIKE', "%$searchWhere%");
                    })
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return $this->success('门店列表', null, $result);
        }
    }

    private function setStoreManager($store_id, $user_ids)
    {
        $user_ids = explode(',', $user_ids);
        $existUserIds = Db::name('shopro_user_store')
        ->where('store_id', $store_id)
        ->column('user_id');
        $newUserIds = array_diff($user_ids, $existUserIds);

        $deleteUserIds = array_diff($existUserIds, $user_ids);
        
        $newData = [];
        foreach($newUserIds as $id) {
            $newData[] = [
                'user_id' => $id,
                'store_id' => $store_id
            ];
        }
        if (!empty($newData)) {
            Db::name('shopro_user_store')->insertAll($newData);
        }

        if (!empty($deleteUserIds)) {
            Db::name('shopro_user_store')->where('user_id', 'in', $deleteUserIds)
                    ->where('store_id', $store_id)->delete();
        }
    }
}
