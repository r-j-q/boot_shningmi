<?php

namespace app\admin\controller\shopro\commission;

use app\common\controller\Backend;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use Exception;


/**
 * 分销商管理
 *
 * @icon fa fa-circle-o
 */
class Goods extends Backend
{

      /**
     * Goods模型对象
     * @var \app\admin\model\shopro\goods\Goods
     */
    protected $model = null;

    public function _initialize()
    {
        $this->loadlang('shopro/goods/goods');

        parent::_initialize();
        $this->model = new \app\admin\model\shopro\goods\Goods;
        $this->view->assign("typeList", $this->model->getTypeList());
        $this->view->assign("statusList", $this->model->getStatusList());
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
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            // list($where, $sort, $order, $offset, $limit) = $this->buildparams('title');
            $sort = $this->request->get("sort", !empty($this->model) && $this->model->getPk() ? $this->model->getPk() : 'id');
            $sort = $sort == 'price' ? 'convert(`price`, DECIMAL(10, 2))' : $sort;
            $order = $this->request->get("order", "DESC");
            $offset = $this->request->get("offset", 0);
            $limit = $this->request->get("limit", 0);
            $activity_type = $this->request->get("activity_type", 'all');   // 活动类型

            $total = $this->buildSearchOrder()->count();

            // 构建查询数据条件
            $list = $this->buildSearchOrder();

            $subsql = \app\admin\model\shopro\goods\SkuPrice::where('status', 'up')->field('sum(stock) as stock, goods_id as sku_goods_id')->group('goods_id')->buildSql();
            $goodsTableName = $this->model->getQuery()->getTable();
            // 关联规格表，获取总库存
            $list = $list->join([$subsql => 'w'], $goodsTableName . '.id = w.sku_goods_id', 'left');

            // 关联查询当前商品的活动，一个商品可能存在多条活动记录，使用 group_concat 搜集所有活动类型，关联条件 只有 find_in_set 会存在一个商品出现多次，所以使用 group
            $actSubSql = \app\admin\model\shopro\activity\Activity::where('starttime', '<=', time())->where('endtime', '>=', time())->buildSql();
            $list = $list->join([$actSubSql => 'act'], "(find_in_set(" . $goodsTableName . ".id, act.goods_ids) or act.goods_ids = '')", 'left');

            // 关联查询当前商品是否设置有积分
            $scoreSubSql = \app\admin\model\shopro\app\ScoreSkuPrice::field("'score' as app_type, goods_id as score_goods_id")->group('score_goods_id')->buildSql();
            $list = $list->join([$scoreSubSql => 'score'], $goodsTableName . '.id = score.score_goods_id', 'left');

            // 关闭 sql mode 的 ONLY_FULL_GROUP_BY
            $oldModes = closeStrict(['ONLY_FULL_GROUP_BY']);
            
            $list = $list->field("$goodsTableName.*, w.*,score.*,group_concat(act.type) as activity_type, act.goods_ids")
                ->group('id')
                ->orderRaw($sort . ' ' . $order)
                ->limit($offset, $limit)
                ->select();
                
            // 恢复 sql mode
            recoverStrict($oldModes);

            foreach ($list as $row) {
                $row->commission = \app\admin\model\shopro\commission\Goods::get($row->id);
                $row->visible(['id', 'type', 'activity_id', 'activity_type', 'is_sku', 'app_type', 'title', 'status', 'weigh', 'category_ids', 'image', 'price', 'likes', 'views', 'sales', 'stock', 'show_sales', 'dispatch_type', 'updatetime', 'commission']);
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            if ($this->request->get("page_type") == 'select') {
                return json($result);
            }

            return $this->success('操作成功', null, $result);
        }
        return $this->view->fetch();
    }


    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $params = $this->request->post();
            $goods_ids = explode(',', $params['ids']);
            unset($params['ids']);
            if ($params) {
                Db::startTrans();
                try {
                    foreach($goods_ids as $goods_id) {
                        $commissionGoods = \app\admin\model\shopro\commission\Goods::get($goods_id);
                        if($commissionGoods) {
                            $commissionGoods->allowField(true)->save($params);
                        }else {
                            $params['goods_id'] = $goods_id;
                            \app\admin\model\shopro\commission\Goods::insert($params);
                        }
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
                    $this->success('编辑成功');
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }else{
            if(!$ids) {
                $ids = $this->request->get('id');
            }
            $row = $this->model->where('id', 'in', $ids)->select();
            if (!$row) {
                $this->error(__('No Results were found'));
            }
            if(count($row) == 1) {
                    $row[0]->commission = \app\admin\model\shopro\commission\Goods::get($row[0]->id);
                    $row[0]->sku_price = \app\admin\model\shopro\goods\SkuPrice::all(['goods_id' => $row[0]->id]);

            }
        $this->assignconfig('row', $row);
        $this->assignconfig('defaultCommissionConfig', \app\admin\model\shopro\commission\Config::where([
            'name' => ['in', ['commission_level', 'self_buy', 'commission_price_type', 'commission_event']]
        ])->column('value', 'name'));
        return $this->view->fetch();

        }
    }

    //参与分销
    public function commission_status()
    {
        $params = $this->request->post();
        \app\admin\model\shopro\commission\Goods::where('goods_id', 'in', $params['ids'])->update([
                'status' => $params['status']
            ]);
            $this->success('更新成功');
    }

    // 构建查询条件
    private function buildSearchOrder()
    {
        $goods_title = $this->request->get("goods_title", '');        // 关键字
        $status = $this->request->get("status", 'all');
        $goods_type = $this->request->get("goods_type", 'all');
        $activity_type = $this->request->get("activity_type", 'all');
        $app_type = $this->request->get("app_type", 'all');
        $min_price = $this->request->get("min_price", "");
        $max_price = $this->request->get("max_price", "");
        $category_id = $this->request->get('category_id', 0);
        $self_rules = $this->request->get('self_rules', 'all');
        $commission_goods_status = $this->request->get('commission_goods_status', 'all');

        $tableName = $this->model->getQuery()->getTable();
        $tableName = $tableName . '.';

        $goods = $this->model;

        if ($goods_title) {
            // 模糊搜索字段
            $searcharr = ['title'];
            foreach ($searcharr as $k => &$v) {
                $v = stripos($v, ".") === false ? $tableName . $v : $v;
            }
            unset($v);
            $goods = $goods->where(function ($query) use ($searcharr, $goods_title, $tableName) {
                $query->where(implode("|", $searcharr), "LIKE", "%{$goods_title}%");
            });
        }

        if ($goods_type != 'all') {
            $goods = $goods->where($tableName . 'type', $goods_type);
        }

        $goods_ids = [];
        // 活动
        if ($activity_type != 'all') {
            // 同一请求，会组装两次请求条件,缓存 10 秒
            $activities = \app\admin\model\shopro\activity\Activity::cache(10)->where('type', $activity_type)->column('goods_ids');
            foreach ($activities as $key => $goods_id) {
                $ids = explode(',', $goods_id);
                $goods_ids = array_merge($goods_ids, $ids);
            }
        }

        // 积分
        if ($app_type == 'score') {
            $score_goods_ids = \app\admin\model\shopro\app\ScoreSkuPrice::cache(10)->group('goods_id')->column('goods_id');
            $goods_ids = array_merge($goods_ids, $score_goods_ids);
        }

        $goods_ids = array_filter(array_unique($goods_ids));
        if ($goods_ids) {
            $goods = $goods->where($tableName . 'id', 'in', $goods_ids);
        } else {
            if ($activity_type != 'all' || $app_type != 'all') {
                // 搜了活动，但是 goods_ids 为空，这时候搜索结果应该为空
                $goods = $goods->where($tableName . 'id', 'in', $goods_ids);
            }
        }

        // 价格
        if ($min_price != '') {
            $goods = $goods->where('convert(`price`, DECIMAL(10, 2)) >= ' . round($min_price, 2));
        }
        if ($max_price != '') {
            $goods = $goods->where('convert(`price`, DECIMAL(10, 2)) <= ' . round($max_price, 2));
        }

        // 商品状态
        if ($status != 'all') {
            $goods = $goods->where('status', $status);
        }

        if(isset($category_id) && $category_id != 0) {
            $category_ids = [];
                // 查询分类所有子分类,包括自己
                $category_ids = \addons\shopro\model\Category::getCategoryIds($category_id);

    
            $goods = $goods->where(function ($query) use ($category_ids) {
                // 所有子分类使用 find_in_set or 匹配，亲测速度并不慢
                foreach($category_ids as $key => $category_id) {
                    $category_id = filter_sql($category_id);
                    $query->whereOrRaw("find_in_set($category_id, category_ids)");
                }
            });
        }

        // 分销规则
        if ($self_rules != 'all' && ($commission_goods_status == 'all' || $commission_goods_status == 1)) {
            // 这肯定是参与的,或者全部
            $goods = $goods->whereExists(function ($query) use ($self_rules, $tableName) {
                $commissionGoodsName = (new \app\admin\model\shopro\commission\Goods())->getQuery()->getTable();
                $query = $query->table($commissionGoodsName)->where($commissionGoodsName . '.goods_id=' . $tableName . 'id');

                $query = $query->where('self_rules', $self_rules);

                return $query;
            });
        }

        // 查询参与分销的
        if ($commission_goods_status != 'all') {
            $goods = $goods->where(function ($query) use ($commission_goods_status, $tableName) {
                $query->whereExists(function ($query) use ($commission_goods_status, $tableName) {
                    $commissionGoodsName = (new \app\admin\model\shopro\commission\Goods())->getQuery()->getTable();
                    $query = $query->table($commissionGoodsName)->where($commissionGoodsName . '.goods_id=' . $tableName . 'id');

                    $query = $query->where('status', $commission_goods_status);

                    return $query;
                });

                // 查询不参与分销的（存在 commission goods 并且 status = 1 或者 不存在 commission_goods）
                if ($commission_goods_status == 0) {
                    $query = $query->whereOr(function ($query) use ($commission_goods_status, $tableName) {
                        $query = $query->whereNotExists(function ($query) use ($commission_goods_status, $tableName) {
                            $commissionGoodsName = (new \app\admin\model\shopro\commission\Goods())->getQuery()->getTable();
                            $query = $query->table($commissionGoodsName)->where($commissionGoodsName . '.goods_id=' . $tableName . 'id');
                            return $query;
                        });

                        return $query;
                    });
                }

                return $query;
            });
            
        }

        return $goods;
    }

}
