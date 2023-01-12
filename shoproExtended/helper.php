<?php

if (!function_exists('matchLatLng')) {
    function matchLatLng($latlng) {
        $match = "/^\d{1,3}\.\d{1,30}$/";
        return preg_match($match, $latlng) ? $latlng : 0;
    }
}


if (!function_exists('getDistanceBuilder')) {
    function getDistanceBuilder($lat, $lng) {
        return "ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN((". matchLatLng($lat) . " * PI() / 180 - latitude * PI() / 180) / 2), 2) + COS(". matchLatLng($lat). " * PI() / 180) * COS(latitude * PI() / 180) * POW(SIN((". matchLatLng($lng). " * PI() / 180 - longitude * PI() / 180) / 2), 2))) * 1000) AS distance";
    }
}


/**
 * 下划线转驼峰
 * step1.原字符串转小写,原字符串中的分隔符用空格替换,在字符串开头加上分隔符
 * step2.将字符串中每个单词的首字母转换为大写,再去空格,去字符串首部附加的分隔符.
 */
if (!function_exists('camelize')) {
    function camelize($uncamelized_words, $separator = '_') {
        $uncamelized_words = $separator . str_replace($separator, " ", strtolower($uncamelized_words));
        return ltrim(str_replace(" ", "", ucwords($uncamelized_words)), $separator);
    }
}
    
/**
 * 驼峰命名转下划线命名
 * 思路:
 * 小写和大写紧挨一起的地方,加上分隔符,然后全部转小写
 */
if (!function_exists('uncamelize')) {
    function uncamelize($camelCaps, $separator='_')
    {
        return strtolower(preg_replace('/([a-z])([A-Z])/', "$1" . $separator . "$2", $camelCaps));
    }
}


/**
 * 检测系统必要环境
 */
if (!function_exists('checkEnv')) {
    function checkEnv($need = [], $is_throw = true)
    {
        $need = is_string($need) ? [$need] : $need;

        // 检测是否安装浮点数运算扩展
        if (in_array('bcmath', $need)) {
            if (!extension_loaded('bcmath')) {
                if ($is_throw) {
                    new \addons\shopro\exception\Exception('请安装浮点数扩展 【bcmath】');
                } else {
                    return false;
                }
            }
        }

        // 检测是否安装了队列
        if (in_array('queue', $need)) {
            if (!class_exists(\think\Queue::class)) {
                if ($is_throw) {
                    new \addons\shopro\exception\Exception('请安装 【topthink/think-queue:v1.1.6 队列扩展】');
                } else {
                    return false;
                }
            }
        }

        if (in_array('commission', $need)) {
            if (!class_exists(\addons\shopro\listener\commission\CommissionHook::class)) {
                if ($is_throw) {
                    new \addons\shopro\exception\Exception('请先升级 【shopro】');
                } else {
                    return false;
                }
            }
        }

        if (in_array('yansongda', $need)) {
            if (!class_exists(\Yansongda\Pay\Pay::class)) {
                if ($is_throw) {
                    new \addons\shopro\exception\Exception('请查看文档，配置支付');
                } else {
                    return false;
                }
            }
        }
        return true;
    }
}


/**
 * 返回配置的微信支付版本
 */
if (!function_exists('pay_version')) {
    function pay_version()
    {
        $version = config('pay_version');

        $version = $version ? strtolower($version) : 'v2';

        return $version;
    }
}



/**
 * 后端防抖
 */
if (!function_exists('repeat_filter')) {
    function repeat_filter($key = null, $expire = 5)
    {
        if (!$key) {
            $url = request()->baseUrl();
            $ip = request()->ip();

            $key = md5($url . ':' . $ip);
        }

        $hasRedis = config('redis');
        if ($hasRedis) {
            $redis = (new \addons\shopro\library\Redis())->getRedis();
            if ($redis->exists($key)) {
                throw new \addons\shopro\exception\Exception('请不要重复提交');
            }
            $redis->setex($key, $expire, time());     // 缓存 五秒
        } else {
            if (cache('?' . $key)) {
                throw new \addons\shopro\exception\Exception('请不要重复提交');
            }
            cache($key, time(), $expire);
        }
    }
}



/**
 * 过滤掉字符串中的 sql 关键字
 */
if (!function_exists('filter_sql')) {
    function filter_sql($str)
    {
        $str = strtolower($str);        // 转小写
        $str = str_replace("and", "", $str);
        $str = str_replace("execute", "", $str);
        $str = str_replace("update", "", $str);
        $str = str_replace("count", "", $str);
        $str = str_replace("chr", "", $str);
        $str = str_replace("mid", "", $str);
        $str = str_replace("master", "", $str);
        $str = str_replace("truncate", "", $str);
        $str = str_replace("char", "", $str);
        $str = str_replace("declare", "", $str);
        $str = str_replace("select", "", $str);
        $str = str_replace("create", "", $str);
        $str = str_replace("delete", "", $str);
        $str = str_replace("insert", "", $str);
        $str = str_replace("union", "", $str);
        $str = str_replace("alter", "", $str);
        $str = str_replace("into", "", $str);
        $str = str_replace("'", "", $str);
        $str = str_replace("or", "", $str);
        $str = str_replace("=", "", $str);

        return $str;
    }
}


/**
 * 删除 sql mode 指定模式，或者直接关闭 sql mode
 */
if (!function_exists('closeStrict')) {
    function closeStrict($modes = [])
    {
        $modes = array_filter(is_array($modes) ? $modes : [$modes]);

        $result = \think\Db::query("SELECT @@session.sql_mode");
        $newModes = $oldModes = explode(',', ($result[0]['@@session.sql_mode'] ?? ''));

        if ($modes) {
            foreach ($modes as $mode) {
                $delkey = array_search($mode, $newModes);
                if ($delkey !== false) {
                    unset($newModes[$delkey]);
                }
            }
            $newModes = join(',', array_values(array_filter($newModes)));
        } else {
            $newModes = '';
        }

        \think\Db::execute("set session sql_mode='" . $newModes . "'");

        return $oldModes;
    }
}


/**
 * 重新打开被关闭的 sql mode
 */
if (!function_exists('recoverStrict')) {
    function recoverStrict($modes = [], $append = false)
    {
        if ($append) {
            $result = \think\Db::query("SELECT @@session.sql_mode");
            $oldModes = explode(',', ($result[0]['@@session.sql_mode'] ?? ''));

            $modes = array_values(array_filter(array_unique(array_merge($oldModes, $modes))));
        }

        \think\Db::execute("set session sql_mode='" . join(',', $modes) . "'");
    }
}