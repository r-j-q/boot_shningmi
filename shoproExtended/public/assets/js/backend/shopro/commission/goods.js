const {
    contains
} = require("jquery");

define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var indexPage = new Vue({
                el: "#indexPage",
                data() {
                    return {
                        goodTypeOptions: [{
                                name: "全部",
                                type: "all"
                            },
                            {
                                name: "实体商品",
                                type: "normal"
                            },
                            {
                                name: "虚拟商品",
                                type: "virtual"
                            }
                        ],
                        activityTypeOptions: [{
                                name: "全部",
                                type: "all"
                            },
                            {
                                name: "拼团",
                                type: "groupon"
                            },
                            {
                                name: "秒杀",
                                type: "seckill"
                            }, {
                                name: "积分",
                                type: "score"
                            }
                        ],
                        commissionTypeOptions: [{
                                name: "全部",
                                type: "all"
                            },
                            {
                                name: "默认规则",
                                type: "0"
                            },
                            {
                                name: "独立规则",
                                type: "1"
                            }, {
                                name: "批量规则",
                                type: "2"
                            }
                        ],
                        commissionStatusOptions: [{
                                name: "全部",
                                type: "all"
                            },
                            {
                                name: "不参与",
                                type: "0"
                            },
                            {
                                name: "参与",
                                type: "1"
                            }
                        ],
                        searchForm: {
                            goods_title: '',
                            goods_type: 'all',
                            activity_type: 'all',
                            self_rules: 'all',
                            commission_goods_status: 'all',
                        },
                        searchFormInit: {
                            goods_title: '',
                            goods_type: 'all',
                            activity_type: 'all',
                            self_rules: 'all',
                            commission_goods_status: 'all',
                        },

                        listData: [],
                        multipleSelection: [],
                        currentPage: 1,
                        totalPage: 0,
                        offset: 0,
                        limit: 10,
                        isAjax: true,
                        tableAjax: false,
                        allcheckeds:false,
                    }
                },
                mounted() {
                    this.getListData();
                },
                methods: {
                    getListData() {
                        let that = this;
                        if (!that.isAjax) {
                            that.tableAjax = true;
                        }
                        Fast.api.ajax({
                            url: 'shopro/commission/goods/index',
                            loading: false,
                            type: 'GET',
                            data: {
                                limit: that.limit,
                                offset: that.offset,
                                goods_title: that.searchForm.goods_title,
                                goods_type: that.searchForm.goods_type,
                                activity_type: that.searchForm.activity_type == 'score' ? 'all' : that.searchForm.activity_type,
                                app_type: that.searchForm.activity_type == 'score' ? 'score' : 'all',
                                self_rules: that.searchForm.self_rules,
                                commission_goods_status: that.searchForm.commission_goods_status,
                            }
                        }, function (ret, res) {
                            that.listData = res.data.rows;
                            that.totalPage = res.data.total;
                            that.isAjax = false;
                            that.tableAjax = false;
                            return false
                        }, function (ret, res) {
                            that.isAjax = false;
                            that.tableAjax = false;
                        })
                    },
                    screenEmpty() {
                        this.searchForm = JSON.parse(JSON.stringify(this.searchFormInit))
                    },
                    operation(opttype, row) {
                        let that = this;
                        switch (opttype) {
                            case 'join':
                                let isJoin = true;
                                let idsArrjoin = [];
                                if (row == 0) {
                                    that.multipleSelection.forEach(i => {
                                        if (!i.commission) {
                                            isJoin = false;
                                        }
                                        idsArrjoin.push(i.id)
                                    })
                                } else {
                                    isJoin = row.commission ? true : false
                                    idsArrjoin.push(row.id)
                                }
                                if (!isJoin) {
                                    this.$alert('请先设置商品规则', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                    }).then(() => {
                                        Fast.api.open('shopro/commission/goods/edit?ids=' + idsArrjoin.join(','), '设置佣金', {
                                            callback(data) {
                                                that.getListData()
                                            }
                                        })
                                    }).catch(() => {
                                        this.$message({
                                            type: 'info',
                                            message: '已关闭'
                                        });
                                    });
                                } else {
                                    Fast.api.ajax({
                                        url: 'shopro/commission/goods/commission_status',
                                        type: 'POST',
                                        data: {
                                            ids: idsArrjoin.join(','),
                                            status: 1
                                        },
                                        loading: true,
                                    }, function (ret, res) {
                                        that.getListData();
                                        return false;
                                    })
                                }
                                break;
                            case 'nojoin':
                                let idsArrno = [];
                                if (row == 0) {
                                    that.multipleSelection.forEach(i => {
                                        idsArrno.push(i.id)
                                    })
                                } else {
                                    idsArrno.push(row.id)
                                }

                                Fast.api.ajax({
                                    url: 'shopro/commission/goods/commission_status',
                                    type: 'POST',
                                    data: {
                                        ids: idsArrno.join(','),
                                        status: 0
                                    },
                                    loading: true,
                                }, function (ret, res) {
                                    that.getListData();
                                    return false;
                                })
                                break;
                            case 'edit':
                                let idsArredit = [];
                                if (row == 0) {
                                    that.multipleSelection.forEach(i => {
                                        idsArredit.push(i.id)
                                    })
                                } else {
                                    idsArredit.push(row.id)
                                }
                                Fast.api.open('shopro/commission/goods/edit?ids=' + idsArredit.join(','), '设置佣金', {
                                    callback(data) {
                                        that.getListData()
                                    }
                                })
                                break;
                        }
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 2 || columnIndex == 5) {
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
                    handleSelectionChange(val) {
                        this.multipleSelection = val;
                        if(this.multipleSelection.length==this.listData.length){
                            this.allcheckeds=true
                        }else{
                            this.allcheckeds=false
                        }
                    },
                    changeAllcheckeds(val){
                        if(val){
                            this.listData.forEach(row => {
                                this.$refs.multipleTable.toggleRowSelection(row,true);
                            });
                        }else{
                            this.$refs.multipleTable.clearSelection();
                        }
                    }
                },
            })
        },
        edit: function () {
            Controller.detailInit('edit');
            Controller.api.bindevent();
        },
        detailInit: function (type) {
            Vue.directive('enterNumber', {
                inserted: function (el) {
                    let changeValue = (el, type) => {
                        const e = document.createEvent('HTMLEvents')
                        e.initEvent(type, true, true)
                        el.dispatchEvent(e)
                    }
                    el.addEventListener("keyup", function (e) {
                        let input = e.target;
                        let reg = new RegExp('^((?:(?:[1-9]{1}\\d*)|(?:[0]{1}))(?:\\.(?:\\d){0,2})?)(?:\\d*)?$');
                        let matchRes = input.value.match(reg);
                        if (matchRes === null) {
                            input.value = "";
                        } else {
                            if (matchRes[1] !== matchRes[0]) {
                                input.value = matchRes[1];
                            }
                        }
                        changeValue(input, 'input')
                    });
                }
            });
            var detailPage = new Vue({
                el: "#detailPage",
                data() {
                    return {
                        optType: type,
                        isalone: new URLSearchParams(location.search).get('ids').indexOf(',') == -1 ? 0 : 1,
                        ids: new URLSearchParams(location.search).get('ids'),
                        goodsDetail: {},

                        levelList: [],
                        self_rules: 0,
                        status: 1,

                        commission_rules: {},
                        commission_rules_bak0: null,
                        commission_rules_bak1: null,
                        commission_rules_bak2: null,
                        batchShow: {
                            1: false,
                            2: false,
                            3: false
                        },
                        batchList: {
                            rate: '',
                            money: ''
                        },
                        isLevelChange: false,
                        isSkuPriceChange: false,
                        radioEnd: 0,

                        commission_config: '0',
                        commission_config_obj: {
                            commission_level: '1',
                            self_buy: '0',
                            commission_price_type: 'goods_price',
                            commission_event: 'payed'
                        },
                        commission_order_status: 1,
                    }
                },
                mounted() {
                    this.getStoreList();
                    if (!Config.row[0].commission || (Config.row[0].commission && (Config.row[0].commission.commission_config == '' || Config.row[0].commission.commission_config == 0))) {
                        this.commission_config = 0;
                        this.commission_config_obj = Config.defaultCommissionConfig;
                        this.commission_config_obj.commission_level = Config.defaultCommissionConfig.commission_level == 0 ? '1' : Config.defaultCommissionConfig.commission_level;
                    } else if (Config.row[0].commission && Config.row[0].commission.commission_config instanceof Object) {
                        this.commission_config = 1;
                        this.commission_config_obj = Config.row[0].commission.commission_config;
                    }
                },
                methods: {
                    changeCommissionConfig(value) {
                        if (value == 1) {
                            if (!Config.row[0].commission || (Config.row[0].commission && (Config.row[0].commission.commission_config == '' || Config.row[0].commission.commission_config == 0))) {
                                this.commission_config_obj = Config.defaultCommissionConfig;
                                this.commission_config_obj.commission_level = Config.defaultCommissionConfig.commission_level == 0 ? '1' : Config.defaultCommissionConfig.commission_level;
                            } else if (Config.row[0].commission && Config.row[0].commission.commission_config instanceof Object) {
                                this.commission_config_obj = Config.row[0].commission.commission_config;
                            }
                        }
                    },
                    getStoreList() {
                        let that = this;
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.levelList = res.data;
                            that.getGoodsList()
                            return false
                        })
                    },
                    inputChange() {
                        this.$forceUpdate()
                    },
                    selfRulesChange(value) {
                        let that = this;
                        that.radioEnd = 0;
                        if (that['commission_rules_bak' + value]) {
                            that.commission_rules = that['commission_rules_bak' + value]
                            that.radioEnd = value;
                        } else {
                            that.commission_rules = {}
                            that.assembleData(value)
                        }
                    },
                    getGoodsList() {
                        let that = this;
                        if (that.isalone == 0) {
                            that.goodsDetail = Config.row[0];
                            if (Config.row[0].commission) {
                                that.commission_rules = JSON.parse(JSON.stringify(Config.row[0].commission.commission_rules))
                                that.status = Config.row[0].commission.status;
                                that.self_rules = Config.row[0].commission.self_rules
                                that.commission_order_status = Config.row[0].commission.commission_order_status;
                                that.assembleData(Config.row[0].commission.self_rules)
                            } else {
                                that.status = 1;
                                that.self_rules = 0
                                that.assembleData(0)
                            }
                        } else {
                            that.status = 1;
                            that.self_rules = 2
                            that.assembleData(2)
                        }
                    },
                    batchSet(commission, type) {
                        if (type == 'define') {
                            if (this.self_rules == 1) {
                                for (key in this.commission_rules) {
                                    for (k in this.commission_rules[key]) {
                                        this.commission_rules[key][k][commission].rate = '';
                                        this.commission_rules[key][k][commission].money = '';
                                    }
                                }
                                if (this.batchList.rate) {
                                    for (key in this.commission_rules) {
                                        for (k in this.commission_rules[key]) {
                                            this.commission_rules[key][k][commission].rate = this.batchList.rate;
                                        }
                                    }
                                } else if (this.batchList.money) {
                                    for (key in this.commission_rules) {
                                        for (k in this.commission_rules[key]) {
                                            this.commission_rules[key][k][commission].money = this.batchList.money;
                                        }
                                    }
                                }
                            } else if (this.self_rules == 2) {
                                for (key in this.commission_rules) {
                                    this.commission_rules[key][commission].rate = '';
                                    this.commission_rules[key][commission].money = '';
                                }
                                if (this.batchList.rate) {
                                    for (key in this.commission_rules) {
                                        this.commission_rules[key][commission].rate = this.batchList.rate;
                                    }
                                } else if (this.batchList.money) {
                                    for (key in this.commission_rules) {
                                        this.commission_rules[key][commission].money = this.batchList.money;
                                    }
                                }
                            }

                        }
                        this.batchShow[commission] = false;
                        this.batchList.rate = ''
                        this.batchList.money = ''
                    },
                    formSubmit() {
                        let that = this;
                        if (that.status == 1) {
                            let commission_rules = JSON.parse(JSON.stringify(that.commission_rules))
                            let isWrite = true;
                            if (that.self_rules == 0) {
                                commission_rules = ''
                            } else if (that.self_rules == 1) {
                                for (key in commission_rules) {
                                    for (k in commission_rules[key]) {
                                        for (g in commission_rules[key][k]) {
                                            if (commission_rules[key][k][g].rate === '' && commission_rules[key][k][g].money === '') {
                                                isWrite = false;
                                            } else {
                                                if (commission_rules[key][k][g].rate !== '') {
                                                    delete commission_rules[key][k][g].money
                                                } else if (commission_rules[key][k][g].money !== '') {
                                                    delete commission_rules[key][k][g].rate
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                for (key in commission_rules) {
                                    for (k in commission_rules[key]) {
                                        if (commission_rules[key][k].rate === '') {
                                            isWrite = false;
                                        }
                                    }
                                }
                            };
                            if (!isWrite) {
                                this.$notify({
                                    title: '警告',
                                    message: '请将数据填写完整',
                                    type: 'warning'
                                });
                                return false;
                            };
                            let commission_config = {}
                            if (that.commission_config == 1) {
                                commission_config = that.commission_config_obj
                            } else {
                                commission_config = 0
                            }
                            // return false;
                            let ajaxUrl = 'shopro/commission/goods/edit'
                            Fast.api.ajax({
                                url: ajaxUrl,
                                loading: true,
                                data: {
                                    ids: that.ids,
                                    status: that.status,
                                    self_rules: that.self_rules,
                                    commission_order_status: that.commission_order_status,
                                    commission_rules: JSON.stringify(commission_rules),
                                    commission_config: JSON.stringify(commission_config)
                                }
                            }, function (ret, res) {
                                Fast.api.close();
                                return false;
                            })
                        } else {
                            Fast.api.ajax({
                                url: 'shopro/commission/goods/commission_status',
                                type: 'POST',
                                data: {
                                    ids: that.ids,
                                    status: that.status
                                },
                                loading: true,
                            }, function (ret, res) {
                                Fast.api.close();
                                return false;
                            })
                        }
                    },
                    assembleData(value) {
                        let that = this;
                        if (value == 0) {
                            that.commission_rules = ""
                        } else if (value == 1) {
                            var rate_money = {
                                1: {
                                    rate: '',
                                    money: ''
                                },
                                2: {
                                    rate: '',
                                    money: ''
                                },
                                3: {
                                    rate: '',
                                    money: ''
                                }
                            }
                            Config.row[0].sku_price.forEach(i => {
                                if (that.commission_rules[i.id]) {
                                    that.levelList.forEach(j => {
                                        if (that.commission_rules[i.id][j.level]) {
                                            for (key in that.commission_rules[i.id][j.level]) {
                                                if (!that.commission_rules[i.id][j.level][key].rate) {
                                                    that.$set(that.commission_rules[i.id][j.level][key], 'rate', '')
                                                } else if (!that.commission_rules[i.id][j.level][key].money) {
                                                    that.$set(that.commission_rules[i.id][j.level][key], 'money', '')
                                                }
                                            }
                                        } else {
                                            that.$set(that.commission_rules[i.id], j.level, JSON.parse(JSON.stringify(rate_money)))
                                        }
                                    })
                                    // 当等级被删除时 对比等级列表 删除多余等级数据
                                    for(var key in that.commission_rules[i.id]){
                                        let k=false
                                        that.levelList.forEach(l => {
                                            if(l.level==key){
                                                k=true
                                            }
                                        })
                                        if(!k){
                                            delete that.commission_rules[i.id][key]
                                        }
                                    }
                                } else {
                                    that.commission_rules[i.id] = {}
                                    that.levelList.forEach(j => {
                                        that.$set(that.commission_rules[i.id], j.level, JSON.parse(JSON.stringify(rate_money)))
                                    })
                                }
                            })
                        } else if (value == 2) {
                            let rate_money2 = {
                                1: {
                                    rate: '',
                                },
                                2: {
                                    rate: '',
                                },
                                3: {
                                    rate: '',
                                }
                            }
                            that.levelList.forEach(i => {
                                if (that.commission_rules[i.level]) {} else {
                                    that.$set(that.commission_rules, i.level, {})
                                    that.$set(that.commission_rules, i.level, JSON.parse(JSON.stringify(rate_money2)))
                                }
                            })
                        }
                        // return false;
                        if (value == 1) {
                            for (sku in that.commission_rules) {
                                let issku = Config.row[0].sku_price.some(s => {
                                    if (s.id == sku) {
                                        return true
                                    } else {
                                        return false
                                    }
                                })
                                if (!issku) {
                                    delete that.commission_rules[sku]
                                }
                                if (issku) {
                                    for (key in that.commission_rules[sku]) {
                                        let isexistence = that.levelList.some(i => {
                                            if (i.level == key) {
                                                return true
                                            } else {
                                                return false
                                            }
                                        })
                                        if (!isexistence) {
                                            delete that.commission_rules[key]
                                        }
                                    }
                                }

                            }
                        }
                        if (value == 2) {
                            for (key in that.commission_rules) {
                                let isexistence = that.levelList.some(i => {
                                    if (i.level == key) {
                                        return true
                                    } else {
                                        return false
                                    }
                                })
                                if (!isexistence) {
                                    delete that.commission_rules[key]
                                }
                            }
                        }
                        that['commission_rules_bak' + value] = JSON.parse(JSON.stringify(that.commission_rules))
                        that.radioEnd = value
                    }
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