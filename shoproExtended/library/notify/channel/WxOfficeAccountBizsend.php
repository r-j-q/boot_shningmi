<?php

namespace addons\shopro\library\notify\channel;

use addons\shopro\notifications\Notification;

class WxOfficeAccountBizsend
{

    public function __construct()
    {
    }


    /**
     * 发送 微信公众号订阅消息（新）
     *
     * @param  mixed  $notifiable       // 通知用户
     * @param  通知内容
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        $data = [];

        if (method_exists($notification, 'toWxOfficeAccount')) {
            $data = $notification->toWxOfficeAccount($notifiable, 'wxOfficialAccountBizsend');

            if ($data && isset($data['openid']) && isset($data['template_id']) && $data['template_id']) {
                $data['touser'] = $data['openid'];
                unset($data['openid']);

                try {
                    // 发送模板消息
                    $result = (new \addons\shopro\library\Wechat('wxOfficialAccount'))->bizsendSubscribeMessage($data);

                    if ($result['errcode'] != 0) {
                        // 短信发送失败
                        \think\Log::write('公众号订阅消息发送失败：用户：' . $notifiable['id'] . '；类型：' . get_class($notification) . "；发送类型：" . $notification->event . "；错误信息：" . json_encode($result));
                    } else {
                        // 发送成功
                        $notification->sendOk('wxOfficialAccountBizsend');
                    }
                } catch (\Exception $e) {
                    // 因为配置较麻烦，这里捕获异常防止因为缺少字段，导致队列一直执行不成功
                    \think\Log::write('公众号订阅消息发送失败：用户：' . $notifiable['id'] . '；类型：' . get_class($notification) . "；发送类型：" . $notification->event . "；错误信息：" . $e->getMessage());
                }

                return true;
            }

            // 没有openid
            \think\Log::write('公众号订阅消息发送失败，没有 openid：用户：' . $notifiable['id'] . '；类型：' . get_class($notification) . "；发送类型：" . $notification->event);
        }

        return true;
    }
}
