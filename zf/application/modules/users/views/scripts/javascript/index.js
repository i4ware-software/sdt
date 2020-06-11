<?php header('Content-type: text/javascript'); ?>

/*!
 * Ext JS Library 3.0+
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.RowEditor
 * @extends Ext.Panel 
 * Plugin (ptype = 'roweditor') that adds the ability to rapidly edit full rows in a grid.
 * A validation mode may be enabled which uses AnchorTips to notify the user of all
 * validation errors at once.
 * 
 * @ptype roweditor
 */
Ext.ux.grid.RowEditor = Ext.extend(Ext.Panel, {
    floating: true,
    shadow: false,
    layout: 'hbox',
    cls: 'x-small-editor',
    buttonAlign: 'center',
    baseCls: 'x-row-editor',
    elements: 'header,footer,body',
    frameWidth: 5,
    buttonPad: 3,
    clicksToEdit: 'auto',
    monitorValid: true,
    focusDelay: 250,
    errorSummary: true,

    defaults: {
        normalWidth: true
    },

    initComponent: function(){
        Ext.ux.grid.RowEditor.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event beforeedit
             * Fired before the row editor is activated.
             * If the listener returns <tt>false</tt> the editor will not be activated.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'beforeedit',
            /**
             * @event validateedit
             * Fired after a row is edited and passes validation.
             * If the listener returns <tt>false</tt> changes to the record will not be set.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Object} changes Object with changes made to the record.
             * @param {Ext.data.Record} r The Record that was edited.
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'validateedit',
            /**
             * @event afteredit
             * Fired after a row is edited and passes validation.  This event is fired
             * after the store's update event is fired with this edit.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Object} changes Object with changes made to the record.
             * @param {Ext.data.Record} r The Record that was edited.
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'afteredit'
        );
    },

    init: function(grid){
        this.grid = grid;
        this.ownerCt = grid;
        if(this.clicksToEdit === 2){
            grid.on('rowdblclick', this.onRowDblClick, this);
        }else{
            grid.on('rowclick', this.onRowClick, this);
            if(Ext.isIE){
                grid.on('rowdblclick', this.onRowDblClick, this);
            }
        }

        // stopEditing without saving when a record is removed from Store.
        grid.getStore().on('remove', function() {
            this.stopEditing(false);
        },this);

        grid.on({
            scope: this,
            keydown: this.onGridKey,
            columnresize: this.verifyLayout,
            columnmove: this.refreshFields,
            reconfigure: this.refreshFields,
	    destroy : this.destroy,
            bodyscroll: {
                buffer: 250,
                fn: this.positionButtons
            }
        });
        grid.getColumnModel().on('hiddenchange', this.verifyLayout, this, {delay:1});
        grid.getView().on('refresh', this.stopEditing.createDelegate(this, []));
    },

    refreshFields: function(){
        this.initFields();
        this.verifyLayout();
    },

    isDirty: function(){
        var dirty;
        this.items.each(function(f){
            if(String(this.values[f.id]) !== String(f.getValue())){
                dirty = true;
                return false;
            }
        }, this);
        return dirty;
    },

    startEditing: function(rowIndex, doFocus){
        if(this.editing && this.isDirty()){
            this.showTooltip('You need to commit or cancel your changes');
            return;
        }
        if(Ext.isObject(rowIndex)){
            rowIndex = this.grid.getStore().indexOf(rowIndex);
        }
        if(this.fireEvent('beforeedit', this, rowIndex) !== false){
            this.editing = true;
            var g = this.grid, view = g.getView();
            var row = view.getRow(rowIndex);
            var record = g.store.getAt(rowIndex);
            this.record = record;
            this.rowIndex = rowIndex;
            this.values = {};
            if(!this.rendered){
                this.render(view.getEditorParent());
            }
            var w = Ext.fly(row).getWidth();
            this.setSize(w);
            if(!this.initialized){
                this.initFields();
            }
            var cm = g.getColumnModel(), fields = this.items.items, f, val;
            for(var i = 0, len = cm.getColumnCount(); i < len; i++){
                val = this.preEditValue(record, cm.getDataIndex(i));
                f = fields[i];
                f.setValue(val);
                this.values[f.id] = Ext.isEmpty(val) ? '' : val;
            }
            this.verifyLayout(true);
            if(!this.isVisible()){
                this.setPagePosition(Ext.fly(row).getXY());
            } else{
                this.el.setXY(Ext.fly(row).getXY(), {duration:0.15});
            }
            if(!this.isVisible()){
                this.show().doLayout();
            }
            if(doFocus !== false){
                this.doFocus.defer(this.focusDelay, this);
            }
        }
    },

    stopEditing : function(saveChanges){
        this.editing = false;
        if(!this.isVisible()){
            return;
        }
        if(saveChanges === false || !this.isValid()){
            this.hide();
            return;
        }
        var changes = {}, r = this.record, hasChange = false;
        var cm = this.grid.colModel, fields = this.items.items;
        for(var i = 0, len = cm.getColumnCount(); i < len; i++){
            if(!cm.isHidden(i)){
                var dindex = cm.getDataIndex(i);
                if(!Ext.isEmpty(dindex)){
                    var oldValue = r.data[dindex];
                    var value = this.postEditValue(fields[i].getValue(), oldValue, r, dindex);
                    if(String(oldValue) !== String(value)){
                        changes[dindex] = value;
                        hasChange = true;
                    }
                }
            }
        }
        if(hasChange && this.fireEvent('validateedit', this, changes, r, this.rowIndex) !== false){
            r.beginEdit();
            for(var k in changes){
                if(changes.hasOwnProperty(k)){
                    r.set(k, changes[k]);
                }
            }
            r.endEdit();
            this.fireEvent('afteredit', this, changes, r, this.rowIndex);
        }
        this.hide();
    },

    verifyLayout: function(force){
        if(this.el && (this.isVisible() || force === true)){
            var row = this.grid.getView().getRow(this.rowIndex);
            this.setSize(Ext.fly(row).getWidth(), Ext.isIE ? Ext.fly(row).getHeight() + 9 : undefined);
            var cm = this.grid.colModel, fields = this.items.items;
            for(var i = 0, len = cm.getColumnCount(); i < len; i++){
                if(!cm.isHidden(i)){
                    var adjust = 0;
                    if(i === (len - 1)){
                        adjust += 3; // outer padding
                    } else{
                        adjust += 1;
                    }
                    fields[i].show();
                    fields[i].setWidth(cm.getColumnWidth(i) - adjust);
                } else{
                    fields[i].hide();
                }
            }
            this.doLayout();
            this.positionButtons();
        }
    },

    slideHide : function(){
        this.hide();
    },

    initFields: function(){
        var cm = this.grid.getColumnModel(), pm = Ext.layout.ContainerLayout.prototype.parseMargins;
        this.removeAll(false);
        for(var i = 0, len = cm.getColumnCount(); i < len; i++){
            var c = cm.getColumnAt(i);
            var ed = c.getEditor();
            if(!ed){
                ed = c.displayEditor || new Ext.form.DisplayField();
            }
            if(i == 0){
                ed.margins = pm('0 1 2 1');
            } else if(i == len - 1){
                ed.margins = pm('0 0 2 1');
            } else{
                ed.margins = pm('0 1 2');
            }
            ed.setWidth(cm.getColumnWidth(i));
            ed.column = c;
            if(ed.ownerCt !== this){
                ed.on('focus', this.ensureVisible, this);
                ed.on('specialkey', this.onKey, this);
            }
            this.insert(i, ed);
        }
        this.initialized = true;
    },

    onKey: function(f, e){
        if(e.getKey() === e.ENTER){
            this.stopEditing(true);
            e.stopPropagation();
        }
    },

    onGridKey: function(e){
        if(e.getKey() === e.ENTER && !this.isVisible()){
            var r = this.grid.getSelectionModel().getSelected();
            if(r){
                var index = this.grid.store.indexOf(r);
                this.startEditing(index);
                e.stopPropagation();
            }
        }
    },

    ensureVisible: function(editor){
        if(this.isVisible()){
             this.grid.getView().ensureVisible(this.rowIndex, this.grid.colModel.getIndexById(editor.column.id), true);
        }
    },

    onRowClick: function(g, rowIndex, e){
        if(this.clicksToEdit == 'auto'){
            var li = this.lastClickIndex;
            this.lastClickIndex = rowIndex;
            if(li != rowIndex && !this.isVisible()){
                return;
            }
        }
        this.startEditing(rowIndex, false);
        this.doFocus.defer(this.focusDelay, this, [e.getPoint()]);
    },

    onRowDblClick: function(g, rowIndex, e){
        this.startEditing(rowIndex, false);
        this.doFocus.defer(this.focusDelay, this, [e.getPoint()]);
    },

    onRender: function(){
        Ext.ux.grid.RowEditor.superclass.onRender.apply(this, arguments);
        this.el.swallowEvent(['keydown', 'keyup', 'keypress']);
        this.btns = new Ext.Panel({
            baseCls: 'x-plain',
            cls: 'x-btns',
            elements:'body',
            layout: 'table',
            width: (this.minButtonWidth * 2) + (this.frameWidth * 2) + (this.buttonPad * 4), // width must be specified for IE
            items: [{
                ref: 'saveBtn',
                itemId: 'saveBtn',
                xtype: 'button',
                text: this.saveText || 'Save',
                width: this.minButtonWidth,
                handler: this.stopEditing.createDelegate(this, [true])
            }, {
                xtype: 'button',
                text: this.cancelText || 'Cancel',
                width: this.minButtonWidth,
                handler: this.stopEditing.createDelegate(this, [false])
            }]
        });
        this.btns.render(this.bwrap);
    },

    afterRender: function(){
        Ext.ux.grid.RowEditor.superclass.afterRender.apply(this, arguments);
        this.positionButtons();
        if(this.monitorValid){
            this.startMonitoring();
        }
    },

    onShow: function(){
        if(this.monitorValid){
            this.startMonitoring();
        }
        Ext.ux.grid.RowEditor.superclass.onShow.apply(this, arguments);
    },

    onHide: function(){
        Ext.ux.grid.RowEditor.superclass.onHide.apply(this, arguments);
        this.stopMonitoring();
        this.grid.getView().focusRow(this.rowIndex);
    },

    positionButtons: function(){
        if(this.btns){
            var h = this.el.dom.clientHeight;
            var view = this.grid.getView();
            var scroll = view.scroller.dom.scrollLeft;
            var width =  view.mainBody.getWidth();
            var bw = this.btns.getWidth();
            this.btns.el.shift({left: (width/2)-(bw/2)+scroll, top: h - 2, stopFx: true, duration:0.2});
        }
    },

    // private
    preEditValue : function(r, field){
        var value = r.data[field];
        return this.autoEncode && typeof value === 'string' ? Ext.util.Format.htmlDecode(value) : value;
    },

    // private
    postEditValue : function(value, originalValue, r, field){
        return this.autoEncode && typeof value == 'string' ? Ext.util.Format.htmlEncode(value) : value;
    },

    doFocus: function(pt){
        if(this.isVisible()){
            var index = 0;
            if(pt){
                index = this.getTargetColumnIndex(pt);
            }
            var cm = this.grid.getColumnModel();
            for(var i = index||0, len = cm.getColumnCount(); i < len; i++){
                var c = cm.getColumnAt(i);
                if(!c.hidden && c.getEditor()){
                    c.getEditor().focus();
                    break;
                }
            }
        }
    },

    getTargetColumnIndex: function(pt){
        var grid = this.grid, v = grid.view;
        var x = pt.left;
        var cms = grid.colModel.config;
        var i = 0, match = false;
        for(var len = cms.length, c; c = cms[i]; i++){
            if(!c.hidden){
                if(Ext.fly(v.getHeaderCell(i)).getRegion().right >= x){
                    match = i;
                    break;
                }
            }
        }
        return match;
    },

    startMonitoring : function(){
        if(!this.bound && this.monitorValid){
            this.bound = true;
            Ext.TaskMgr.start({
                run : this.bindHandler,
                interval : this.monitorPoll || 200,
                scope: this
            });
        }
    },

    stopMonitoring : function(){
        this.bound = false;
        if(this.tooltip){
            this.tooltip.hide();
        }
    },

    isValid: function(){
        var valid = true;
        this.items.each(function(f){
            if(!f.isValid(true)){
                valid = false;
                return false;
            }
        });
        return valid;
    },

    // private
    bindHandler : function(){
        if(!this.bound){
            return false; // stops binding
        }
        var valid = this.isValid();
        if(!valid && this.errorSummary){
            this.showTooltip(this.getErrorText().join(''));
        }
        this.btns.saveBtn.setDisabled(!valid);
        this.fireEvent('validation', this, valid);
    },

    showTooltip: function(msg){
        var t = this.tooltip;
        if(!t){
            t = this.tooltip = new Ext.ToolTip({
                maxWidth: 600,
                cls: 'errorTip',
                width: 300,
                title: 'Errors',
                autoHide: false,
                anchor: 'left',
                anchorToTarget: true,
                mouseOffset: [40,0]
            });
        }
        var v = this.grid.getView(),
            top = parseInt(this.el.dom.style.top, 10),
            scroll = v.scroller.dom.scrollTop,
            h = this.el.getHeight();
                
        if(top + h >= scroll){
            t.initTarget(this.items.last().getEl());
            if(!t.rendered){
                t.show();
                t.hide();
            }
            t.body.update(msg);
            t.doAutoWidth();
            t.show();
        }else if(t.rendered){
            t.hide();
        }
    },

    getErrorText: function(){
        var data = ['<ul>'];
        this.items.each(function(f){
            if(!f.isValid(true)){
                data.push('<li>', f.activeError, '</li>');
            }
        });
        data.push('</ul>');
        return data;
    }
});
Ext.preg('roweditor', Ext.ux.grid.RowEditor);

Ext.override(Ext.form.Field, {
    markInvalid : function(msg){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        msg = msg || this.invalidText;

        var mt = this.getMessageHandler();
        if(mt){
            mt.mark(this, msg);
        }else if(this.msgTarget){
            this.el.addClass(this.invalidClass);
            var t = Ext.getDom(this.msgTarget);
            if(t){
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
            }
        }
        this.activeError = msg;
        this.fireEvent('invalid', this, msg);
    }
});

Ext.override(Ext.ToolTip, {
    doAutoWidth : function(){
        var bw = this.body.getTextWidth();
        if(this.title){
            bw = Math.max(bw, this.header.child('span').getTextWidth(this.title));
        }
        bw += this.getFrameWidth() + (this.closable ? 20 : 0) + this.body.getPadding("lr") + 20;
        this.setWidth(bw.constrain(this.minWidth, this.maxWidth));

        // IE7 repaint bug on initial show
        if(Ext.isIE7 && !this.repainted){
            this.el.repaint();
            this.repainted = true;
        }
    }
});

Ext.onReady(function(){
	
	Ext.QuickTips.init();

var xg = Ext.grid; 
var fm = Ext.form;
var newuserwin;
var edituserwin;
var changepasswordwin;

var newuserform = new Ext.FormPanel( {
    id : Ext.id(),
    labelWidth : 120,
    url : "/zf/public/users/json/createnewuser",
    frame : false,
    bodyStyle : 'padding:5px 5px 0 0',
    width : 460,
    border : false,
    defaults : {
        width : 300
    },
    defaultType : 'textfield',
    items : [ {
        fieldLabel : '<?= $this->firstname ?>',
        name : 'firstname',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->lastname ?>',
        name : 'lastname',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->username ?>',
        name : 'username',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->email ?>',
        name : 'email',
		vtype:'email',
        allowBlank : false,
		emptyText: 'etunimi.sukunimi@yritys.fi'
    },{
        fieldLabel : '<?= $this->company ?>',
        name : 'company',
        allowBlank : false,
		emptyText: 'Oy Yritys Ab'
    },
    {
        fieldLabel: '<?= $this->password ?>',
        name: 'password',
        inputType: 'password',
        'id': 'password',
        width: 140,
        allowBlank: false
    },
    {
        fieldLabel: '<?= $this->verify ?>',
        name: 'verify',
        inputType: 'password',
        width: 140,
        'id': 'verify',
        allowBlank: false
    },{
        fieldLabel : '<?= $this->userrole ?>',
        name : 'userrole',
		hiddenName: 'userrole',
        allowBlank : false,
		xtype:'combo',
		value:'3',
		store: new Ext.data.SimpleStore({
                                fields: ['id','value'],
                                data:[
								["3","Employee"],
								["6","Admin"]<?php
							            if ($this->addsuperadmin) {
							                ?>,
								["7","Superadmin"]<?php } ?>
								]
                            }),
                            displayField: 'value',
                            valueField: 'id',
                            mode: 'local',
                            triggerAction: 'all'
								
    }
      ]
});

var myRec = new Ext.data.Record.create([{
    name: 'gen'
}]);

var myGen = new Ext.data.JsonReader({
    successProperty: 'success',
    totalProperty: 'results',
    root: 'myaccount',
    id: 'generate'
},
myRec);

var myaccount_password_auto = new Ext.FormPanel({
    frame: false,
    border: false,
    labelAlign: 'left',
    labelWidth: 85,
    waitMsgTarget: true,
    reader: myGen,
    items: [
    new Ext.form.FieldSet({
        title: '<?= $this->generatepassword ?>',
        autoHeight: true,
        defaultType: 'textfield',
        items: [{
            fieldLabel: '<?= $this->password ?>',
            name: 'gen',
            width: 140,
            'id': 'generate'
        }]
    })]
});

// simple button add
myaccount_password_auto.addButton('<?= $this->generate ?>', function () {
    myaccount_password_auto.getForm().load({
        url: '/zf/public/json/gen',
        waitMsg: '<?= $this->loading ?>',
        failure: function (form, action) {
            //var json = Ext.util.JSON.decode(response.responseText);
            Ext.MessageBox.alert('<?= $this->warning ?>', 'Oops...');
        }
    });
});

/*myaccount_password_auto.addButton('<?= $this->copypaste ?>', function () {
    var pwd = Ext.getCmp('password');
    var ver = Ext.getCmp('verify');
    var gen = Ext.getCmp('generate');
    var cc = gen.getValue();
    pwd.setValue(cc);
    ver.setValue(cc);
});*/

function createNU() {
	grid.selModel.clearSelections();
    Ext.getCmp('edit-user').disable();
    Ext.getCmp('change-password').disable();
    Ext.getCmp('delete-user').disable();
    // create the window on the first click and reuse on subsequent
    // clicks
    if (!newuserwin) {
        newuserwin = new Ext.Window(
                {
                    // applyTo:'hello-win',
                    id : 'create-newuser',
                    //layout : 'fit',
                    width : 480,
                    height : 450,
                    closeAction : 'hide',
                    modal:true,
                    closable:false,
                    plain : true,
                    title : '<?= $this->new_user ?>',
                    items : [newuserform,myaccount_password_auto],
                    buttons : [
                            {
                                text : '<?= $this->submit ?>',
                                handler : function() {
                                    var url = "/zf/public/users/json/createnewuser";
                                    if(newuserform.getForm().isValid()){
									newuserwin.hide();
                                    newuserform
                                            .getForm()
                                            .submit(
                                                    {
                                                        waitMsg : '<?= $this->sending ?>',
                                                        url : url,
                                                        success : function(
                                                                form, action) {
                                                            newuserform
                                                                    .getForm()
                                                                    .reset();
                                                            myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                            .alert(
                                                                    '<?= $this->success ?>',
                                                                    json.msg);
                                                            store.reload();
                                                        },
                                                        failure : function(
                                                                form, action) {
															newuserform
                                                                    .getForm()
                                                                    .reset();
															myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                                    .alert(
                                                                            '<?= $this->error ?>',
                                                                            json.msg);
                                                            }
                                                    });
													}
                                }
                            }, {
                                text : '<?= $this->close ?>',
                                handler : function() {
                                    newuserform.getForm().reset();
                                    myaccount_password_auto.getForm().reset();
                                    //store.reload();
                                    newuserwin.hide();
                                }
                            } ]
                });
				
    }
    newuserwin.show(this);
}

var edituserform = new Ext.FormPanel( {
    id : Ext.id(),
    labelWidth : 120,
    url : "/zf/public/users/json/edituser",
    frame : false,
    bodyStyle : 'padding:5px 5px 0 0',
    width : 460,
    border : false,
    defaults : {
        width : 300
    },
    defaultType : 'textfield',
    items : [ {
        fieldLabel : 'ID',
        name : 'user_id',
        id: 'user_id',
        allowBlank : false,
        hidden:true
    },{
        fieldLabel : '<?= $this->firstname ?>',
        name : 'firstname',
        id: 'firstname',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->lastname ?>',
        name : 'lastname',
        id: 'lastname',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->email ?>',
        name : 'email',
		vtype:'email',
		id:'email',
        allowBlank : false
    },{
        fieldLabel : '<?= $this->company ?>',
        name : 'company',
        id: 'company',
        allowBlank : false
    },
    {
        fieldLabel : '<?= $this->userrole ?>',
        name : 'userrole',
		hiddenName: 'userrole',
		id:'userrole',
        allowBlank : false,
		xtype:'combo',
		//value:'2',
		store: new Ext.data.SimpleStore({
                                fields: ['id','value'],
                                data:[
								["3","Employee"],
								["6","Admin"]<?php
							            if ($this->addsuperadmin) {
							                ?>,
								["7","Superadmin"]<?php } ?>
								]
                            }),
                            displayField: 'value',
                            valueField: 'id',
                            mode: 'local',
                            triggerAction: 'all'
								
    },
    {
        fieldLabel : '<?= $this->access ?>',
        name : 'active',
		hiddenName: 'active',
		id:'active',
        allowBlank : false,
		xtype:'combo',
		//value:'2',
		store: new Ext.data.SimpleStore({
                                fields: ['id','value'],
                                data:[
								["false","<?= $this->deny ?>"],
								["true","<?= $this->allow ?>"]
								]
                            }),
                            displayField: 'value',
                            valueField: 'id',
                            mode: 'local',
                            triggerAction: 'all'
								
    }
      ]
});

function editNU() {

    // create the window on the first click and reuse on subsequent
    // clicks
    if (!edituserwin) {
        edituserwin = new Ext.Window(
                {
                    // applyTo:'hello-win',
                    id : 'edit-user-win',
                    //layout : 'fit',
                    modal:true,
                    width : 480,
                    height : 240,
                    closable:false,
                    closeAction : 'hide',
                    plain : true,
                    title : '<?= $this->edituser ?>',
                    items : [edituserform],
                    buttons : [
                            {
                                text : '<?= $this->submit ?>',
                                handler : function() {
                                    var url = "/zf/public/users/json/edituser";
                                    if(edituserform.getForm().isValid()){
									edituserwin.hide();
                                    edituserform
                                            .getForm()
                                            .submit(
                                                    {
                                                        waitMsg : '<?= $this->sending ?>',
                                                        url : url,
                                                        success : function(
                                                                form, action) {
                                                            edituserform
                                                                    .getForm()
                                                                    .reset();
                                                            //myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                            .alert(
                                                                    '<?= $this->success ?>',
                                                                    json.msg);
                                                            store.reload();
                                                            grid.selModel.clearSelections();
                                                            Ext.getCmp('edit-user').disable();
                                						    Ext.getCmp('change-password').disable();
															Ext.getCmp('delete-user').disable();
                                                        },
                                                        failure : function(
                                                                form, action) {
															edituserform
                                                                    .getForm()
                                                                    .reset();
															grid.selModel.clearSelections();
								                            Ext.getCmp('edit-user').disable();
														    Ext.getCmp('change-password').disable();
															//myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                                    .alert(
                                                                            '<?= $this->error ?>',
                                                                            json.msg);
                                                            }
                                                    });
													}
                                }
                            }, {
                                text : '<?= $this->close ?>',
                                handler : function() {
                                    edituserform.getForm().reset();
                                    //myaccount_password_auto.getForm().reset();
                                    //store.reload();
                                    grid.selModel.clearSelections();
                                    Ext.getCmp('edit-user').disable();
        						    Ext.getCmp('change-password').disable();
                                    edituserwin.hide();
                                }
                            } ]
                });
				
    }
    edituserwin.show(this);
}

var changepasswordform = new Ext.FormPanel( {
    id : Ext.id(),
    labelWidth : 120,
    url : "/zf/public/users/json/changepassword",
    frame : false,
    bodyStyle : 'padding:5px 5px 0 0',
    width : 460,
    border : false,
    defaults : {
        width : 300
    },
    defaultType : 'textfield',
    items : [ {
        fieldLabel : 'ID',
        name : 'user_id',
        id: 'user_id_changepassword',
        allowBlank : false,
        hidden:true
    },{
        fieldLabel : '<?= $this->password ?>',
        name : 'password',
        inputType: 'password',
        allowBlank : false
    }]
});

function changepassworNU() {

    // create the window on the first click and reuse on subsequent
    // clicks
    if (!changepasswordwin) {
    	changepasswordwin = new Ext.Window(
                {
                    // applyTo:'hello-win',
                    id : 'change-password-win',
                    //layout : 'fit',
                    modal:true,
                    width : 480,
                    height : 100,
                    closable:false,
                    closeAction : 'hide',
                    plain : true,
                    title : '<?= $this->change_password ?>',
                    items : [changepasswordform],
                    buttons : [
                            {
                                text : '<?= $this->submit ?>',
                                handler : function() {
                                    var url = "/zf/public/users/json/changepassword";
                                    if(changepasswordform.getForm().isValid()){
                                    changepasswordwin.hide();
									changepasswordform
                                            .getForm()
                                            .submit(
                                                    {
                                                        waitMsg : '<?= $this->sending ?>',
                                                        url : url,
                                                        success : function(
                                                                form, action) {
                                                    	changepasswordform
                                                                    .getForm()
                                                                    .reset();
                                                            //myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                            .alert(
                                                                    '<?= $this->success ?>',
                                                                    json.msg);
                                                            store.reload();
                                                            grid.selModel.clearSelections();
                                                            Ext.getCmp('edit-user').disable();
                                						    Ext.getCmp('change-password').disable();
															Ext.getCmp('delete-user').disable();
                                                        },
                                                        failure : function(
                                                                form, action) {
                                                        	changepasswordform
                                                                    .getForm()
                                                                    .reset();
															grid.selModel.clearSelections();
								                            Ext.getCmp('edit-user').disable();
														    Ext.getCmp('change-password').disable();
															//myaccount_password_auto.getForm().reset();
															var json = Ext.util.JSON.decode(action.response.responseText); 
                                                            Ext.MessageBox
                                                                    .alert(
                                                                            '<?= $this->error ?>',
                                                                            json.msg);
                                                            }
                                                    });
													}
                                }
                            }, {
                                text : '<?= $this->close ?>',
                                handler : function() {
                            	    changepasswordform.getForm().reset();
                                    //myaccount_password_auto.getForm().reset();
                                    //store.reload();
                                    grid.selModel.clearSelections();
                                    Ext.getCmp('edit-user').disable();
        						    Ext.getCmp('change-password').disable();
        						    changepasswordwin.hide();
                                }
                            } ]
                });
				
    }
    changepasswordwin.show(this);
}
		
