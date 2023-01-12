<?php

namespace app\admin\controller\shopro\commission;

use app\common\controller\Backend;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;
use app\admin\model\shopro\commission\Level as LevelModel;


/**
 * 分销商等级管理
 *
 * @icon fa fa-circle-o
 */
class Level extends Backend
{

    /**
     * Level模型对象
     * @var \app\admin\model\shopro\commission\Level
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new LevelModel();
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
        $defaultLevel = $this->model->get(['level' => 1]);
        if(!$defaultLevel) {
          $this->model->save([
            'name' => '默认等级',
            'level' => 1,
            'commission_rules' => '{"commission_1":"0.00","commission_2":"0.00","commission_3":"0.00"}'
          ]);
        }
        if($this->request->isAjax()) {
            $data = $this->model->order('level asc')->select();
            $this->success('分销商等级', null, $data);
        }
        return $this->view->fetch();
    }
    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post();
            if ($params) {
                $result = false;
                Db::startTrans();
                try {
                    $result = $this->model->allowField(true)->save($params);
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
                    $this->error(__('No rows were inserted'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $this->getExistLevel();

        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($level = null)
    {
        if(!$level) {
            $level = $this->request->get('level');
        }
        $row = $this->model->get($level);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($this->request->isPost()) {
            $params = $this->request->post();
            if ($params) {
                $result = false;
                Db::startTrans();
                try {
                    if($level != $params['new_level']) {
                        $params['level'] = $params['new_level'];
                        $result = LevelModel::strict(false)->insert($params);
                        $result = $row->delete();
                    }else {
                        $result = $row->allowField(true)->save($params);
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
                    $this->success();
                } else {
                    $this->error(__('No rows were updated'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $this->getExistLevel();
        $this->assignconfig('row', $row);
        return $this->view->fetch();
    }

    private function getExistLevel()
    {
        $existLevel = $this->model->column('level');
        $this->assignconfig('existLevel', $existLevel);
        return $existLevel;
    }
}
