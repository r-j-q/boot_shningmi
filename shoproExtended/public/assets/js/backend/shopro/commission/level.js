define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var indexPage = new Vue({
                el: "#indexPage",
                data() {
                    return {
                        indexList: [],
                        isAjax: true,
                    }
                },
                mounted() {
                    this.getindexList();
                },
                methods: {
                    getindexList() {
                        let that = this;
                        that.isAjax = true;
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.indexList = res.data;
                            that.isAjax = false;
                            return false
                        }, function (ret, res) {
                            that.isAjax = false;
                        })
                    },
                    operation(opttype, id) {
                        let that = this;
                        switch (opttype) {
                            case 'create':
                                Fast.api.open('shopro/commission/level/add', '新建分销商等级', {
                                    callback(data) {
                                        that.getindexList();
                                    }
                                })
                                break;
                            case 'edit':
                                Fast.api.open('shopro/commission/level/edit?level=' + id, '编辑分销商等级', {
                                    callback(data) {
                                        that.getindexList();
                                    }
                                })
                                break;
                        }
                    },
                    tableCellClassName({
                        columnIndex
                    }) {
                        if (columnIndex == 0 || columnIndex == 7) {
                            return 'cell-left';
                        }
                        return '';
                    },
                },
            })
        },
        add: function () {
            Controller.detailInit('add');
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.detailInit('edit');
            Controller.api.bindevent();
        },
        detailInit: function (type) {
            var detailPage = new Vue({
                el: "#detailPage",
                data() {
                    return {
                        optType: type,
                        formData: {
                            level: '',
                            name: '',
                            image: '',
                            commission_rules: {
                                commission_1: '0.00',
                                commission_2: '0.00',
                                commission_3: '0.00',
                            },
                            upgrade_type: 0,
                            upgrade_rules: ''
                        },
                        upgradeCondition: [{
                            title: '用户消费金额',
                            key: 'total_consume',
                            value: '',
                        }, {
                            title: '一级用户人数',
                            key: 'child_user_count_1',
                            value: '',
                        }, {
                            title: '二级用户人数',
                            key: 'child_user_count_2',
                            value: '',
                        }, {
                            title: '团队用户人数',
                            key: 'child_user_count',
                            value: '',
                        }, {
                            title: '直推分销订单金额',
                            key: 'order_money',
                            value: '',
                        }, {
                            title: '一级分销订单金额',
                            key: 'child_order_money_1',
                            value: '',
                        }, {
                            title: '二级分销订单金额',
                            key: 'child_order_money_2',
                            value: '',
                        }, {
                            title: '团队分销订单金额',
                            key: 'child_order_money',
                            value: '',
                        }, {
                            title: '直推分销订单数量',
                            key: 'order_count',
                            value: '',
                        }, {
                            title: '一级分销订单数量',
                            key: 'child_order_count_1',
                            value: '',
                        }, {
                            title: '二级分销订单数量',
                            key: 'child_order_count_2',
                            value: '',
                        }, {
                            title: '团队分销订单数量',
                            key: 'child_order_count',
                            value: '',
                        }, {
                            title: '一级分销商人数',
                            key: 'child_agent_count_1',
                            value: '',
                        }, {
                            title: '二级分销商人数',
                            key: 'child_agent_count_2',
                            value: '',
                        }, {
                            title: '团队分销商人数',
                            key: 'child_agent_count',
                            value: '',
                        }, {
                            title: '团队分销商等级统计',
                            key: 'child_agent_level',
                            value: [],
                        }, {
                            title: '一级分销商等级统计',
                            key: 'child_agent_level_1',
                            value: [],
                        }],
                        upgradeConditionBak: [],
                        upgradeConditionInit: [{
                            title: '用户消费金额',
                            key: 'total_consume',
                            value: '',
                        }, {
                            title: '一级用户人数',
                            key: 'child_user_count_1',
                            value: '',
                        }, {
                            title: '二级用户人数',
                            key: 'child_user_count_2',
                            value: '',
                        }, {
                            title: '团队用户人数',
                            key: 'child_user_count',
                            value: '',
                        }, {
                            title: '直推分销订单金额',
                            key: 'order_money',
                            value: '',
                        }, {
                            title: '一级分销订单金额',
                            key: 'child_order_money_1',
                            value: '',
                        }, {
                            title: '二级分销订单金额',
                            key: 'child_order_money_2',
                            value: '',
                        }, {
                            title: '团队分销订单金额',
                            key: 'child_order_money',
                            value: '',
                        }, {
                            title: '直推分销订单数量',
                            key: 'order_count',
                            value: '',
                        }, {
                            title: '一级分销订单数量',
                            key: 'child_order_count_1',
                            value: '',
                        }, {
                            title: '二级分销订单数量',
                            key: 'child_order_count_2',
                            value: '',
                        }, {
                            title: '团队分销订单数量',
                            key: 'child_order_count',
                            value: '',
                        }, {
                            title: '一级分销商人数',
                            key: 'child_agent_count_1',
                            value: '',
                        }, {
                            title: '二级分销商人数',
                            key: 'child_agent_count_2',
                            value: '',
                        }, {
                            title: '团队分销商人数',
                            key: 'child_agent_count',
                            value: '',
                        }, {
                            title: '团队分销商等级统计',
                            key: 'child_agent_level',
                            value: [],
                        }, {
                            title: '一级分销商等级统计',
                            key: 'child_agent_level_1',
                            value: [],
                        }],
                        goods_ids_list: null,
                        levelList: [{
                            title: '一级',
                            value: '1',
                        }, {
                            title: '二级',
                            value: '2',
                        }, {
                            title: '三级',
                            value: '3',
                        }, {
                            title: '四级',
                            value: '4',
                        }, {
                            title: '五级',
                            value: '5',
                        }, {
                            title: '六级',
                            value: '6',
                        }, {
                            title: '七级',
                            value: '7',
                        }, {
                            title: '八级',
                            value: '8',
                        }, {
                            title: '九级',
                            value: '9',
                        }, {
                            title: '十级',
                            value: '10',
                        }],
                        levelOptions: [],
                        selectLevelOptionsLength: 0,
                        moveLevel: '',
                        editId: null,
                        deleteDialog: false,
                        existLevel: [],
                    }
                },
                mounted() {
                    this.initData();
                },
                methods: {
                    //init 数据
                    initData() {
                        let that = this;
                        that.existLevel = Config.existLevel;
                        that.levelOptions = []
                        Fast.api.ajax({
                            url: 'shopro/commission/level/index',
                            loading: false,
                            type: 'GET',
                        }, function (ret, res) {
                            that.levelOptions = res.data;
                            if (that.optType == 'edit') {
                                that.formData = Config.row;
                                that.editId = Config.row.level;

                                //判断下面的等级选择
                                let selectLevel = [];
                                that.levelOptions.forEach((item, index) => {
                                    if (item.level < that.formData.level) {
                                        selectLevel.push(item)
                                    }
                                })
                                that.selectLevelOptionsLength = selectLevel.length;

                                that.existLevel.splice(that.existLevel.indexOf(Config.row.level), 1)

                                that.formData.upgrade_rules = JSON.parse(that.formData.upgrade_rules)
                                for (key in that.formData.upgrade_rules) {
                                    that.upgradeCondition.forEach(i => {
                                        if (key == i.key) {
                                            i.value = that.formData.upgrade_rules[key];
                                            i.selected = true;
                                        }
                                    })
                                }
                                that.upgradeConditionBak = JSON.parse(JSON.stringify(that.upgradeCondition))
                            }
                            return false
                        })
                    },
                    childAgentCountAdd(index) {
                        if (this.formData.level) {
                            this.upgradeCondition[index].value.push({
                                level: '',
                                count: ''
                            })
                        } else {
                            this.$notify({
                                title: '警告',
                                message: '请先选择等级',
                                type: 'warning'
                            });
                        }
                    },
                    childAgentCountDelete(zindex, index) {
                        this.upgradeCondition[zindex].value.splice(index, 1)
                    },
                    //选择等级徽章
                    bgimageAdd() {
                        let that = this;
                        Fast.api.open("general/attachment/select?multiple=false", "选择", {
                            callback: function (data) {
                                that.formData.image = data.url;
                                that.$forceUpdate();
                            }
                        });
                        return false;
                    },
                    //选择条件
                    selectCondition(index) {
                        this.upgradeCondition[index].selected = !this.upgradeCondition[index].selected;
                        if (!this.upgradeCondition[index].selected) {
                            this.upgradeCondition[index].value = ""
                        }
                        this.$forceUpdate();
                    },
                    //条件删除
                    conditionDelete(index) {
                        this.upgradeCondition[index].selected = false;
                        this.upgradeCondition[index].value = ""
                        this.$forceUpdate();
                    },
                    selectLevel(index) {
                        //赋值level
                        this.formData.level = this.levelList[index].value;

                        //控制添加按钮是否显示
                        let selectLevel = [];
                        this.levelOptions.forEach((item, index) => {
                            if (item.level < this.formData.level && item.level != this.editId) {
                                selectLevel.push(item)
                            }
                        })
                        this.selectLevelOptionsLength = selectLevel.length;

                        //清空条件
                        this.upgradeCondition = JSON.parse(JSON.stringify(this.upgradeConditionInit));

                        if (this.editId == this.formData.level) {
                            this.upgradeCondition = JSON.parse(JSON.stringify(this.upgradeConditionBak));
                        }
                    },
                    addGoods(index) {
                        let that = this;
                        let multiple = false;
                        let type = '';
                        let ids = that.upgradeCondition[index].value ? that.upgradeCondition[index].value : '';

                        let params = {
                            multiple: multiple,
                            type: type,
                            ids: ids
                        }
                        shoproSelectGoods(params, "选择商品").then(data => {
                            that.upgradeCondition[index].value = data.data.id;
                            that.goods_ids_list = data.data;
                            that.$forceUpdate();
                        }).catch(error => {
                        });
                        return false;
                    },
                    formDelete() {
                        this.deleteDialog = true
                    },
                    deleteDialogClose(type) {
                        this.deleteDialog = false;
                        if (type == 'define') {
                            Fast.api.ajax({
                                url: ajaxUrl,
                                loading: true,
                                data: formSubmit
                            }, function (ret, res) {})
                        }
                    },
                    formSubmit(formName) {
                        let that = this;
                        if (that.formData.level == "") {
                            this.$notify({
                                title: '警告',
                                message: '等级权重未填写',
                                type: 'warning'
                            });
                            return false;
                        }
                        if (that.formData.name == "") {
                            this.$notify({
                                title: '警告',
                                message: '等级名称未填写',
                                type: 'warning'
                            });
                            return false;
                        }
                        if (Number(that.formData.commission_rules.commission_1) + Number(that.formData.commission_rules.commission_2) + Number(that.formData.commission_rules.commission_3) > 100) {
                            this.$notify({
                                title: '警告',
                                message: '佣金比例之和不可超过100',
                                type: 'warning'
                            });
                            return false;
                        }
                        if (Number(that.formData.commission_rules.commission_1) < 0 || Number(that.formData.commission_rules.commission_2) < 0 || Number(that.formData.commission_rules.commission_3) < 0) {
                            this.$notify({
                                title: '警告',
                                message: '佣金比例不可小于0',
                                type: 'warning'
                            });
                            return false;
                        }
                        let upgrade_rules = {}
                        let nowrite = true
                        let condition = 0;
                        that.upgradeCondition.forEach(k => {
                            if (k.selected) {
                                upgrade_rules[k.key] = k.value
                                if (k.value === "") {
                                    nowrite = false;
                                };
                                if (k.key == 'agent_level') {
                                    k.value.length > 0
                                    if (k.value.length == 0) {
                                        nowrite = false;
                                    } else {
                                        k.value.forEach(i => {
                                            if (i.level == "" || i.count == "") {
                                                nowrite = false;
                                            }
                                        })
                                    }
                                }
                                condition++
                            }
                        })

                        that.formData.upgrade_rules = JSON.stringify(upgrade_rules)
                        if (that.formData.level != 1) {
                            if (condition == 0) {
                                this.$notify({
                                    title: '警告',
                                    message: '至少选择一个升级条件',
                                    type: 'warning'
                                });
                                return false;
                            }
                            if (!nowrite) {
                                this.$notify({
                                    title: '警告',
                                    message: '升级条件必须填写完整',
                                    type: 'warning'
                                });
                                return false;
                            }
                        }
                        var formSubmit = JSON.parse(JSON.stringify(that.formData));
                        for (key in formSubmit.commission_rules) {
                            formSubmit.commission_rules[key] = Number(formSubmit.commission_rules[key]).toFixed(2)
                        }
                        formSubmit.commission_rules = JSON.stringify(formSubmit.commission_rules)
                        if (this.optType == 'edit') {
                            formSubmit.new_level = formSubmit.level;
                            delete formSubmit.level;
                        }
                        // return false;
                        let ajaxUrl = "shopro/commission/level/add"
                        if (this.optType == 'edit') {
                            ajaxUrl = 'shopro/commission/level/edit?level=' + that.editId
                        }
                        Fast.api.ajax({
                            url: ajaxUrl,
                            loading: true,
                            data: formSubmit
                        }, function (ret, res) {
                            Fast.api.close()
                            return false;
                        })
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