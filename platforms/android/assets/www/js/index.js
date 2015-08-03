var app = {
	httpServer: 'http://watson.davri.com:3000',
	gcmSenderID: "515964879565",
	onDevice: false,
	isConnected: true,
	debugMode: true,
	
	// Param/Config Management
	param: function(key, value) {
		if (this.onDevice == true) {
			// Assume on Standard Browser
			if (value) {
				app.log(3, "Setting " + key + " from " + localStorage.getItem(key) + " to " + value);
				localStorage.setItem(key, value);
			}
			app.log(3, "Returning " + key + " as " + localStorage.getItem(key));
			return localStorage.getItem(key);
		} else {
			if (value) {
				app.log(3, "Setting " + key + " from " + localStorage.getItem(key) + " to " + value);
				localStorage.setItem(key, value);
			}
			app.log(3, "Returning " + key + " as " + localStorage.getItem(key));
			return localStorage.getItem(key);
		}
	},

	log: function(severity, message) {
		var severityText = "";
		switch(severity) {
			case 0:
				severityText = "Critical Error";
				break;
			case 1:
				severityText = "Warning";
				break;
			case 2:
				severityText = "Information";
				break;
			case 3:
				severityText = "Debug";
				break;
			default:
				severityText = "Information";
				severity = 2;
		}
		
		if (this.debubMode) {
			console.log(severityText + ": " + message);
			$(".statusMessage").html("<strong>" + severityText + ":</strong> " + message);
		} else if (severity <= 2) {
			console.log(severityText + ": " + message);
		}
	},

    // Application Constructor
    initialize: function() {
		if (document.location.protocol == "file:") {
			this.onDevice = true;
			this.log(3, "Initializing...");
			this.log(3, "Running as Mobile Application...");
			
			// Assume PhoneGap/Cordova needs to be loaded
			//this.loadJavascriptFile("cordova.js");
			//this.loadJavascriptFile("js/device.js");
			//this.loadJavascriptFile("js/PushNotification.js");
			
			// Listen to deviceready event
			document.addEventListener('deviceready', this.onDeviceReady, false);
			
		} else {
			// Assume running in standard web browser
			// Listen to DOMContentLoaded
			this.log(3, "Initializing...");
			this.log(3, "Running web browser mode...");
			document.addEventListener("DOMContentLoaded", this.onDeviceReady, false);
		}
    },
    
    // Events
    onDeviceReady: function() {
		app.log(2, 'Device Ready!');
		// Native loading spinner
		//if (window.spinnerplugin) {
			//$.extend($.mobile, {
				//loading: function() {
					//// Show/hide spinner
					//var arg = arguments ? arguments[0] : '';
					//if (arg == 'show') {
						//spinnerplugin.show({'overlay':true});
					//} else if (arg == 'hide') {
						//spinnerplugin.hide();
					//}           

					//// Compatibility with jQM 1.4
					//return { loader: function() { } }
				//}
			//}); 
		//}
		
		if (app.onDevice == false) {
			app.log(2, "Detected Standard Browser...");
			
		} else if (device.platform.toLowerCase() === 'android') {
			// We're using Android
			app.log(2, 'Detected Android device...');
			app.registerGCM();
        }
        
        
        $('#settingsBack').on('click', function() {
			message.list.all.update();
		});
		
		// Register event handler for back button
		if (app.onDevice) {
			if (device.platform.toLowerCase === 'android') {
				
				// Create back button event handler
				var onBackButton = function(event) {
					$(".btn-back").trigger('click');
				}
				
				// Add back button event
				document.addEventListener('backbutton', onBackButton, false);
			}
		}
		
		$(message).bind('create', function(event, msg) {
			ui.onMessageCreate(msg);
		});
		
		$(message).bind('delete', function(event, uuid) {
			ui.onMessageDelete(uuid);
		});
		
		app.sync();
    },
    
    sync: function() {
		app.log(2, "Executing sync...");
		$.mobile.loading("show", {
			text: "Loading Messages...",
			theme: "a",
			textVisible: true
		});
		
		message.list.all.update(function() {
			setTimeout(function() {
				$.mobile.loading("hide");
			}, 1000);
		});
	},
    
    // GCM Events
    onRegisterSuccessGCM: function(result) {
		// TODO: Do something on GCM Register success
		app.log(3, 'Google Cloud Messaging Registration Request was sent successfully!');
	},
	
	onRegisterFailureGCM: function() {
		app.param('registerID', '');
		app.log(1, 'Register GCM failed.');
		//this.registerGCM();
	},
    
	onNotificationGCM: function(e) {
		if (e.event == 'registered') {
			// Check to make sure we have register ID before storing
			if (e.regid.length > 0) {
				// Store Register ID
				app.log(3, 'Got Registration Notification from Google Cloud Messaging...');
				app.param('registerID', e.regid);
				
				var body = {
					"user": app.param('user'),
					"domain": app.param('domain'),
					"pass": app.param('pass')
				};
				
				$.ajax({
					"url": app.httpServer + '/register/gcm',
					"dataType": "jsonp",
					"data": body, 
					"statusCode": {
						200: function(data) {
							app.log(3, 'Registered to Voicemail Service at ' + app.httpServer);
						},
						409: function(data) {
							app.log(3, 'Registration to Voicemail Service at ' + app.httpServer + ' failed, unauthorized.');
						}
					},
					"error": function(jqxhr, status, err) {
						app.log(2, "Error while registering with Voicemail Service at " + app.httpServer + ': ' + err);
					}
				});
				
			} else {
				log(3, 'GCM Registration Notification has regid length of 0.');
			}
			
		} else if (e.event == 'message') {
			// Received Push Message
			if (e.command) {
				this.log(3, 'Received Push Command: ' + e.command);
			}
				
			if (e.message) {
				this.log(3, 'Received Message: ' + e.message);
			}
				
		} else if (e.event == 'error') {
			// GCM Error
			this.log(1, 'Google Cloud Messaging Error: ' + e.msg);
		} else {
			// Unknown Error
			this.log(1, 'Google Cloud Messaging Error: Unknown Error Occurred');
		}
	},
	
	registerGCM: function() {
		if (app.param('registerID') == "") {
			this.log(2, 'Registering with Google Cloud Messaging...');
			// Register for Push Notifications
			window.plugins.pushNotification.register(this.onRegisterSuccessGCM, this.onRegisterFailureGCM, { ecb: 'app.onNotificationGCM', senderID: app.gcmSenderID});
		} else {
			this.log(1, 'Registration with Google Cloud Messaging failed!');
		}
	}
};
