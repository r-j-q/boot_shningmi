<?php

namespace addons\shopro\model;

use think\Model;

/**
 * 购物车模型
 */
class Cart extends Model
{

    // 表名,不含前缀
    protected $name = 'shopro_cart';
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = 'deletetime';

    protected $hidden = ['createtime', 'updatetime', 'deletetime'];
    //列表动态隐藏字段
//    protected static $listHidden = ['content', 'params', 'images', 'service_ids'];

    // 追加属性
    protected $append = [
    ];

    public static function info()
    {
        $user = User::info();
        // 被物理删除的商品直接删掉购物车，只删除自己的
        $cartData = self::whereNotExists(function ($query) {
            $goodsTableName = (new Goods())->getQuery()->getTable();
            $tableName = (new self())->getQuery()->getTable();
            $query = $query->table($goodsTableName)->where($goodsTableName . '.id=' . $tableName . '.goods_id');

            return $query;
        })->where([
            'user_id' => $user->id
        ])->delete();

        $cartData = self::with(['goods' => function ($query) {
            $query->removeOption('soft_delete');
        }, 'sku_price' => function ($query) {
                $query->removeOption('soft_delete');
            }
        ])->where([
            'user_id' => $user->id
        ]);

        // 关联是否是活动
        $cartTableName = (new self)->getQuery()->getTable();
        // 这里只查秒杀拼团的， 并且不限制活动是否开始或者结束
        $actSubSql = Activity::field('type as activity_type, id as activity_id, goods_ids')->where('type', 'in', ['groupon', 'seckill'])->buildSql();
        $cartData = $cartData->join([$actSubSql => 'act'], "find_in_set(" . $cartTableName . ".goods_id, goods_ids)", 'left')->group('id');

        // 关闭 sql mode 的 ONLY_FULL_GROUP_BY
        $oldModes = closeStrict(['ONLY_FULL_GROUP_BY']);

        $cartData = $cartData->select();
        
        // 恢复 sql mode
        recoverStrict($oldModes);

        foreach ($cartData as $key => &$cart) {
            $cart['cart_type'] = null;

            if ($cart['activity_type'] != null) {
                $cart['cart_type'] = 'activity';
            }

            if (!is_null($cart['goods']['deletetime']) || $cart['goods']['status'] === 'down' || empty($cart['sku_price']) || !is_null($cart['sku_price']['deletetime'])) {
                $cart['cart_type'] = 'invalid';
            }
        }

        return $cartData;
    }

    public static function add($goodsList)
    {

        $user = User::info();

        foreach ($goodsList as $v) {
            $where = [
                'user_id' => $user->id,
                'goods_id' => $v['goods_id'],
                'sku_price_id' => $v['sku_price_id'],
                'deletetime' => null
            ];
            $cart = self::get($where);
            if ($cart) {
                $cart->goods_num += $v['goods_num'];
                $cart->save();
            }else{
                $cartData = [
                    'user_id' => $user->id,
                    'goods_id' => $v['goods_id'],
                    'goods_num' => $v['goods_num'],
                    'sku_price_id' => $v['sku_price_id']
                ];
                $cart = self::create($cartData);
            }

        }

        return $cart;


    }

    public static function edit($params)
    {
        extract($params);
        $user = User::info();
        $where['user_id'] = $user->id;
        switch ($act) {
            case 'delete':
                foreach ($cart_list as $v) {
                    $where['id'] = $v;
                    self::where($where)->delete();
                }
                break;
            case 'change':
                foreach ($cart_list as $v) {
                    $where['id'] = $v;
                    self::where($where)->update(['goods_num' => $value]);
                }
                break;
        }

        return true;


    }

    public function goods()
    {
        return $this->hasOne(Goods::class, 'id', 'goods_id');
    }

    public function skuPrice()
    {
        return $this->hasOne(GoodsSkuPrice::class, 'id', 'sku_price_id');
    }
    

}
