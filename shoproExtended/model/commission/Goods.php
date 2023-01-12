<?php

namespace addons\shopro\model\commission;

use think\Model;
use addons\shopro\model\Goods as GoodsModel;

class Goods extends Model
{
    // 表名
    protected $name = 'shopro_commission_goods';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 追加属性
    protected $append = [
    ];

    private $agent = null;

    /**
     * 获取商品列表
     *
     * @return array
     */
    public static function getList($params) {
        $user = \addons\shopro\model\User::info();
        $agent = Agent::get($user->id);

        extract($params);
        
        $commissionGoods = self::with('goods')->whereExists(function ($query) {
            $commissionGoodsName = (new self)->getQuery()->getTable();
            $goodsName = (new \addons\shopro\model\Goods())->getQuery()->getTable();

            $query->table($goodsName)->where($commissionGoodsName . '.goods_id=' . $goodsName . '.id')->where('status', 'up')->where('deletetime', 'null');
        })->where('status', 1)->paginate($per_page ?? 10);

        $commissionGoodsData = $commissionGoods->items();

        $newGoods = [];
        foreach ($commissionGoodsData as $key => $commission) {
            $goods = $commission['goods'];
            if ($goods) {
                // 商品存在才处理，会导致有被删除商品的部分页数据不够 10 条
                $commission = $commission->toArray();
                unset($commission['goods']);
                $goods['commission'] = $commission;
                $newGoods[] = $goods;
            }
        }

        $actNewGoods = [];
        if ($newGoods) {
            $collection = collection($newGoods);
            $actNewGoods = $collection->hidden(GoodsModel::$list_hidden);

            $actNewGoods->load('skuPrice');        // 延迟预加载

            foreach ($actNewGoods as $key => $g) {
                // 这里只需要获取，秒杀拼团的活动即可
                $actNewGoods[$key] = GoodsModel::operActivitySkuPrice($g, $g['sku_price']);

                // 计算预估佣金
                $actNewGoods[$key]['commission_money'] = self::getCommissionMoney($user, $agent, $g);
            }
        }

        $commissionGoods = $commissionGoods->toArray();
        $commissionGoods['data'] = $actNewGoods;
        return $commissionGoods;
    }


    // 分销获取预估佣金
    private static function getCommissionMoney($user, $agent, $goods)
    {
        // 获取到商品第一个规格
        $firstSkuPrice = $goods['sku_price'][0] ?? [];
        $amount = $firstSkuPrice['price'] ?? 0;

        // 实例化 commission goods
        $library = new \addons\shopro\library\commission\Goods($goods['id'], $firstSkuPrice['id']);

        // 获取当前分销商
        if ($agent) {
            // 获取佣金规则
            $rules = $library->getCommissionLevelRule($agent->level);

            // 获取预估佣金
            $commission = $library->caculateGoodsCommission($rules, $amount);
        }

        return $commission ?? 0;
    }


    public function getCommissionRulesAttr($value, $data)
    {
        //默认规则
        if($data['self_rules'] == 0) {
            return '';
        }
        return json_decode($value, true);
    }

    public function getCommissionConfigAttr($value, $data)
    {
        //默认规则
        if($data['self_rules'] !== 0 && !empty($value)) {
            return json_decode($value, true);
        }
        return null;
    }

    public function goods()
    {
        return $this->belongsTo('addons\shopro\model\Goods', 'goods_id', 'id');
    }
}
