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
                            value: '-1',
                            label: "已退回"
                        }, {
                            value: '0',
                            label: "未入账"
                        }, {
                            value: '1',
                            label: "已入账"
                        }],

                        searchForm: {
                            form_1_key: "buyer_id",
                            form_1_value: "",

                            form_2_key: "agent_id",
                            form_2_value: "",


                            order_sn: "",
                            createtime: "",
                            status: "all",

                            id: ''
                        },
                        searchFormInit: {
                            form_1_key: "buyer_id",
                            form_1_value: "",

                            form_2_key: "agent_id",
                            form_2_value: "",


                            order_sn: "",
                            createtime: "",
                            status: "all",

                            id: ''
                        },
                        searchOp: {
                            buyer_id: "=",
                            buyer_nickname: "like",
                            buyer_mobile: "like",

                            agent_id: "=",
                            agent_nickname: "like",
                            agent_mobile: "like",

                            order_sn: "like",
                            createtime: "range",
                            status: "=",

                            id: '='

                        },
                        dashboard: {
                            total: 0,
                            commission_total: 0,
                            commissioned_total: 0,
                            delay_total: 0,
                            commission_back_total: 0,
                        },

                        isAjax: false
                    }
                },
                mounted() {
                    if (new URLSearchParams(location.search).get('agent_id')) {
                        this.searchForm.form_2_key = 'agent_id';
                        this.searchForm.form_2_value = new URLSearchParams(location.search).get('agent_id');
                        if (new URLSearchParams(location.search).get('status')) {
                            this.searchForm.status = new URLSearchParams(location.search).get('status');
                        }
                    } else if (new URLSearchParams(location.search).get('id')) {
                        this.searchForm.id = new URLSearchParams(location.search).get('id');
                        this.searchFormInit.id = new URLSearchParams(location.search).get('id');
                    } else {
                        this.searchForm.createtime = [];
                        let start = `${moment(new Date()).format('YYYY-MM')}-01 00:00:00`;
                        let end = `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`;
                        this.searchForm.createtime.push(start)
                        this.searchForm.createtime.push(end);
                        this.searchFormInit.createtime = this.searchForm.createtime;
                    }
                    this.reqOrderList()
                },
                methods: {
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
                            } else if (key == 'createtime') {
                                if (that.searchForm[key]) {
                                    if (that.searchForm[key].length > 0) {
                                        filter[key] = that.searchForm[key].join(' - ');
                                    }
                                }
                            } else if (key == 'order_sn' || key == 'status' || key == 'id') {
                                if (that.searchForm[key] != '' && that.searchForm[key] != 'all') {
                                    filter[key] = that.searchForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.searchOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/reward/index',
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
                            that.dashboard.total = res.data.total;
                            that.dashboard.commission_total = res.data.commission_total;
                            that.dashboard.commissioned_total = res.data.commissioned_total;
                            that.dashboard.delay_total = res.data.delay_total;
                            that.dashboard.commission_back_total = res.data.commission_back_total
                            that.isAjax = false;
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
                    operation(type, id) {
                        let that = this;
                        switch (type) {
                            case 'edit':
                                Fast.api.open('shopro/commission/agent/profile?id=' + id, '查看', {
                                    callback() {
                                        that.reqOrderList();
                                    }
                                })
                                break;
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
                    openCommissonOrder(order) {
                        Fast.api.open(`shopro/commission/order/index?order_sn=${order.order_sn}`, '查看订单', {
                            callback() {
                                that.reqOrderList();
                            }
                        })
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