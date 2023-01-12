<?php

declare(strict_types=1);

namespace addons\shopro\library\payv3\provider;

use think\Log;
use Yansongda\Pay\Pay;
use addons\shopro\exception\Exception;

class Base
{

    protected $defaultConfig = [];


    /**
     * yansongda 支付示例
     *
     * @var Yansongda\Pay\Pay
     */
    protected $pay = null;      // yansongda 支付实例

    public $config = null;     // 支付参数    


    /**
     * yansongda 支付初始化
     *
     * @param string $payment
     * @param array $config
     * @return Yansongda\Pay\Pay
     */
    public function init($payment, $config = [], $type = 'normal')
    {
        $this->defaultConfig = [
            'logger' => [ // optional
                'enable' => true,
                'file' => ROOT_PATH . 'runtime/log/pay/pay.log',
                'level' => config('app.app_debug') ? 'debug' : 'info', // 建议生产环境等级调整为 info，开发环境为 debug
                'type' => 'daily', // optional, 可选 daily.
                'max_file' => 30, // optional, 当 type 为 daily 时有效，默认 30 天
            ],
            'http' => [ // optional
                'timeout' => 5.0,
                'connect_timeout' => 5.0,
                // 更多配置项请参考 [Guzzle](https://guzzle-cn.readthedocs.io/zh_CN/latest/request-options.html)
            ],
        ];


        $this->config = $this->getConfig($payment, $config, $type);
        // print_r($this->config);exit;
        $this->pay = Pay::config($this->config);
    }


    /**
     * 获取支付的所有参数
     *
     * @param string $payment
     * @return array
     */
    protected function getConfig($payment, $config = [], $type = 'normal')
    {
        $pay_name = $payment == 'wechat' ? 'wechatv3' : $payment;
        $v3Config = \addons\shopro\model\Config::get(['name' => $pay_name]);
        if (!$v3Config && $payment == 'wechat') {
            new Exception('请配置微信支付V3参数');
        }
        
        $params = json_decode($v3Config->value, true);
        $platformConfig = json_decode(\addons\shopro\model\Config::get(['name' => $this->platform])->value, true);
        $app_id = $platformConfig['app_id'] ?? '';

        // 格式化支付参数
        $params = $this->formatConfig($params, ['app_id' => $app_id], $type);

        // 合并传入的参数
        $params = array_merge($params, $config);

        // 合并参数
        $config = array_merge($this->defaultConfig, [$payment => ['default' => $params]]);

        return $config;
    }



    /**
     * 获取对应的支付方法名
     *
     * @param strign $payment
     * @return string
     */
    protected function getMethod($payment)
    {
        $method = [
            'wechat' => [
                'wxOfficialAccount' => 'mp',        //公众号支付 Collection
                'wxMiniProgram' => 'mini',       //小程序支付 Collection 
                'H5' => 'wap',                      //手机网站支付 Response
                'App' => 'app'                      // APP 支付 JsonResponse
            ],
            'alipay' => [
                'wxOfficialAccount' => 'wap',       //手机网站支付 Response
                'wxMiniProgram' => 'wap',           //小程序支付
                'H5' => 'wap',                      //手机网站支付 Response
                'App' => 'app'                      //APP 支付 JsonResponse
            ],
        ];

        return $method[$payment][$this->platform];
    }

}