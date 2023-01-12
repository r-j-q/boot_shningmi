<?php

namespace addons\shopro\library\payv3;

use think\Log;
use addons\shopro\exception\Exception;

class PayServiceV3
{
    protected $payment;
    protected $platform;

    public function __construct($payment, $platform = null)
    {
        $this->payment = $payment;

        $this->platform = $platform ?: request()->header('platform', null);

        if (!$this->platform) {
            new Exception('缺少用户端平台参数');
        }
    }



    /**
     * 支付提供器
     *
     * @param string $type
     * @return Base
     */
    public function provider($payment = null)
    {
        $payment = $payment ?: $this->payment;
        $class = "\\addons\\shopro\\library\\payv3\\provider\\" . \think\helper\Str::studly($payment);
        if (class_exists($class)) {
            return new $class($this, $this->platform);
        }

        new Exception('支付类型不支持');
    }



    public function __call($funcname, $arguments)
    {
        return $this->provider()->{$funcname}(...$arguments);
    }
}