var store = new Ext.data.GroupingStore({
            groupField: 'active',
			remoteSort: true,
			sortInfo: {field: 'user_id',direction: 'DESC'},
			url: '/zf/public/users/json/index',
				   reader: new Ext.data.JsonReader({root: 'roles',
						totalProperty: 'totalCount',
						id: 'user_id'}, 						
						[{name: 'user_id', type: 'int'},
						{name: 'username', type: 'string'},
						{name: 'fullname', type: 'string'},
						{name: 'email', type: 'string'},
						{name: 'active', type: 'string'},
						{name: 'company', type: 'string'},
						{name: 'firstname', type: 'string'},
						{name: 'lastname', type: 'string'},
						{name: 'role', type: 'string'},
						{name: 'role_id', type: 'int'}]),
					baseParams: {"limit":100}});

store.load({params: {"start":0,"limit":100,"query":""}});

/*var editor = new Ext.ux.grid.RowEditor({
        saveText: '<?= $this->update ?>',
		cancelText: '<?= $this->cancel ?>'
    });**/

function handleDelete() {
	
	Ext.Msg.show({
		   title:'<?= $this->areyousuretitle ?>',
		   msg: '<?= $this->areyousuretext ?>',
		   buttons: Ext.Msg.YESNO,
		   fn: function(btn) {
		                 if (btn=='yes') {

	var selectedRows = grid.selModel.selections.items;
	var selectedKeys = grid.selModel.selections.keys; 
	var encoded_keys = Ext.encode(selectedKeys);
	Ext.Ajax.request({
		url: '/zf/public/users/json/delete'
		, params: { 
			task: "delete"
			, deleteKeys: encoded_keys
			, key: 'user_id'
		}
		, callback: function (options, success, response) {
			if (success) { 
				
			} else {							
				Ext.MessageBox.alert('<?= $this->error ?>',response.responseText);
			}
		}
		, failure:function(response,options){
			var json = Ext.util.JSON.decode(response.responseText);
			Ext.MessageBox.alert('<?= $this->error ?>',json.msg);
		}                                      
		, success:function(response,options){
			var json = Ext.util.JSON.decode(response.responseText); // decode resoponse text
			if (json.success===false) { // if json success is false then do this
			Ext.MessageBox.alert('<?= $this->error ?>',json.msg); // makes alert box with response text
			} else if (json.success===true) { // if json success is true then do this
			} else { // else then do this
			} // end if
               store.reload();
		}
		, scope: this
	});
	
		                 }
		                 
	   },
	   animEl: 'elId',
	   icon: Ext.MessageBox.QUESTION
	});
};

