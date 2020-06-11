<?php header('Content-type: text/javascript'); ?>
Ext.SSL_SECURE_URL="/zf/public/ext/resources/images/default/s.gif"; 
Ext.BLANK_IMAGE_URL="/zf/public/ext/resources/images/default/s.gif";

Login = function(){
	var win, form, subURL = '/zf/public/default/index/login';		
	function onSubmit(){
	    this.Mask();
		form.submit({
			reset: true
		});
	}	
	return{
		Init:function(){
			Ext.QuickTips.init();			
			
			var fooPa = new Ext.Panel({
				baseCls: 'x-plain',
				id: 'login-footer',
		        region: 'north'
			});
			
			var looPa = new Ext.Panel({
				baseCls: 'x-plain',
				id: 'login-logo',
		        region: 'center',
			    html: '<div style="position: absolute; bottom: 5px; right: 5px;"><div align="center"><b><?= $this->applicationname ?></b><br /><?= $this->copyright ?></div></div>'
			}); 
			
			var forPa = new Ext.form.FormPanel({
		        baseCls: 'x-plain',
		        baseParams: {
		        	action: 'login'
		        },
		        defaults: {
		        	width: 150
		        },
		        defaultType: 'textfield',
		        frame: false,
		        height: 70,
		        id: 'login-form',		        
		        labelWidth:100,
		        listeners: {
				   'actionfailed': {
						fn: this.onACTfailD,
						scope: this
					},
					'actioncomplete': {
						fn: this.onACTcomP,
						scope: this
					}
				},
		        region: 'south',
		        url: subURL,
				items: [{
		            fieldLabel: '<?= $this->username ?>',
		            name: 'username',
					value: ''
		        },{
		            fieldLabel: '<?= $this->password ?>',
		            inputType: 'password',
		            name: 'password',
					value: ''
		        }]
		    });
			
			
		   function onSignup () { 
		   
		     sign = new Ext.Window({
			    buttonAlign: 'right',
		        closable: false,
		        draggable: true,
				stateful:false,
		        height: 240,
		        id: 'signup-window',
				layout: 'border',
		        minHeight: 240,
		        minWidth: 400,
		        plain: false,
		        resizable: false,
				title: '<?= $this->sign ?>',
		        width: 400,
				buttons: [{
		        	//handler: onSubmit,
		        	scope: this,
		            text: '<?= $this->sign ?>'
		        },{
		        	//handler: onSubmit,
		        	handler: function(){
		        		sign.destroy();
		        	},
		        	scope: this,
		            text: '<?= $this->close ?>'
		        }],
		        items: [
		        	looPa,
		        	forPa,
		        	fooPa
		        ]				
		    });
			
			sign.show();
			
		   }
		
		   win = new Ext.Window({		        
		        buttonAlign: 'right',
		        closable: false,
		        draggable: false,
				stateful:false,
		        height: 240,
		        id: 'login-window',
		        keys: {
		        	key: [13],
			        fn: onSubmit,
			        scope:this
		        },
				buttons: [{
		        	handler: onSubmit,
		        	scope: Login,
		            text: '<?= $this->login ?>'
		        }],
				layout: 'border',
		        minHeight: 240,
		        minWidth: 400,
		        plain: false,
		        resizable: false,
				title: '<?= $this->loginform ?>',
		        width: 400,
		        items: [
		        	looPa,
		        	forPa,
		        	fooPa
		        ]				
		    });				
			
			form = forPa.getForm();
			
			forPa.on('render', function(){
				var b = form.findField('username');
				
				if(b){
					b.focus();
				}
			}, this, {delay: 200});
			
		    win.show();
		},
		
		onACTfailD : function(response){
	    Ext.MessageBox.alert('<?= $this->identify ?>', '<?= $this->identify_msg ?>');
		},
		
		onACTcomP : function(b, a){
		
		    win.destroy(true);
			
			document.location = '/zf/public/default/index/secure';
			
			if(a && a.result){
			
				win.destroy(true);

			}
		},		
		
		
		Mask : function(msg){
		
			
	    }
		
		
		
	};
	
}();	

Ext.onReady(Login.Init, Login, false);
//Ext.onReady(Sing.Init, Sing, false);