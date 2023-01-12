<?php

declare(strict_types=1);

namespace addons\shopro\library\payv3\provider;

use think\Log;
use Yansongda\Pay\Pay;

class Wechat extends Base
{
    protected $payService = null;
    protected $platform = null;

    public function __construct($payService, $platform = null) 
    {
        $this->payService = $payService;

        $this->platform = $platform;
    }



    public function pay($order, $config = []) 
    {
        $this->init('wechat', $config);

        // 转换为 v3 格式数据
        if (in_array($this->platform, ['wxOfficialAccount', 'wxMiniProgram'])) {
            $order['payer']['openid'] = $order['openid'] ?? '';
        }
        if (isset($this->config['wechat']['default']['mode']) && $this->config['wechat']['default']['mode'] === 2) {
            if (in_array($this->platform, ['wxOfficialAccount', 'wxMiniProgram'])) {
                $order['payer']['sub_openid'] = $order['payer']['openid'];
                unset($order['payer']['openid']);
            }
        }
        
        $order['description'] = $order['body'];
        unset($order['openid'], $order['body']);
        $order['amount']['total'] = $order['total_fee'] * 100;        // 按分 为单位

        if ($this->platform == 'H5') {
            $order['_type'] = 'app';        // 使用 配置中的 app_id 字段
            $order['scene_info'] = [
                'payer_client_ip' => request()->ip(),
                'h5_info' => [
                    'type' => 'Wap',
                ]
            ];
        }

        unset($order['order_id'], $order['total_fee']);
        $method = $this->getMethod('wechat');
        $result = Pay::wechat()->$method($order);

        return $result;
    }



    public function transfer($payload, $config = [])
    {
        $this->init('wechat', $config, 'sub_mch');

        if (isset($this->config['wechat']['default']['_type'])) {
            $v3payload['_type'] = $this->config['wechat']['default']['_type'];
        }
        $v3payload['out_batch_no'] = $payload['partner_trade_no'];
        $v3payload['batch_name'] = '商家转账到零钱';
        $v3payload['batch_remark'] = $payload['desc'];
        $v3payload['total_amount'] = $payload['amount'];
        $v3payload['total_num'] = 1;
        $v3payload['transfer_detail_list'] = [
            [
                'out_detail_no' => $payload['partner_trade_no'],
                'transfer_amount' => $payload['amount'],
                'transfer_remark' => $payload['desc'],
                'openid' => $payload['openid'],
            ],
        ];

        unset($payload);

        $code = 0;
        $v3payload['total_amount'] = $v3payload['total_amount'] * 100;
        foreach ($v3payload['transfer_detail_list'] as $key => &$detail) {
            $detail['transfer_amount'] = $detail['transfer_amount'] * 100;
        }

        $response = Pay::wechat()->transfer($v3payload);
        if (isset($response['batch_id']) && $response['batch_id']) {
            $code = 1;
        }

        Log::error('wechat-transfer-origin-data：' . json_encode($response));

        return [$code, $response];
    }