var grid = new Ext.grid.GridPanel({
                    plugins: [new Ext.ux.grid.Search({
                iconCls:'icon-zoom'
                ,readonlyIndexes:['user_id']
                ,disableIndexes:['user_id','lastname','firstname','fullname','active','role','role_id','email','company']
                ,minChars:3
                ,autoFocus:true
//              ,menuStyle:'radio'
            })],
		            viewConfig: { 
                    fitToFrame:true, 
                    fitContainer:true,      
                    forceFit:true, 
                    autoScroll:true                  
                      },
                                  selModel: new Ext.grid.RowSelectionModel({singleSelect:true}),
								  clicksToEdit: 2,
								  bbar: new Ext.PagingToolbar({
															  store: store,
															  pageSize: 100,
															  displayInfo: 'Roles {0} - {1} of {2}',
															  emptyMsg: 'No users to display'}),
								  store: store,
								  colModel: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{header: 'ID',
																	  dataIndex: 'user_id',
																	  id: 'user_id',
																	  width: 20,
																	  sortable: true,
																	  hidden: false,
																	  locked: false},
																	  {header: '<?= $this->username ?>',
																	  dataIndex: 'username',
																	  width: 80,
																	  sortable: true,
																	  locked: false},
																	  {header: '<?= $this->fullname ?>',
																	   dataIndex: 'fullname',
																	   width: 80,
																	   sortable: false,
																	   locked: false},
																	   {header: '<?= $this->firstname ?>',
																		   dataIndex: 'firstname',
																		   width: 80,
																		   sortable: true,
																		   locked: false,
																		   hidden:false},
																		   {header: '<?= $this->lastname ?>',
																			   dataIndex: 'lastname',
																			   width: 80,
																			   sortable: true,
																			   locked: false,
																			   hidden:false},
																	 {header: '<?= $this->role ?>',
																	  dataIndex: 'role',
																	  width: 80,
																	  sortable: false,
																	  locked: false},
																	  {header: '<?= $this->role ?>',
																		  dataIndex: 'role_id',
																		  width: 80,
																		  hidden:true,
																		  sortable: false,
																		  locked: false},
																     {header: '<?= $this->email ?>',
																	  dataIndex: 'email',
																	  width: 80,
																	  sortable: true,
																	  locked: false},
																	  {header: '<?= $this->company ?>',
																	  dataIndex: 'company',
																	  width: 80,
																	  sortable: true,
																	  locked: false},
																	  {
            xtype: 'booleancolumn',
            header: '<?= $this->access ?>',
            dataIndex: 'active',
            align: 'left',
            width: 50,
            trueText: '<?= $this->allow ?>',
            falseText: '<?= $this->deny ?>',
            editor: {
                xtype: 'checkbox'
            }
        }]),
								  stripeRows: true,
								  autoExpandColumn: 'role_name',
								      tbar: [{ 
                        text: '<?= $this->deselect ?>' 
                        , tooltip: '<?= $this->deselect_tooltip ?>' 
                        , iconCls:'refresh-icon' 
                        , handler: function () { 
                            grid.selModel.clearSelections();
                            Ext.getCmp('edit-user').disable();
                            Ext.getCmp('delete-user').disable();
						    Ext.getCmp('change-password').disable();
                        }} 
                    , { 
                        text: '<?= $this->refresh ?>' 
                        , tooltip: '<?= $this->refresh_tooltip ?>' 
                        , iconCls: 'refresh-icon' 
                        , handler: function () { 
                            store.reload();
                            grid.selModel.clearSelections();
                            Ext.getCmp('edit-user').disable();
                            Ext.getCmp('delete-user').disable();
						    Ext.getCmp('change-password').disable();
                        } 
                    }, { 
                        text: '<?= $this->new_user ?>' 
                        , tooltip: '<?= $this->new_user_tooltip ?>' 
                        , iconCls: 'refresh-icon' 
                        , handler: createNU
                    }, { 
                        text: '<?= $this->change_password ?>'
                        , id: 'change-password'
                        , tooltip: '<?= $this->change_password_tooltip ?>' 
                        , iconCls: 'refresh-icon'
                        , disabled: true
                        , handler: changepassworNU
                    }, { 
                        text: '<?= $this->edit_user ?>'
                        , id: 'edit-user'
                        , tooltip: '<?= $this->edit_user_tooltip ?>' 
                        , iconCls: 'refresh-icon'
                        , disabled: true
                        , handler: editNU
                    }, { 
                        text: '<?= $this->delete ?>'
                            , id: 'delete-user'
                            , tooltip: '<?= $this->delete_tooltip ?>' 
                            , iconCls: 'refresh-icon'
                            , disabled: true
                            , handler: handleDelete
                        }],  
								  width: '100%',
								  height: Ext.lib.Dom.getViewHeight(),
								  view: new Ext.grid.GroupingView({markDirty: false,forceFit: true,
							      groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "<?= $this->items ?>" : "<?= $this->item ?>"]})'})});
								  
								  
	function resize() {
		grid.setHeight(Ext.lib.Dom.getViewHeight());
		grid.setWidth(Ext.lib.Dom.getViewWidth());
	}
	Ext.EventManager.onWindowResize(resize);
	
	//Ext.get('hd').getHeight();
								  
				/*function savegrid () { 
             
                Ext.Ajax.request({ 
                    waitMsg: 'Saving changes...' 
                    , url: '/zf/public/users/json/edit' 
                    , params: {  
                        task: "edit_user" 
                        , key: 'user_id' 
                        , keyID: grid.getSelectionModel().getSelected().get('user_id')
                        , field: 'active' 
                        , value: grid.getSelectionModel().getSelected().get('active')
                        } 
                    , failure:function(response,options){ 
                        Ext.MessageBox.alert('Warning','Error...'); 
                    }                             
                    , success:function(response,options){ 
					    var json = Ext.util.JSON.decode(response.responseText); // decode resoponse text
						if (json.success===false) { // if json success is false then do this
						Ext.MessageBox.alert('Warning',json.msg); // makes alert box with response text
						} else if (json.success===true) { // if json success is true then do this
						} else { // else then do this
						} // end if
                        store.commitChanges(); 
                        store.reload(); 
                    }       
                    , scope: this 
                }); 
            }; */
								  
								  //editor.addListener('afteredit', savegrid, this);  
								  
								  //store.on('update', savegrid, this);
								  
								  grid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
								      
								       var selectedRows = grid.selModel.selections.items;

								       var selectedKeys = grid.selModel.selections.keys;
								       
								       var encoded_keys = Ext.encode(selectedKeys);
								       
								       Ext.getCmp('user_id').setValue(selectedKeys);
								       Ext.getCmp('user_id_changepassword').setValue(selectedKeys);
								       Ext.getCmp('firstname').setValue(r.get('firstname'));
								       Ext.getCmp('lastname').setValue(r.get('lastname'));
								       Ext.getCmp('company').setValue(r.get('company'));
								       Ext.getCmp('email').setValue(r.get('email'));
								       Ext.getCmp('userrole').setValue(r.get('role_id'));
								       Ext.getCmp('active').setValue(r.get('active'));
								       Ext.getCmp('edit-user').enable();
								       Ext.getCmp('change-password').enable();
								       Ext.getCmp('delete-user').enable();
								       
								  });
								   
grid.render('dynamicEditorGrid');

});