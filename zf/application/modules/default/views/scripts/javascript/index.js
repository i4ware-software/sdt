<?php header('Content-type: text/javascript'); ?>
Ext.onReady(function () {
					  
    /** state manager */
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	Ext.QuickTips.init();
	
	function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
    }
	
	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for ( var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ')
				c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0)
				return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		createCookie(name, "", -1);
	}
	
	function saveState(e) {
	   //var cp = new Ext.state.CookieProvider({
       //   path: "/",
       //   expires: new Date(new Date().getTime()+(1000*60*60*24*30)), //30 days
       //   domain: "mattikiviharju.name"
       //});
	   //Ext.state.Manager.setProvider(cp);
	   var width_view = Ext.get('west-panel').getWidth();
	   createCookie('left_bar_width',width_view,0);
    }

    // turn on validation errors beside the field globally
    Ext.form.Field.prototype.msgTarget = 'side';	
    
    var myRecord = new Ext.data.Record.create([{
        name: 'user_id'
    },
    {
        name: 'firstname'
    },
    {
        name: 'lastname'
    },
    {
        name: 'email'
    },
    {
        name: 'company'
    }]);

    var myReader = new Ext.data.JsonReader({
        successProperty: 'success',
        totalProperty: 'results',
        root: 'myaccount',
        id: 'user_id'
    },
    myRecord);

    var myaccount = new Ext.FormPanel({
        frame: false,
        border: false,
        labelAlign: 'left',
        labelWidth: 85,
        waitMsgTarget: true,
        reader: myReader,
        items: [
        new Ext.form.FieldSet({
            title: '<?= $this->contactinfo ?>',
            autoHeight: true,
            defaultType: 'textfield',
            items: [{
                fieldLabel: '<?= $this->firstname ?>',
                name: 'firstname',
                width: 140
            },
            {
                fieldLabel: '<?= $this->lastname ?>',
                name: 'lastname',
                width: 140
            },
            {
                fieldLabel: '<?= $this->company ?>',
                name: 'company',
                width: 140
            },
            {
                fieldLabel: '<?= $this->email ?>',
                name: 'email',
                vtype: 'email',
                width: 140
            }]
        })]
    });

    // simple button add
    myaccount.addButton('<?= $this->load ?>', function () {
        myaccount.getForm().load({
            url: '/zf/public/json/myaccount',
            waitMsg: '<?= $this->loading ?>',
            failure: function (form, action) {
                var json = Ext.util.JSON.decode(action.responseText);
                Ext.MessageBox.alert('<?= $this->warning ?>', json);
            }
        });
    });

    var submit = myaccount.addButton({
        text: '<?= $this->save ?>',
        disabled: true,
        handler: function () {
            myaccount.getForm().submit({
                url: '/zf/public/json/accountsave',
                waitMsg: '<?= $this->saving ?>',
				failure: function (form, action) {
                var json = Ext.util.JSON.decode(action.responseText);
                Ext.MessageBox.alert('<?= $this->warning ?>', 'Oops...');
                }
            });
        }
    });

    myaccount.on({
        actioncomplete: function (form, action) {
            if (action.type == 'load') {
                submit.enable();
            }
        }
    });

    var myaccount_password = new Ext.FormPanel({
        frame: false,
        border: false,
        labelAlign: 'left',
        labelWidth: 85,
        waitMsgTarget: true,
        items: [
        new Ext.form.FieldSet({
            title: '<?= $this->changepassword ?>',
            autoHeight: true,
            defaultType: 'textfield',
            items: [{
                fieldLabel: '<?= $this->oldpassword ?>',
                name: 'old',
                width: 140,
                inputType: 'password',
                allowBlank: false
            },
            {
                fieldLabel: '<?= $this->newpassword ?>',
                name: 'new',
                inputType: 'password',
                'id': 'pass',
                width: 140,
                allowBlank: false
            },
            {
                fieldLabel: '<?= $this->verify ?>',
                name: 'ver',
                inputType: 'password',
                width: 140,
                'id': 'ver',
                allowBlank: false
            }]
        })]
    });

    var submit_password = myaccount_password.addButton({
        text: '<?= $this->change ?>',
        disabled: false,
        handler: function () {
            myaccount_password.getForm().submit({
                url: '/zf/public/json/change',
                waitMsg: '<?= $this->saving ?>',
                success: function (form, action) {
                    /* 
					var json = Ext.util.JSON.decode(response.responseText); // decode resoponse text
						if (json.success===false) { // if json success is false then do this
						Ext.MessageBox.alert('<?= $this->warning ?>',json.msg); // makes alert box with response text
						} else if (json.success===true) { // if json success is true then do this
						} else { // else then do this
						} // end if
					*/
                    myaccount_password.getForm().reset();
                },
                failure: function (form, action) {
                    //var json = Ext.util.JSON.decode(action.responseText);
                    Ext.MessageBox.alert('<?= $this->warning ?>', 'Oops...');
                }
            });
        }
    });

    var myRec = new Ext.data.Record.create([{
        name: 'gen'
    }]);

    var myGen = new Ext.data.JsonReader({
        successProperty: 'success',
        totalProperty: 'results',
        root: 'myaccount',
        id: 'gen'
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
                'id': 'gen'
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

    myaccount_password_auto.addButton('<?= $this->copypaste ?>', function () {
        var pwd = Ext.getCmp('pass');
        var ver = Ext.getCmp('ver');
        var gen = Ext.getCmp('gen');
        var cc = gen.getValue();
        pwd.setValue(cc);
        ver.setValue(cc);
    });	

    var viewport = new Ext.Viewport({
        layout: 'border',
        renderTo: 'ViewPort',
        items: [{
            region: 'north',
            border: false,
            frame: false,
            layout: 'fit',
            height: 28,
            tbar: ['-', {
                text: '<?= $this->logout ?>',
                tooltip: '<?= $this->logouttooltip ?>',
                iconCls: 'icon-door-out',
                handler: function () {
                    document.location = '/zf/public/default/index/logout';
                },
                scope: this
            }<?= $this->html_user ?>]
        },
        {
            region: 'center',
            layout: 'fit',
            border: true,
            frame: false,
            title: '<?= $this->application ?>',
            id: 'mainframe',
            defaultType: 'iframepanel',
            defaults: {
                loadMask: {hideOnReady :true,msg:'Loading...'},
                border: false,
                header: false
            },
            items: [{
                id: 'iframe',
                defaultSrc: '<?= $this->redirect ?>'
            }]
        },
        {
            region: 'west',
            id: 'west-panel',
            // see Ext.getCmp() below
            //title: '<?= $this->menu ?>',
            split: true,
            width: 280,
            minSize: 280,
            maxSize: 280,
            collapsible: false,
			collapsed: true,
			animCollapse: true,
			animScroll: true,
			animFloat: true,
			autoHide: false,
		    floatable: true,
			listeners: { 'beforecollapse': saveState, 'collapse': saveState, 'expand': saveState },
            border: true,
            frame: false,
            margins: '0 0 0 0',
            defaults: {
                autoScroll: true
            },
            layout: {
                type: 'accordion',
                animate: true
            },
            items: [{
                title: '<?= $this->myaccount ?>',
                items: [myaccount, myaccount_password, myaccount_password_auto],
                border: false
            }]
        }

        ]
    });
	
	var width_bar_view = Ext.get('west-panel').getWidth();

	createCookie('left_bar_width',width_bar_view,0);

});