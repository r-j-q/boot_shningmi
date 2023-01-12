define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'toastr'], function ($, undefined, Backend, Table, Form, Toastr) {

    var Controller = {
        index: function () {
            var agentIndex = new Vue({
                el: "#agentIndex",
                data() {
                    return {
                        isAjax: true,
                        isAjaxtable: false,
                        activeTabsName: 'all',
                        tabsList: [{
                                name: 'all',
                                label: '分销商'
                            },
                            {
                                name: 'pending',
                                label: '待审核'
                            },
                            {
                                name: '1',
                                label: '待升级'
                            }
                        ],
                        agentLevelList: [],
                        agentStatusOptions: [{
                            value: 'all',
                            label: '全部'
                        }, {
                            value: 'normal',
                            label: '正常'
                        }, {
                            value: 'forbidden',
                            label: '禁用'
                        }, {
                            value: 'pending',
                            label: '审核中'
                        }, {
                            value: 'freeze',
                            label: '冻结'
                        }],
                        // form搜索
                        searchForm: {
                            status: "all",
                            level: "all",
                            updatetime: [],
                            form_1_key: "user_id",
                            form_1_value: "",
                            level_status: "all",
                        },
                        searchFormInit: {
                            status: "all",
                            level: "all",
                            updatetime: [],
                            form_1_key: "user_id",
                            form_1_value: "",
                            level_status: "all"
                        },
                        searchOp: {
                            status: "=",
                            updatetime: 'range',
                            level: "=",
                            user_id: "=",
                            nickname: "like",
                            mobile: "like",
                            level_status: ">"
                        },

                        sort: 'createtime',

                        listData: [],
                        offset: 0,
                        limit: 10,
                        totalPage: 0,
                        currentPage: 1,
                    }
                },
                created() {
                    this.getListData();
                    this.getAgentLevel();
                },
                methods: {
                    getListData() {
                        let that = this;
                        if (!that.isAjax) {
                            that.isAjaxtable = true;
                        }
                        let filter = {}
                        let op = {}
                        for (key in that.searchForm) {
                            if (key == 'form_1_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_1_key] = that.searchForm[key];
                                }
                            } else if (key == 'updatetime') {
                                if (that.searchForm[key]) {
                                    if (that.searchForm[key].length > 0) {
                                        filter[key] = that.searchForm[key].join(' - ');
                                    }
                                }
                            } else if (key == 'status' || key == 'level' || key == 'level_status') {
                                if (that.searchForm[key] != '' && that.searchForm[key] != 'all') {
                                    filter[key] = that.searchForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.searchOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/agent/index',
                            loading: false,
                            type: 'GET',
                            data: {
                                offset: that.offset,
                                limit: that.limit,
                                sort: that.sort,
                                order: 'desc',
                                filter: JSON.stringify(filter),
                                op: JSON.stringify(op)
                            },
                        }, function (ret, res) {
                            that.listData = res.data.rows;
                            that.totalPage = res.data.total;
                            that.isAjax = false;
                            that.isAjaxtable = false;
                            return false;
                        }, function (ret, res) {
                            that.isAjax = false;
                            that.isAjaxtable = false;
                            return false;
                        })
                    },
                    getAgentLevel() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.agentLevelList = res.data;
                            that.agentLevelList.unshift({
                                level: 'all',
                                name: "全部"
                            })
                            return false;
                        })
                    },
                    screenEmpty() {
                        let padding=this.searchForm.status
                        this.searchForm = JSON.parse(JSON.stringify(this.searchFormInit))
                        if(padding=='pending'){
                            this.searchForm.status='pending'
                        }
                    },
                    operation(type, id, row) {
                        let that = this;
                        switch (type) {
                            case 'edit':
                                Fast.api.open('shopro/commission/agent/profile?id=' + id, '查看', {
                                    callback() {
                                        that.getListData();
                                    }
                                })
                                break;
                            case 'del':
                                that.$confirm('此操作将永久直接删除, 是否继续?', '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    Fast.api.ajax({
                                        url: 'shopro/commission/agent/del/ids/' + id,
                                        loading: false,
                                        type: 'POST',
                                    }, function (ret, res) {
                                        that.getListData();
                                    })
                                    return false;
                                }).catch(() => {
                                    that.$message({
                                        type: 'info',
                                        message: '已取消删除'
                                    });
                                });
                                break;
                            case 'reject':
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: 'info_status',
                                        value: '-1'
                                    }
                                }, function (ret, res) {
                                    that.getListData();
                                })

                                break;
                            case 'agree':
                                if (row.info_status == 0) {
                                    that.$confirm('用户还未完善资料, 是否同意申请?', '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                    }).then(() => {
                                        Fast.api.ajax({
                                            url: 'shopro/commission/agent/update?id=' + id,
                                            loading: false,
                                            type: 'POST',
                                            data: {
                                                key: 'status',
                                                value: 'normal'
                                            }
                                        }, function (ret, res) {
                                            that.getListData();
                                        })
                                    }).catch(() => {
                                        that.$message({
                                            type: 'info',
                                            message: '已取消删除'
                                        });
                                    });
                                } else {
                                    Fast.api.ajax({
                                        url: 'shopro/commission/agent/update?id=' + id,
                                        loading: false,
                                        type: 'POST',
                                        data: {
                                            key: 'status',
                                            value: 'normal'
                                        }
                                    }, function (ret, res) {
                                        that.getListData();
                                    })
                                }
                                break;
                            case 'agree-null-status':
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: 'status',
                                        value: 'normal'
                                    }
                                }, function (ret, res) {
                                    that.getListData();
                                })
                                break;
                            case 'filter':
                                var data = {
                                    value: '',
                                    color: ''
                                }
                                switch (id) {
                                    case 'normal':
                                        data.value = '正常';
                                        data.color = '#444';
                                        break;
                                    case 'forbidden':
                                        data.value = '禁用';
                                        data.color = '#ED655F';
                                        break;
                                    case 'pending':
                                        data.value = '审核中';
                                        data.color = '#999';
                                        break;
                                    case 'freeze':
                                        data.value = '冻结';
                                        data.color = '#687FF4';
                                        break;
                                }
                                return data;
                                break;
                            case 'update-agree':
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: 'level_status',
                                        value: row
                                    }
                                }, function (ret, res) {
                                    that.getListData();
                                })
                                break;
                            case 'update-refuse':
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: 'level_status',
                                        value: 0
                                    }
                                }, function (ret, res) {
                                    that.getListData();
                                })
                                break;
                        }
                    },
                    handleSizeChange(val) {
                        this.offset = 0
                        this.limit = val;
                        this.currentPage = 1;
                        this.getListData()
                    },
                    handleCurrentChange(val) {
                        this.currentPage = val;
                        this.offset = (val - 1) * this.limit;
                        this.getListData()
                    },
                    tabshandleClick(value) {
                        this.searchForm.status = "";
                        this.searchForm.level_status = "";
                        if (value.name == 'pending') {
                            this.searchForm.status = value.name;
                            this.sort = 'updatetime';
                        } else if (value.name == '1') {
                            this.searchForm.level_status = value.name;
                            this.sort = 'updatetime';
                        } else {
                            this.sort = 'createtime'
                        }
                        this.listData = [];
                        this.isAjaxtable = true;
                        this.offset = 0;
                        this.limit = 10;
                        this.totalPage = 0;
                        this.currentPage = 1;
                        this.getListData();
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 1 || columnIndex == 7 || columnIndex == 13) {
                            return 'cell-left';
                        }
                        return '';
                    },
                    tableCellClassName2({
                        columnIndex
                    }) {
                        if (columnIndex == 1 || columnIndex == 4 || columnIndex == 10) {
                            return 'cell-left';
                        }
                        return '';
                    },
                    tableCellClassName3({
                        columnIndex
                    }) {
                        if (columnIndex == 1 || columnIndex == 7) {
                            return 'cell-left';
                        }
                        return '';
                    },
                },
            })
        },
        profile: function () {
            function debounce(handle, delay) {
                let time = null;
                return function () {
                    let self = this,
                        arg = arguments;
                    clearTimeout(time);
                    time = setTimeout(function () {
                        handle.apply(self, arg);
                    }, delay)
                }
            }
            let formatterHtml = {
                order_id: (row) => {
                    if(row.order){
                        return `${row.order.id}`
                    }
                },
                order_sn: (row) => {
                    if(row.order){
                        return `<span class="theme-cursor">${row.order.order_sn}</span>`
                    }
                },
                time: (row) => {
                    return `${moment(row.createtime*1000).format('YYYY-MM-DD HH:mm:ss')}`
                },
                user_message: (row) => {
                    if(row.buyer){
                    return `<div class="display-flex" style="justify-content: flex-start;width: 100%;">
                                <div style="width:36px;height:36px;border: 1px solid #E6E6E6;border-radius: 2px;margin-right:10px;overflow: hidden;">
                                    <img style="width:100%;" src="${Fast.api.cdnurl(row.buyer.avatar)}"/>
                                </div>
                                <div class="ellipsis-item">${row.buyer.nickname}</div>
                            </div>`
                    }
                },
                rate: (row) => {
                    return `${row.commission_total}元/${row.commissioned_total}元`
                },
                money: (row) => {
                    return `${row.amount}元`
                },
                commission_detail: (row) => {
                    let ht = ''
                    if (row.reward && row.reward.length > 0) {
                        row.reward.forEach(it => {
                            ht += `<div class="reward-item">
                                    <div style="width:30px;height:30px;border: 1px solid #E6E6E6;border-radius: 50%;margin-bottom:6px;overflow: hidden;">
                                        <img style="width:100%;" src="${Fast.api.cdnurl(it.agent.avatar)}"/>
                                    </div>
                                    <div style="line-height:12px;font-size:12px">${it.commission}元</div>
                                </div>`
                        })
                    }
                    return ht
                },
                oper_id: (row) => {
                    let ht = `<div class="display-flex" style="justify-content: flex-start;width: 100%;">系统</div>`
                    if (row.oper) {
                        ht = `<div class="display-flex" style="justify-content: flex-start;width: 100%;">
                    <div style="width:36px;height:36px;border: 1px solid #E6E6E6;border-radius: 2px;margin-right:10px;overflow: hidden;">
                        <img style="width:100%;" src="${Fast.api.cdnurl(row.oper.avatar)}"/>
                    </div>
                    <div class="ellipsis-item">${row.oper.nickname}</div>
                </div>`
                    }
                    return ht;
                },
                commission_reward_status: (row) => {
                    let color = "#999"
                    if (row.commission_reward_status == 1) {
                        color = "#22D38D"
                    } else if (row.commission_reward_status == -1) {
                        color = "#EC5B55"
                    }
                    return `<div class="display-flex" style="color:${color}">
                                ${row.commission_reward_status_text}
                            </div>`
                },
                status: (row) => {
                    let color = "#999"
                    if (row.status == 1) {
                        color = "#22D38D"
                    } else if (row.status == -1) {
                        color = "#EC5B55"
                    }
                    return `<div class="display-flex" style="color:${color}">
                                ${row.status_text}
                            </div>`
                },
                open: (row) => {
                    let ht = "-"
                    if (row.event == 'order' || row.event == 'reward' || row.event == 'share') {
                        ht = `<div style="color:#7438D5;cursor: pointer;">详情</div>`
                    }
                    return ht
                },
            }
            var agentDetail = new Vue({
                el: "#agentDetail",
                data() {
                    return {
                        profileData: {},
                        columns: {
                            'log': [{
                                type: 'vmodel',
                                field: 'id',
                                title: 'ID',
                                width: '70px',
                            }, {
                                type: 'vmodel',
                                field: 'event_text',
                                title: '动态',
                                width: '140px',
                                header: 'custom-header'
                            }, {
                                type: 'vmodel',
                                field: 'remark',
                                title: '内容',
                                width: '400',
                            }, {
                                type: 'vmodel',
                                field: 'oper_type_text',
                                title: '操作人类型',
                                width: '100',
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '操作人',
                                width: '160px',
                                formatter: formatterHtml.oper_id,
                                align: 'left',
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '动态时间',
                                width: '160px',
                                formatter: formatterHtml.time,
                                align: 'left',
                            }, {
                                type: 'open',
                                field: '',
                                title: '操作',
                                width: '80px',
                                formatter: formatterHtml.open,
                                align: 'left',
                                // fixed: 'right',
                            }],
                            'order': [{
                                type: 'vhtml',
                                field: '',
                                title: 'ID',
                                width: '70px',
                                formatter: formatterHtml.order_id,
                            }, {
                                type: 'click',
                                field: '',
                                title: '订单号',
                                width: '220px',
                                formatter: formatterHtml.order_sn,
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '下单用户信息',
                                width: '160px',
                                formatter: formatterHtml.user_message,
                                align: 'left',

                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '分佣状态',
                                width: '90px',
                                formatter: formatterHtml.commission_reward_status,
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '商品结算金额',
                                width: '120px',
                                formatter: formatterHtml.money,
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '分佣金额/到账金额',
                                width: '144px',
                                formatter: formatterHtml.rate,

                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '佣金详情',
                                width: '260px',
                                formatter: formatterHtml.commission_detail,
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '加入时间',
                                width: '160px',
                                formatter: formatterHtml.time,
                                align: 'left',
                            }],
                            'reward': [{
                                type: 'vhtml',
                                field: '',
                                title: 'ID',
                                width: '70px',
                                formatter: formatterHtml.order_id,
                            }, {
                                type: 'click',
                                field: '',
                                title: '订单号',
                                width: '220px',
                                formatter: formatterHtml.order_sn,
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '下单用户信息',
                                width: '160px',
                                formatter: formatterHtml.user_message,
                                align: 'left',
                            }, {
                                type: 'vmodel',
                                field: 'commission',
                                title: '分佣金额',
                                width: '90px',
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '分佣用户',
                                width: '160px',
                                formatter: formatterHtml.user_message,
                                align: 'left',
                            }, {
                                type: 'vhtml',
                                field: 'type_text',
                                title: '入账状态',
                                width: '90px',
                                formatter: formatterHtml.status,
                            }, {
                                type: 'vmodel',
                                field: 'type_text',
                                title: '入账方式',
                                width: '90px',
                            }, {
                                type: 'vhtml',
                                field: '',
                                title: '分佣时间',
                                width: '160px',
                                formatter: formatterHtml.time,
                                align: 'left',
                            }],
                        },
                        offset: 0,
                        limit: 10,
                        totalPage: 0,
                        currentPage: 1,
                        logList: [],
                        activeStatus: 'log',

                        dialogType: '',
                        dialogVisible: false,

                        agentLevelList: [],
                        selectAgentLevel: '',
                        dialogList: [],
                        poffset: 0,
                        plimit: 5,
                        ptotalPage: 0,
                        pcurrentPage: 1,

                        defaultProps: {
                            children: 'children',
                            label: 'name',
                            multiple: false,
                            checkStrictly: true,
                            value: 'id',
                        },
                        agentStatusOptions: [{
                            value: 'normal',
                            label: '正常'
                        }, {
                            value: 'forbidden',
                            label: '禁用'
                        }, {
                            value: 'pending',
                            label: '审核中'
                        }, {
                            value: 'freeze',
                            label: '冻结'
                        }],
                        agentInfoOptions: [{
                            value: -1,
                            label: '驳回'
                        }, {
                            value: 0,
                            label: '未完善'
                        }, {
                            value: 1,
                            label: '已完善'
                        }, {
                            value: null,
                            label: '无需资料'
                        }],
                        applyInfoList: [],
                        isEditInfoStatus: false,
                        selectedTeamId: null,

                        agentAjax: true,
                        logListAjax: true,
                        logOptions: [{
                            value: -1,
                            label: '驳回'
                        }, {
                            value: 0,
                            label: '未完善'
                        }, {
                            value: 1,
                            label: '已完善'
                        }],
                        logStatus: 'all',

                        filterForm: {
                            agent_id: Config.row.user_id,
                            event: 'all'
                        },

                        filterOp: {
                            agent_id: "=",
                            event: "=",
                        },


                        // 更换上级分销商搜索
                        parentFilterForm: {
                            status: "normal",
                            form_1_key: "user_id",
                            form_1_value: ""
                        },
                        parentFilterFormInit: {
                            status: "normal",
                            form_1_key: "user_id",
                            form_1_value: ""
                        },
                        parentFilterOp: {
                            status: "=",

                            user_id: "=",
                            nickname: "like",
                            mobile: "like",
                        },
                        selectParentAgentId: null,
                        noRecommendationChecked: false
                    }
                },
                created() {
                    this.getprofile();

                    this.selectedTeamId = Config.row.user_id;

                    this.getLogStatus();

                    this.getListData(this.activeStatus);
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
                    changeLogEvent() {
                        this.getListData('log')
                    },
                    isexpanded(data) {
                        data.expanded = !data.expanded
                    },
                    getApplyInfo() {
                        let that = this;
                        that.agentAjax = true;
                        Fast.api.ajax({
                            url: 'shopro/commission/config/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            if (that.profileData.apply_info) {
                                that.profileData.apply_info = JSON.parse(that.profileData.apply_info);
                            } else {
                                that.profileData.apply_info = []
                            }
                            if (JSON.parse(res.data.agent_form) == 0) {
                                that.applyInfoList = JSON.parse(res.data.agent_form)
                            } else {
                                that.applyInfoList = JSON.parse(res.data.agent_form).content;
                                if (that.profileData.apply_info) {
                                    if (that.profileData.apply_info) {
                                        that.applyInfoList.forEach(e => {
                                            let isexist = false;
                                            that.profileData.apply_info.forEach(j => {
                                                if (e.name == j.name && e.type == j.type) {
                                                    isexist = true;
                                                }
                                            })
                                            if (!isexist) {
                                                that.profileData.apply_info.push({
                                                    name: e.name,
                                                    type: e.type,
                                                    value: '',
                                                    isdelete: true
                                                })
                                            }
                                        });
                                    } else {
                                        that.profileData.apply_info.push({
                                            name: e.name,
                                            type: e.type,
                                            value: '',
                                            isdelete: true
                                        })
                                    }
                                }
                            }
                            //生成预览
                            that.profileData.apply_info.forEach(i => {
                                if (i.type == 'image') {
                                    i.value_arr = [];
                                    i.value_arr.push(Fast.api.cdnurl(i.value))
                                }
                            })
                            that.agentAjax = false;
                            return false;
                        }, function (ret, res) {
                            that.agentAjax = false;
                        })
                    },
                    openDialog(type) {
                        this.dialogType = type;
                        this.dialogList = []
                        if (this.dialogType == 'change-parent-agent') {
                            this.getParentAgentList();
                        } else if (this.dialogType == 'change-level') {
                            this.getAgentLevel();
                        }
                    },
                    closeDialog(opttype, type) {
                        this.dialogVisible = false;
                        this.parentFilterForm.form_1_value = "";
                        this.parentFilterForm.form_1_key = "user_id";
                        if (opttype == true) {
                            if (type == 'change-level') {
                                this.operation('save', 'level')
                            } else if (type == 'change-parent-agent') {
                                this.operation('save', 'parent_agent_id')
                            }
                        }
                    },

                    getAgentLevel() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.agentLevelList = res.data;
                            that.dialogVisible = true;
                            return false;
                        })
                    },
                    getParentAgentList() {
                        let that = this;
                        let filter = {}
                        let op = {}
                        for (key in that.parentFilterForm) {
                            if (key == 'form_1_value') {
                                if (that.parentFilterForm[key] != '') {
                                    filter[that.parentFilterForm.form_1_key] = that.parentFilterForm[key];
                                }
                            } else if (key == 'status') {
                                if (that.parentFilterForm[key] != '' && that.parentFilterForm[key] != 'all') {
                                    filter[key] = that.parentFilterForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.parentFilterOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/agent/index',
                            loading: false,
                            type: 'GET',
                            data: {
                                offset: that.poffset,
                                limit: that.plimit,
                                filter: JSON.stringify(filter),
                                op: JSON.stringify(op)
                            },
                        }, function (ret, res) {
                            that.dialogList = res.data.rows;
                            that.ptotalPage = res.data.total;
                            that.dialogVisible = true;
                            return false;
                        })
                    },
                    parentDebounceFilter: debounce(function () {
                        this.getParentAgentList()
                    }, 1000),
                    phandleCurrentChange(val) {
                        this.pcurrentPage = val;
                        this.poffset = (val - 1) * this.plimit;
                        this.getParentAgentList()
                    },

                    getprofile() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/agent/profile?id=' + Config.row.user_id,
                            loading: false,
                            type: 'GET',
                            data: {},
                        }, function (ret, res) {
                            that.profileData = res.data;
                            that.selectAgentLevel = that.profileData.level;
                            that.getApplyInfo();
                            return false;
                        })
                    },
                    //列表
                    radioChange(val) {
                        this.logList = [];
                        this.activeStatus = val;
                        this.page = 1;
                        this.limit = 10;
                        this.currentPage = 1;
                        this.totalPage = 0;
                        this.getListData(val)
                    },
                    getListData(val) {
                        let that = this;
                        that.logListAjax = true;
                        let filter = {}
                        let op = {}
                        for (key in that.filterForm) {
                            if (key == 'event' && val == 'log') {
                                if (that.filterForm[key] != '' && that.filterForm[key] != 'all') {
                                    filter[key] = that.filterForm[key];
                                }
                            } else if (key == 'agent_id') {
                                if (that.filterForm[key] != '') {
                                    filter[key] = that.filterForm[key];
                                }
                            }
                        }
                        for (key in filter) {
                            op[key] = that.filterOp[key]
                        }
                        Fast.api.ajax({
                            url: `shopro/commission/${val}/index`,
                            loading: false,
                            type: 'GET',
                            data: {
                                offset: that.offset,
                                limit: that.limit,
                                op: JSON.stringify(op),
                                filter: JSON.stringify(filter),
                            },
                        }, function (ret, res) {
                            that.logList = res.data.rows;
                            that.totalPage = res.data.total;
                            that.logListAjax = false;
                            return false;
                        })
                    },
                    statusChange() {
                        this.operation('save', 'status')
                    },
                    applyInfoStatusChange() {
                        this.operation('save', 'info_status')
                    },
                    lockChange() {
                        this.operation('save', 'upgrade_lock')
                    },
                    operation(type, id, data) {
                        let that = this;
                        switch (type) {
                            case 'view-parent-agent':
                                parent.Fast.api.open("shopro/commission/agent/profile?id=" + id, "上级分销商");
                                break;
                            case 'select-image':
                                Fast.api.open("general/attachment/select?multiple=false", "选择", {
                                    callback: function (data) {
                                        that.profileData.apply_info[id].value = data.url;
                                    }
                                });
                                break;
                            case 'delete-apply-info':
                                that.profileData.apply_info.splice(id, 1);
                                break;
                            case 'save':
                                let subValue;
                                if (id == 'apply_info') {
                                    subValue = that.profileData.apply_info;
                                    subValue.forEach(i => {
                                        if (i.type == 'image') {
                                            delete i.value_arr;
                                        }
                                        delete i.isdelete;
                                    })
                                    subValue = JSON.stringify(subValue)
                                } else if (id == 'level') {
                                    subValue = that.selectAgentLevel
                                } else if (id == 'parent_agent_id') {
                                    subValue = that.selectParentAgentId
                                } else {
                                    subValue = that.profileData[id]
                                }
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + Config.row.user_id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: id,
                                        value: subValue
                                    },
                                }, function (ret, res) {
                                    that.isEditInfoStatus = false;
                                    that.selectParentAgentId = null;
                                    that.parentFilterForm.form_1_value = "";
                                    that.parentFilterForm.form_1_key = "user_id";
                                    that.getprofile();
                                }, function (ret, res) {
                                    that.isEditInfoStatus = false;
                                    that.selectParentAgentId = null;
                                    that.parentFilterForm.form_1_value = "";
                                    that.parentFilterForm.form_1_key = "user_id";
                                })
                                break;
                            case 'edit-info-status':
                                that.isEditInfoStatus = true;
                                break;
                            case 'filter-color':
                                switch (id) {
                                    case 'normal':
                                        return 'filter-color-normal'
                                        break;
                                    case 'forbidden':
                                        return 'filter-color-forbidden'
                                        break;
                                    case 'pending':
                                        return 'filter-color-pending'
                                        break;
                                    case 'freeze':
                                        return 'filter-color-freeze'
                                        break;
                                }
                                break;
                            case 'select-agent-level':
                                that.selectAgentLevel = id;
                                break;
                            case 'open-order':
                                parent.Fast.api.open(`shopro/commission/order/index?agent_id=${Config.row.user_id}`, "直推分销订单");
                                break;
                            case 'open-reward':
                                parent.Fast.api.open(`shopro/commission/reward/index?agent_id=${Config.row.user_id}&status=${id}`, "佣金明细");
                                break;
                            case 'open-user':
                                parent.Fast.api.open('shopro/user/user/profile?id=' + id, '查看用户')
                                break;
                            case 'open-order':
                                parent.Fast.api.open('shopro/order/order/detail?id=' + id, "查看详情", {
                                    callback() {
                                        that.reqOrderList()
                                    }
                                });
                                break;
                            case 'list-detail':
                                parent.Fast.api.open(`shopro/commission/${that.activeStatus}/index?agent_id=${Config.row.user_id}`, "查看详情", {
                                    callback() {
                                        that.reqOrderList();
                                    }
                                });
                                break;
                            case 'order':
                                Fast.api.open(`shopro/commission/order/index?id=${id}`, '详情', {
                                    callback(data) {
                                        that.reqOrderList()
                                    }
                                })
                                break;
                            case 'reward':
                                Fast.api.open(`shopro/commission/reward/index?id=${id}`, '详情', {
                                    callback(data) {
                                        that.reqOrderList()
                                    }
                                })
                                break;
                            case 'share':
                                Fast.api.open(`shopro/user/user/profile?id=${id}`, '详情', {
                                    callback(data) {
                                        that.reqOrderList()
                                    }
                                })
                                break;
                            case 'select-parent-agent':
                                if (id === true) {
                                    that.selectParentAgentId = 0;
                                } else if (id === false) {
                                    that.selectParentAgentId = null;
                                } else {
                                    that.selectParentAgentId = id;
                                    that.noRecommendationChecked = false;
                                }
                                break;
                            case 'level-status':
                                Fast.api.ajax({
                                    url: 'shopro/commission/agent/update?id=' + Config.row.user_id,
                                    loading: false,
                                    type: 'POST',
                                    data: {
                                        key: 'level_status',
                                        value: id
                                    },
                                }, function (ret, res) {
                                    that.getprofile();
                                })
                                break;
                            case 'view-team':
                                Fast.api.open(`shopro/commission/agent/team?id=${id}`, '查看团队')
                                break;


                        }
                    },
                    handleSizeChange(val) {
                        this.offset = 0
                        this.limit = val;
                        this.currentPage = 1;
                        this.getListData(this.activeStatus)
                    },
                    handleCurrentChange(val) {
                        this.currentPage = val;
                        this.offset = (val - 1) * this.limit;
                        this.getListData(this.activeStatus)
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 1) {
                            return 'cell-left';
                        }
                        return '';
                    },
                },
            })
        },
        team: function () {
            function debounce(handle, delay) {
                let time = null;
                return function () {
                    let self = this,
                        arg = arguments;
                    clearTimeout(time);
                    time = setTimeout(function () {
                        handle.apply(self, arg);
                    }, delay)
                }
            }
            let formatterHtml = {
                time: (row) => {
                    return `${moment(row.createtime*1000).format('YYYY-MM-DD HH:mm:ss')}`
                },
                level: (row) => {
                    let ht = `<div>-</div>`
                    if (row.agent && row.agent.agent_level) {
                        ht = `<div class="display-flex" style="width:100%">
                                <div v-if="${row.agent.agent_level.image}"
                                style="width:36px;height:36px;border-radius: 2px;margin-right:10px;display:flex;align-items: center;">
                                    <img style="width:100%" src="${Fast.api.cdnurl(row.agent.agent_level.image)}" />
                                </div>
                                <div class="ellipsis-item">${row.agent.agent_level.name}</div>
                            </div>`
                    }
                    return ht;
                },
                message: (row) => {
                    let ht = '<div>-<div>'
                    if (row.avatar) {
                        ht = `<div class="display-flex" style="width:100%">
                        <div style="width:36px;height:36px;border-radius: 2px;margin-right:10px;overflow: hidden;flex-shrink: 0;">
                            <img style="width:100%;" src="${Fast.api.cdnurl(row.avatar)}"/>
                        </div>
                        <div class="ellipsis-item">-</div>
                    </div>`
                    }
                    if (row.nickname) {
                        ht = `<div class="display-flex" style="width:100%">
                            <div class="ellipsis-item">${row.nickname}</div>
                        </div>`
                    }
                    if (row.avatar && row.nickname) {
                        ht = `<div class="display-flex" style="width:100%">
                        <div style="width:36px;height:36px;border-radius: 2px;margin-right:10px;overflow: hidden;flex-shrink: 0;">
                            <img style="width:100%;" src="${Fast.api.cdnurl(row.avatar)}"/>
                        </div>
                        <div class="ellipsis-item">${row.nickname}</div>
                    </div>`
                    }
                    return ht;
                },
                status: (row) => {
                    let ht = `<div>-</div>`;
                    let className = ''
                    if (row.agent) {
                        if (row.agent.status == 'normal') {
                            className = 'filter-color-normal';
                        } else if (row.agent.status == 'forbidden') {
                            className = 'filter-color-forbidden';
                        } else if (row.agent.status == 'pending') {
                            className = 'filter-color-pending';
                        } else if (row.agent.status == 'freeze') {
                            className = 'filter-color-freeze';
                        }
                        ht = `<div class="display-flex ${className}">
                                ${row.agent.status_text}
                            </div>`

                    }
                    return ht;
                },
                moneynum: (row, outterfield, field) => {
                    let ht = `<div>-</div>`
                    if (row.agent) {
                        ht = `<div class="display-flex">
                                ${row[field]}<span class="unit-tip-item">人</span>
                            </div>`
                        if (outterfield) {
                            ht = `<div class="display-flex">
                                ${row[outterfield][field]}<span class="unit-tip-item">元</span>
                            </div>`
                        }
                        if(field=='total_consume'){
                            ht = `<div class="display-flex">
                                ${row[field]}<span class="unit-tip-item">元</span>
                            </div>`
                        }
                    }
                    return ht;
                },
                singlenum: (row, outterfield, field) => {
                    let ht = `<div>-</div>`
                    if (row.agent) {
                        ht = `<div class="display-flex">
                                ${row[outterfield][field]}<span class="unit-tip-item">单</span>
                            </div>`
                    }
                    return ht;
                },
                peoplenum: (row, outterfield, field) => {
                    let ht = `<div class="display-flex">
                                ${row[field]}<span class="unit-tip-item">人</span>
                            </div>`
                    if (outterfield) {
                        if(row[outterfield]){
                            ht = `<div class="display-flex">
                            ${row[outterfield][field]}<span class="unit-tip-item">人</span>
                        </div>`
                        }else{
                            ht ='-'
                        }
                        
                    }
                    return ht;

                },
            }
            var agentTeam = new Vue({
                el: "#agentTeam",
                data() {
                    return {
                        id: new URLSearchParams(location.search).get('id'),
                        searchId: new URLSearchParams(location.search).get('id'),
                        blockSearchId: new URLSearchParams(location.search).get('id'),
                        teamList: [],
                        tableIdArr: [],

                        offset: 0,
                        limit: 10,
                        totalPage: 0,
                        currentPage: 1,
                        teamAjax: false,

                        agentLevelList: [],
                        // 筛选
                        searchForm: {
                            level: "",
                            form_1_key: "id",
                            form_1_value: ""
                        },
                        searchFormInit: {
                            level: "",
                            form_1_key: "id",
                            form_1_value: ""
                        },
                        searchOp: {
                            parent_user_id: '=',
                            level: "=",
                            id: "=",
                            nickname: "like",
                            mobile: "like",
                        },
                        parent_user: [],
                        dashboardIdList: ['id', 'avatar-nickname', 'level', 'status', 'child_user_count', 'child_user_count_1', 'child_user_count_2', 'child_agent_count', 'child_agent_count_1', 'child_agent_count_2', 'child_order_money', 'child_order_money_1', 'child_order_money_2', 'order_money', 'child_order_count', 'child_order_count_1', 'child_order_count_2', 'order_count', 'total_income', 'delay_money', 'total_consume', 'createtime'],
                        dashboardList: [{
                            label: 'ID',
                            value: 'id',
                        }, {
                            label: '团队用户',
                            value: 'avatar-nickname',
                        }, {
                            label: '等级',
                            value: 'level',
                        }, {
                            label: '状态',
                            value: 'status',
                        }, {
                            label: '团队人数',
                            value: 'child_user_count',
                        }, {
                            label: '一级团队人数',
                            value: 'child_user_count_1',
                        }, {
                            label: '二级团队人数',
                            value: 'child_user_count_2',
                        }, {
                            label: '分销商人数',
                            value: 'child_agent_count',
                        }, {
                            label: '一级分销商人数',
                            value: 'child_agent_count_1',
                        }, {
                            label: '二级分销商人数',
                            value: 'child_agent_count_2',
                        }, {
                            label: '团队分销总额',
                            value: 'child_order_money',
                        }, {
                            label: '一级分销总额',
                            value: 'child_order_money_1',
                        }, {
                            label: '二级分销总额',
                            value: 'child_order_money_2',
                        }, {
                            label: '直推分销总额',
                            value: 'order_money',
                        }, {
                            label: '团队分销订单',
                            value: 'child_order_count',
                        }, {
                            label: '一级分销订单',
                            value: 'child_order_count_1',
                        }, {
                            label: '二级分销订单',
                            value: 'child_order_count_2',
                        }, {
                            label: '直推分销订单',
                            value: 'order_count',
                        }, {
                            label: '累计佣金',
                            value: 'total_income',
                        }, {
                            label: '消费金额',
                            value: 'delay_money',
                        }, {
                            label: '待入账佣金',
                            value: 'total_consume',
                        }, {
                            label: '加入时间',
                            value: 'createtime',
                        }],
                        columns: [{
                            type: 'vmodel',
                            field: 'id',
                            title: 'ID',
                            width: '70px',
                        }, {
                            type: 'click',
                            field: 'avatar-nickname',
                            title: '团队用户',
                            width: '160px',
                            formatter: formatterHtml.message,
                            align: 'left',
                        }, {
                            type: 'vhtml',
                            field: 'level',
                            title: '等级',
                            width: '180px',
                            formatter: formatterHtml.level,
                            align: 'left',
                        }, {
                            type: 'vhtml',
                            field: 'status',
                            title: '状态',
                            width: '60px',
                            formatter: formatterHtml.status,
                        }, {
                            type: 'vhtml',
                            field: 'child_user_count',
                            title: '团队人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_user_count_1',
                            title: '一级团队人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_user_count_2',
                            title: '二级团队人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_agent_count',
                            outterfield: 'agent',
                            title: '分销商人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_agent_count_1',
                            outterfield: 'agent',
                            title: '一级分销商人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_agent_count_2',
                            outterfield: 'agent',
                            title: '二级分销商人数',
                            width: '120px',
                            formatter: formatterHtml.peoplenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_money',
                            outterfield: 'agent',
                            title: '团队分销总额',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_money_1',
                            outterfield: 'agent',
                            title: '一级分销总额',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_money_2',
                            outterfield: 'agent',
                            title: '二级分销总额',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'order_money',
                            outterfield: 'agent',
                            title: '直推分销总额',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_count',
                            outterfield: 'agent',
                            title: '团队分销订单',
                            width: '120px',
                            formatter: formatterHtml.singlenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_count_1',
                            outterfield: 'agent',
                            title: '一级分销订单',
                            width: '120px',
                            formatter: formatterHtml.singlenum,
                        }, {
                            type: 'vhtml',
                            field: 'child_order_count_2',
                            outterfield: 'agent',
                            title: '二级分销订单',
                            width: '120px',
                            formatter: formatterHtml.singlenum,
                        }, {
                            type: 'vhtml',
                            field: 'order_count',
                            outterfield: 'agent',
                            title: '直推分销订单',
                            width: '120px',
                            formatter: formatterHtml.singlenum,
                        }, {
                            type: 'vhtml',
                            field: 'total_income',
                            outterfield: 'agent',
                            title: '累计佣金',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'delay_money',
                            outterfield: 'agent',
                            title: '消费金额',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'total_consume',
                            title: '待入账佣金',
                            width: '120px',
                            formatter: formatterHtml.moneynum,
                        }, {
                            type: 'vhtml',
                            field: 'createtime',
                            outterfield: 'agent',
                            title: '加入时间',
                            width: '160px',
                            formatter: formatterHtml.time,
                        }]

                    }
                },
                created() {
                    this.getAgentTeam();
                    this.getAgentLevel();
                },
                methods: {
                    operation(type, id) {
                        let that = this;
                        switch (type) {
                            case 'clickteam':
                                if (!that.tableIdArr.includes(id)) {
                                    that.searchId = id;
                                    that.tableIdArr.push(id);
                                    that.getAgentTeam();
                                }
                                break;
                            case 'clickteamdelete':
                                if (id) {
                                    that.searchId = id;
                                    that.tableIdArr.splice((that.tableIdArr.indexOf(id) + 1));
                                } else {
                                    that.searchId = that.id;
                                    that.tableIdArr = []
                                }
                                that.getAgentTeam();
                                break;
                        }
                    },
                    debounceFilter: debounce(function () {
                        this.offset = 0
                        this.limit = 10;
                        this.currentPage = 1;
                        this.getAgentTeam()
                    }, 1000),
                    getAgentLevel() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.agentLevelList = res.data;
                            return false;
                        })
                    },
                    getAgentTeam() {
                        let that = this;
                        that.teamAjax = true;
                        let filter = {}
                        let op = {}
                        for (key in that.searchForm) {
                            if (key == 'form_1_value') {
                                if (that.searchForm[key] != '') {
                                    filter[that.searchForm.form_1_key] = that.searchForm[key];
                                }
                            } else if (key == 'level') {
                                if (that.searchForm[key] != '' && that.searchForm[key] != 'all') {
                                    filter[key] = that.searchForm[key];
                                }
                            }
                        }
                        filter.parent_user_id = that.searchId;
                        for (key in filter) {
                            op[key] = that.searchOp[key]
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/agent/team',
                            loading: false,
                            type: 'GET',
                            data: {
                                offset: that.offset,
                                limit: that.limit,
                                filter: JSON.stringify(filter),
                                op: JSON.stringify(op)
                            },
                        }, function (ret, res) {
                            that.teamList = res.data.rows;
                            that.totalPage = res.data.total;
                            that.parent_user = [];
                            that.parent_user.push(res.data.parent_user);
                            that.teamAjax = false;
                            return false;
                        }, function (ret, res) {
                            that.teamAjax = false;
                            return false;
                        })
                    },
                    handleSizeChange(val) {
                        this.offset = 0
                        this.limit = val;
                        this.currentPage = 1;
                        this.getAgentTeam()
                    },
                    handleCurrentChange(val) {
                        this.currentPage = val;
                        this.offset = (val - 1) * this.limit;
                        this.getAgentTeam()
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 1) {
                            return 'cell-left';
                        }
                        return '';
                    },
                },
            })
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        },

    };
    return Controller;
});