    public function notify($callback, $config = [])
    {
        $this->init('wechat', $config);
        try {
            $originData = Pay::wechat()->callback(); // 是的，验签就这么简单！
            // {
            //     "id": "a5c68a7c-5474-5151-825d-88b4143f8642",
            //     "create_time": "2022-06-20T16:16:12+08:00",
            //     "resource_type": "encrypt-resource",
            //     "event_type": "TRANSACTION.SUCCESS",
            //     "summary": "支付成功",
            //     "resource": {
            //         "original_type": "transaction",
            //         "algorithm": "AEAD_AES_256_GCM",
            //         "ciphertext": {
            //             "mchid": "1623831039",
            //             "appid": "wx43051b2afa4ed3d0",
            //             "out_trade_no": "P202204155176122100021000",
            //             "transaction_id": "4200001433202206201698588194",
            //             "trade_type": "JSAPI",
            //             "trade_state": "SUCCESS",
            //             "trade_state_desc": "支付成功",
            //             "bank_type": "OTHERS",
            //             "attach": "",
            //             "success_time": "2022-06-20T16:16:12+08:00",
            //             "payer": {
            //                 "openid": "oRj5A44G6lgCVENzVMxZtoMfNeww"
            //             },
            //             "amount": {
            //                 "total": 1,
            //                 "payer_total": 1,
            //                 "currency": "CNY",
            //                 "payer_currency": "CNY"
            //             }
            //         },
            //         "associated_data": "transaction",
            //         "nonce": "qoJzoS9MCNgu"
            //     }
            // }

            Log::error('pay-notify-origin-data：' . json_encode($originData));
            if ($originData['event_type'] == 'TRANSACTION.SUCCESS') {
                // 支付成功回调
                $data = $originData['resource']['ciphertext'] ?? [];
                if (isset($data['trade_state']) && $data['trade_state'] == 'SUCCESS') {
                    // 交易成功
                    $data['pay_fee'] = ($data['amount']['total'] / 100);
                    $data['notify_time'] = $data['success_time'];
                    $data['openid'] = $data['payer']['openid'] ?? '';

                    $result = $callback($data);
                    return $result;
                }

                return 'fail';
            } else {
                // 微信交易未成功，返回 false，让微信再次通知
                Log::error('notify-error:交易未成功:' . $originData['event_type']);
                return 'fail';
            }
        } catch (\Exception $e) {
            Log::error('notify-error:' . $e->getMessage());
            return 'fail';
        }
    }


    /**
     * 退款
     *
     * @param array $order_data
     * @param array $config
     * @return array
     */
    public function refund($order_data, $config = [])
    {
        $config['notify_url'] = $config['notify_url'] ?? request()->domain() . '/addons/shopro/pay/notifyr/payment/wechat/platform/' . $this->platform;
        $v3order_data['notify_url'] = $config['notify_url'];

        $this->init('wechat', $config);

        $v3order_data['out_trade_no'] = $order_data['out_trade_no'];
        $v3order_data['out_refund_no'] = $order_data['out_refund_no'];
        $v3order_data['reason'] = $order_data['refund_desc'];
        $v3order_data['amount'] = [
            'total' => $order_data['total_fee'],
            'refund' => $order_data['refund_fee'],
            'currency' => 'CNY'
        ];

        if (isset($this->config['wechat']['default']['mode']) && $this->config['wechat']['default']['mode'] === 2) {
            $v3order_data['sub_mchid'] = $this->config['wechat']['default']['sub_mch_id'];
        }

        $result = Pay::wechat()->refund($v3order_data);
        Log::error('notifyRefund：' . json_encode($result, JSON_UNESCAPED_UNICODE));
        // {   返回数据字段
        //     "amount": {
        //         "currency": "CNY",
        //         "discount_refund": 0,
        //         "from": [],
        //         "payer_refund": 1,
        //         "payer_total": 1,
        //         "refund": 1,
        //         "settlement_refund": 1,
        //         "settlement_total": 1,
        //         "total": 1
        //     },
        //     "channel": "ORIGINAL",
        //     "create_time": "2022-06-20T19:06:36+08:00",
        //     "funds_account": "AVAILABLE",
        //     "out_refund_no": "R202207063668479227002100",
        //     "out_trade_no": "P202205155977315528002100",
        //     "promotion_detail": [],
        //     "refund_id": "50301802252022062021833667769",
        //     "status": "PROCESSING",
        //     "transaction_id": "4200001521202206207964248014",
        //     "user_received_account": "\u652f\u4ed8\u7528\u6237\u96f6\u94b1"
        // }

        if (isset($result['status']) && in_array($result['status'], ['SUCCESS', 'PROCESSING'])) {
            return $result;
        }

        throw new \Exception('退款失败:' . (isset($result['message']) ? $result['message'] : json_encode($result, JSON_UNESCAPED_UNICODE)));
    }



