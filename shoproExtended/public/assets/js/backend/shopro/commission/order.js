define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var orderIndex = new Vue({
                el: "#orderIndex",
                data() {
                    return {
                        orderList: [],
                        currentPage: 1,
                        totalPage: 0,
                        offset: 0,
                        limit: 10,

                        searchStatusOption: [{
                            value: 'all',
                            label: "全部"
                        }, {
                            value: '-2',
                            label: "已取消"
                        }, {
                            value: '-1',
                            label: "已退回"
                        }, {
                            value: '0',
                            label: "未结算"
                        }, {
                            value: '1',
                            label: "已结算"
                        }],
                        commissionEventOption: [{
                            value: 'all',
                            label: "全部"
                        }, {
                            value: 'payed',
                            label: "支付后结算"
                        }, {
                            value: 'confirm',
                            label: "确认收货结算"
                        }, {
                            value: 'finish',
                            label: "订单完成结算"
                        }, {
                            value: 'admin',
                            label: "手动打款"
                        }],

                        searchForm: {
                            form_1_key: "buyer_id",
                            form_1_value: "",

                            form_2_key: "agent_id",
                            form_2_value: "",

                            form_3_key: "commission_user_id",
                            form_3_value: "",

                            order_sn: "",
                            order_createtime: "",
                            goods_title: "",
                            commission_order_createtime: "",
                            commission_reward_status: "all",
                            commission_event: "all",

                            id: ''
                        },
                        searchFormInit: {
                            form_1_key: "buyer_id",
                            form_1_value: "",

                            form_2_key: "agent_id",
                            form_2_value: "",

                            form_3_key: "commission_user_id",
                            form_3_value: "",

                            order_sn: "",
                            order_createtime: "",
                            goods_title: "",
                            commission_time: "",
                            commission_reward_status: "all",
                            commission_event: "all",

                            id: ''
                        },
                        searchOp: {
                            buyer_id: "=",
                            buyer_nickname: "like",
                            buyer_mobile: "like",

                            agent_id: "=",
                            agent_nickname: "like",
                            agent_mobile: "like",

                            commission_user_id: "=",
                            commission_nickname: "like",
                            commission_mobile: "like",

                            order_sn: "like",
                            order_createtime: "range",
                            goods_title: "like",
                            commission_time: "range",
                            commission_reward_status: "=",
                            commission_event: "=",

                            id: '='

                        },
                        isAjax: false,
                        isPopoverEdit: false,
                        popoverIndex: null,
                        orderId: null,
                        isPopoverMessage: '',

                        commissionOperIndex: null,
                        commissionOperStatus: null,
                        deductioncheckbox: '1',
                        isdisabled: false,
                        // 统计
                        commissionDashboard: {
                            total: {
                                total: {
                                    label:'商品总订单数',
                                    color: '#8644F2',
                                    unit: '单',
                                    value: 0
                                },
                                amount_total: {
                                    label:'商品结算总金额',
                                    color: '#E6A93C     ',
                                    unit: '元',
                                    value: 0
                                },
                                commission_total: {
                                    label:'分佣总金额',
                                    color: '#687FF4',
                                    unit: '元',
                                    value: 0
                                }
                            },
                            status: {
                                commission_cancel_total: {
                                    label:'已取消佣金',
                                    color: '#70C140 ',
                                    unit: '元',
                                    value: 0
                                },
                                commission_back_total: {
                                    label:'已退回佣金',
                                    color: '#FF826C',
                                    unit: '元',
                                    value: 0
                                },
                                commission_waiting_total: {
                                    label:'未结算佣金',
                                    color: '#EC5B55 ',
                                    unit: '元',
                                    value: 0
                                },
                                commissioned_total: {
                                    label:'已结算佣金',
                                    color: '#56B99D ',
                                    unit: '元',
                                    value: 0
                                }
                            }

                        }
                    }
                },
                mounted() {
                    if (new URLSearchParams(location.search).get('agent_id')) {
                        this.searchForm.form_2_key = 'agent_id';
                        this.searchForm.form_2_value = new URLSearchParams(location.search).get('agent_id');
                    } else if (new URLSearchParams(location.search).get('id')) {
                        this.searchForm.id = new URLSearchParams(location.search).get('id');
                        this.searchFormInit.id = new URLSearchParams(location.search).get('id');
                    } else {
                        this.searchForm.order_createtime = [];
                        let start = `${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`;
                        let end = `${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`;
                        this.searchForm.order_createtime.push(start)
                        this.searchForm.order_createtime.push(end);
                        this.searchFormInit.order_createtime = this.searchForm.order_createtime;
                    }
                    // 佣金明细跳转
                    if (new URLSearchParams(location.search).get('order_sn')) {
                        this.searchForm.order_sn = new URLSearchParams(location.search).get('order_sn');
                        this.searchFormInit.order_sn = new URLSearchParams(location.search).get('order_sn');
                        this.searchForm.order_createtime = [];
                        this.searchFormInit.order_createtime = []
                    }
                    this.reqOrderList()
                },
                methods: {
                    getrefresh() {
                        window.location.reload(() => {
                            this.reqOrderList();
                        });
                    },
                    reqOrderList() {
                        var that = this;
                        that.isAjax = true;
                        let filter = {}
                        let op = {}
                        for (key in that.searchForm) {
                            if (key == 'form_1_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_1_key] = that.searchForm[key];
                                }
                            } else if (key == 'form_2_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_2_key] = that.searchForm[key];
                                }
                            } else if (key == 'form_3_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_3_key] = that.searchForm[key];
                                }
                            } else if (key == 'commission_time' || key == 'order_createtime') {
                                if (that.searchForm[key]) {
                                    if (that.searchForm[key].length > 0) {
                                        filter[key] = that.searchForm[key].join(' - ');
                                    }
                                }
                            } else if (key == 'order_sn' || key == 'goods_title' || key == 'commission_reward_status' || key == 'commission_event' || key == 'id') {
                                if (that.searchForm[key] != '' && that.searchForm[key] != 'all') {
                                    filter[key] = that.searchForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.searchOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/order/index',
                            loading: false,
                            type: 'GET',
                            data: {
                                filter: JSON.stringify(filter),
                                op: JSON.stringify(op),
                                offset: that.offset,
                                limit: that.limit,
                            }
                        }, function (ret, res) {
                            that.orderList = res.data.rows;
                            that.totalPage = res.data.total;
                            for (t in that.commissionDashboard.total) {
                                that.commissionDashboard.total[t].value = res.data[t]
                            }
                            for (s in that.commissionDashboard.status) {
                                that.commissionDashboard.status[s].value = res.data[s]
                            }
                            that.isAjax = false;
                            that.isdisabled = false
                            that.isPopoverEdit = null;
                            that.commissionOperIndex = null;
                            that.commissionOperStatus = null;
                            return false;
                        }, function (ret, res) {
                            that.isAjax = false;
                        })
                    },
                    commissionLevelFilter(level) {
                        switch (level) {
                            case 0:
                                return '自购'
                                break;
                            case 1:
                                return '一级分销'
                                break;
                            case 2:
                                return '二级分销'
                                break;
                            case 3:
                                return '三级分销'
                                break;
                        }
                    },
                    goDetail(id) {
                        let that = this;
                        Fast.api.open('shopro/order/order/detail?id=' + id, "查看详情", {
                            callback() {
                                that.reqOrderList()
                            }
                        });
                    },
                    goUser(type, id) {
                        let that = this;
                        if (type == 'agent') {
                            Fast.api.open('shopro/commission/agent/profile?id=' + id, '查看推广分销商', {
                                callback() {
                                    that.reqOrderList();
                                }
                            })
                        } else if (type == 'buyer') {
                            Fast.api.open('shopro/user/user/profile?id=' + id, '查看下单用户', {
                                callback() {
                                    that.reqOrderList()
                                }
                            })
                        }
                    },
                    screenEmpty() {
                        this.searchForm = JSON.parse(JSON.stringify(this.searchFormInit))
                    },
                    handleSelectionChange(val) {
                        this.multipleSelection = val;
                    },
                    //分页(更换页面显示条数)
                    handleSizeChange(val) {
                        this.offset = 0
                        this.limit = val
                        this.currentPage = 1;
                        this.reqOrderList()
                    },
                    //当前是第几页
                    handleCurrentChange(val) {
                        this.offset = (val - 1) * this.limit;
                        this.currentPage = 1;
                        this.reqOrderList()
                    },
                    changePopoverEdit(value, index, order_id) {
                        this.popoverIndex = index
                        this.isPopoverMessage = value;
                        this.isPopoverEdit = true;
                        this.orderId = order_id
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex > 1 && 12 > columnIndex) {
                            return 'cell-center';
                        }
                        return '';
                    },
                    settlement(type, id, index, innerIndex) {
                        let that = this;
                        let requrl;
                        let reqdata = {}
                        switch (type) {
                            case 'runOrder':
                                that.isdisabled = true
                                requrl = `shopro/commission/order/runCommission?id=${id}`;
                                Fast.api.ajax({
                                    url: requrl,
                                    loading: false,
                                    type: 'POST',
                                }, function (ret, res) {
                                    that.reqOrderList();
                                    that.$refs[`commission-status-${index}`].doToggle();
                                }, function (ret, res) {
                                    that.$refs[`commission-status-${index}`].doToggle();
                                    that.isdisabled = false
                                    that.isAjax = false;
                                })
                                break;
                            case 'runReward':
                                requrl = 'shopro/commission/reward/runCommission?id=' + id
                                this.$confirm('此操作将手动结算, 是否继续?', '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    Fast.api.ajax({
                                        url: requrl,
                                        loading: false,
                                        type: 'POST',
                                    }, function (ret, res) {
                                        that.reqOrderList();
                                        that.$refs[`popover-${index}-${innerIndex}`][0].doToggle();
                                    }, function (ret, res) {
                                        that.isAjax = false;
                                    })
                                }).catch(() => {
                                    this.$message({
                                        type: 'info',
                                        message: '已取消手动结算'
                                    });
                                });
                                break;
                            case 'backOrder':
                                requrl = `shopro/commission/order/backCommission?id=${id}&delete=${that.deductioncheckbox}`;
                                that.isdisabled = true
                                Fast.api.ajax({
                                    url: requrl,
                                    loading: false,
                                    type: 'POST',
                                }, function (ret, res) {
                                    that.reqOrderList();
                                    that.$refs[`commission-status-${index}`].doToggle();
                                    that.deductioncheckbox = '1'
                                }, function (ret, res) {
                                    that.isAjax = false;
                                    that.isdisabled = false
                                    that.$refs[`commission-status-${index}`].doToggle();
                                    that.deductioncheckbox = '1'
                                });
                                break;
                            case 'backReward':
                                requrl = 'shopro/commission/reward/backCommission?id=' + id
                                this.$confirm('此操作将手动退回, 是否继续?', '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    Fast.api.ajax({
                                        url: requrl,
                                        loading: false,
                                        type: 'POST',
                                    }, function (ret, res) {
                                        that.reqOrderList();
                                        that.$refs[`popover-${index}-${innerIndex}`][0].doToggle();
                                    }, function (ret, res) {
                                        that.isAjax = false;
                                    })
                                }).catch(() => {
                                    this.$message({
                                        type: 'info',
                                        message: '已取消手动退回'
                                    });
                                });
                                break;
                            case 'cancelOrder':
                                requrl = `shopro/commission/order/cancelCommission?id=${id}&delete=${that.deductioncheckbox}`;
                                that.isdisabled = true
                                Fast.api.ajax({
                                    url: requrl,
                                    loading: false,
                                    type: 'POST',
                                }, function (ret, res) {
                                    that.reqOrderList();
                                    that.$refs[`commission-status-${index}`].doToggle();
                                    that.deductioncheckbox = '1'
                                }, function (ret, res) {
                                    that.isAjax = false;
                                    that.isdisabled = false
                                    that.$refs[`commission-status-${index}`].doToggle();
                                    that.deductioncheckbox = '1'
                                });
                                break;
                            case 'cancelReward':
                                requrl = 'shopro/commission/reward/cancelCommission?id=' + id
                                this.$confirm('此操作将取消结算, 是否继续?', '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    Fast.api.ajax({
                                        url: requrl,
                                        loading: false,
                                        type: 'POST',
                                    }, function (ret, res) {
                                        that.reqOrderList();
                                        that.$refs[`popover-${index}-${innerIndex}`][0].doToggle();
                                    }, function (ret, res) {
                                        that.isAjax = false;
                                    })
                                }).catch(() => {
                                    this.$message({
                                        type: 'info',
                                        message: '已取消'
                                    });
                                });
                                break;
                            case 'edit':
                                requrl = 'shopro/commission/reward/edit?id=' + id;
                                reqdata = {
                                    commission: that.isPopoverMessage
                                }
                                Fast.api.ajax({
                                    url: requrl,
                                    loading: false,
                                    type: 'POST',
                                    data: reqdata
                                }, function (ret, res) {
                                    that.reqOrderList();
                                    that.$refs[`popover-${index}-${innerIndex}`][0].doToggle();
                                }, function (ret, res) {
                                    that.isAjax = false;
                                })
                                break;
                            case 'cancel':
                                that.isPopoverEdit = false;
                                that.deductioncheckbox = '1'
                                break;
                        }
                    },
                    changeCommissionStatus(index, type) {
                        this.commissionOperIndex = index;
                        this.commissionOperStatus = type
                    },
                    cancelcommissionStatusOper(index) {
                        this.$refs[`commission-status-${index}`].doToggle();
                        this.commissionOperIndex = null;
                        this.commissionOperStatus = null;
                    },
                    arraySpanMethod({
                        row,
                        column,
                        rowIndex,
                        columnIndex
                    }) {
                        if (rowIndex >= 0) {
                            if (columnIndex === 0) {
                                return [0, 0];
                            } else if (columnIndex === 1) {
                                return [1, 4];
                            }
                        }
                    },
                    rewardStatusClass(status) {
                        switch (status) {
                            case -2:
                                return 'shopro-status-info'
                                break;
                            case -1:
                                return 'shopro-status-error'
                                break;
                            case 0:
                                return 'shopro-status-warning'
                                break;
                            case 1:
                                return 'shopro-status-success'
                                break;
                        }
                    }
                },
            })
        },
    };
    return Controller;
});