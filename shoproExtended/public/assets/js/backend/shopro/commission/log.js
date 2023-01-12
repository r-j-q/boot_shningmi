define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var indexPage = new Vue({
                el: "#indexPage",
                data() {
                    return {
                        searchForm: {
                            form_1_key: "agent_id",
                            form_1_value: "",
                            form_2_key: "oper_id",
                            form_2_value: "",

                            oper_type: 'all',

                            event: "all",
                            createtime: [],
                        },
                        searchFormInit: {
                            form_1_key: "agent_id",
                            form_1_value: "",
                            form_2_key: "oper_id",
                            form_2_value: "",

                            oper_type: 'all',

                            event: "all",
                            createtime: [],
                        },
                        searchOp: {
                            event: "=",
                            createtime: "range",
                        },

                        listData: [],
                        multipleSelection: [],
                        currentPage: 1,
                        totalPage: 0,
                        offset: 0,
                        limit: 10,
                        isAjax: true,

                        logOptions: [],
                        operTypeOptions: [{
                            label: '全部',
                            value: 'all'
                        }, {
                            label: '用户',
                            value: 'user'
                        }, {
                            label: '管理员',
                            value: 'admin'
                        }, {
                            label: '系统',
                            value: 'system'
                        }],
                        really_status: '',
                        reallyTimer: null
                    }
                },
                mounted() {
                    this.getListData();
                    this.getLogStatus()
                },
                methods: {
                    getLogStatus() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/log/getEventAll',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.logOptions = res.data;
                            return false;
                        })
                    },
                    getListData() {
                        let that = this;
                        that.isAjax = true;
                        let filter = {}
                        let op = {}
                        for (key in that.searchForm) {
                            if (key == 'form_1_value' || key == 'form_2_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_1_key] = that.searchForm[key];
                                }
                            } else if (key == 'createtime') {
                                if (that.searchForm[key]) {
                                    if (that.searchForm[key].length > 0) {
                                        filter[key] = that.searchForm[key].join(' - ');
                                    }
                                }
                            } else if (key == 'event' || key == 'oper_type') {
                                if (that.searchForm[key] != '' && that.searchForm[key] != 'all') {
                                    filter[key] = that.searchForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.searchOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/log/index',
                            loading: false,
                            type: 'GET',
                            data: {
                                limit: that.limit,
                                offset: that.offset,
                                filter: JSON.stringify(filter),
                                op: JSON.stringify(op)
                            }
                        }, function (ret, res) {
                            that.listData = res.data.rows;
                            that.totalPage = res.data.total;
                            that.isAjax = false;
                            return false
                        }, function (ret, res) {
                            that.isAjax = false;
                        })
                    },
                    screenEmpty() {
                        this.searchForm = JSON.parse(JSON.stringify(this.searchFormInit))
                    },
                    operation(opttype, row) {
                        let that = this;
                        switch (opttype) {
                            case 'order':
                                Fast.api.open(`shopro/commission/order/index?id=${row.event_id}`, '详情', {
                                    callback(data) {
                                        that.getListData()
                                    }
                                })
                                break;
                            case 'reward':
                                Fast.api.open(`shopro/commission/reward/index?id=${row.event_id}`, '详情', {
                                    callback(data) {
                                        that.getListData()
                                    }
                                })
                                break;
                            case 'share':
                            case 'agent':
                            case 'level':
                                that.openAgentProfile(row.event_id)
                                break;
                        }
                    },
                    openAgentProfile(agent_id) {
                        let that = this;
                        Fast.api.open(`shopro/commission/agent/profile?id=${agent_id}`, '详情', {
                            callback(data) {
                                that.getListData()
                            }
                        })
                    },
                    changeReallyStatus(val) {
                        clearInterval(this.reallyTimer)
                        if (val == 1) {
                            this.reallyTimer = setInterval(() => {
                                this.getListData()
                            }, 3000);
                        }
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 2 || columnIndex == 5 || columnIndex == 7) {
                            return 'cell-left';
                        }
                        return '';
                    },
                    pageSizeChange(val) {
                        this.offset = 0;
                        this.limit = val;
                        this.currentPage = 1;
                        this.getListData();
                    },
                    pageCurrentChange(val) {
                        this.offset = (val - 1) * this.limit;
                        this.currentPage = val;
                        this.getListData();
                    },
                },
            })
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});