    /**
     * 微信退款回调
     *
     * @param array $callback
     * @param array $config
     * @return array
     */
    public function notifyRefund($callback, $config = [])
    {
        $this->init('wechat', $config);
        try {
            $originData = Pay::wechat()->callback(); // 是的，验签就这么简单！
            Log::write('pay-notifyrefund-callback-data:' . json_encode($originData));
            // {
            //     "id": "4a553265-1f28-53a3-9395-8d902b902462",
            //     "create_time": "2022-06-21T11:25:33+08:00",
            //     "resource_type": "encrypt-resource",
            //     "event_type": "REFUND.SUCCESS",
            //     "summary": "\u9000\u6b3e\u6210\u529f",
            //     "resource": {
            //         "original_type": "refund",
            //         "algorithm": "AEAD_AES_256_GCM",
            //         "ciphertext": {
            //             "mchid": "1623831039",
            //             "out_trade_no": "P202211233042122753002100",
            //             "transaction_id": "4200001417202206214219765470",
            //             "out_refund_no": "R202211252676008994002100",
            //             "refund_id": "50300002272022062121864292533",
            //             "refund_status": "SUCCESS",
            //             "success_time": "2022-06-21T11:25:33+08:00",
            //             "amount": {
            //                 "total": 1,
            //                 "refund": 1,
            //                 "payer_total": 1,
            //                 "payer_refund": 1
            //             },
            //             "user_received_account": "\u652f\u4ed8\u7528\u6237\u96f6\u94b1"
            //         },
            //         "associated_data": "refund",
            //         "nonce": "8xfQknYyLVop"
            //     }
            // }

            if ($originData['event_type'] == 'REFUND.SUCCESS') {
                // 支付成功回调
                $data = $originData['resource']['ciphertext'] ?? [];
                if (isset($data['refund_status']) && $data['refund_status'] == 'SUCCESS') {
                    // 退款成功
                    $result = $callback($data);
                    return $result;
                }

                return 'fail';
            } else {
                // 微信交易未成功，返回 false，让微信再次通知
                Log::error('notify-error:退款未成功:' . $originData['event_type']);
                return 'fail';
            }
        } catch (\Exception $e) {
            Log::error('notify-refund-error:' . $e->getMessage());
            return 'fail';
        }
    }




    /**
     * 格式化支付参数
     *
     * @param [type] $params
     * @return void
     */
    protected function formatConfig($config, $data = [], $type = 'normal')
    {
        $config['mode'] = (int)($config['mode'] ?? 0);
        if ($config['mode'] == 2 && $type == 'sub_mch') {
            // 服务商模式，但需要子商户直连 ，重新定义 config(商家转账到零钱)
            $config = [
                'mch_id' => $config['sub_mch_id'],
                'mch_secret_key' => $config['sub_mch_secret_key'],
                'mch_secret_cert' => $config['sub_mch_secret_cert'],
                'mch_public_cert_path' => $config['sub_mch_public_cert_path'],
            ];
            $config['mode'] = 0;        // 临时改为普通商户
        }

        if ($config['mode'] === 2) {
            // 首先将平台配置的 app_id 初始化到配置中
            $config['mp_app_id'] = $config['app_id'];       // 服务商关联的公众号的 appid
            $config['sub_app_id'] = $data['app_id'];        // 服务商特约子商户
        } else {
            $config['app_id'] = $data['app_id'];
        }
        
        switch ($this->platform) {
            case 'wxMiniProgram':
                $config['_type'] = 'mini';          // 小程序提现，需要传 _type = mini 才能正确获取到 appid
                if ($config['mode'] === 2) {
                    $config['sub_mini_app_id'] = $config['sub_app_id'];
                    unset($config['sub_app_id']);
                } else {
                    $config['mini_app_id'] = $config['app_id'];
                    unset($config['app_id']);
                }
                break;
            case 'wxOfficialAccount':
                $config['_type'] = 'mp';          // 小程序提现，需要传 _type = mp 才能正确获取到 appid
                if ($config['mode'] === 2) {
                    $config['sub_mp_app_id'] = $config['sub_app_id'];
                    unset($config['sub_app_id']);
                } else {
                    $config['mp_app_id'] = $config['app_id'];
                    unset($config['app_id']);
                }
                break;
            case 'App':
            case 'H5':
            default:
                break;
        }

        $config['notify_url'] = request()->domain() . '/addons/shopro/pay/notifyx/payment/wechat/platform/' . $this->platform;
        $config['mch_secret_cert'] = ROOT_PATH . 'public' . $config['mch_secret_cert'];
        $config['mch_public_cert_path'] = ROOT_PATH . 'public' . $config['mch_public_cert_path'];

        return $config;
    }
}