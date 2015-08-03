var message = {
	list: {
		
		new: {
			update: function(callback) {
				if (callback) {
					message.list._updateList('new', callback);
				} else {
					message.list._updateList('new');
				}
			}
		},
		
		saved: {
			update: function(callback) {
				if (callback) {
					message.list._updateList('saved', callback);
				} else {
					message.list._updateList('saved');
				}
			}
		},
		
		all: {
			update: function(callback) {
				app.log(2, "Callback: " + callback);
				if (callback) {
					app.log(2, "Updating all message lists with callback");
					message.list._updateList('saved', message.list._updateList('new', callback));
				} else {
					message.list._updateList('saved', message.list._updateList('new'));
				}
			}
		},
		
		_updateList: function(list, callback) {
			var body = {
				"user": app.param('user'),
				"domain": app.param('domain'),
				"pass": app.param('pass')
			};
		
			$.ajax({
				"url": app.httpServer + '/message/list/' + list,
				"dataType": "jsonp",
				"data": body, 
				"statusCode": {
					200: function(data) {
						app.log(2, "Got " + list + " messages."); 
						app.log(3, "Data Received: " + data);
						app.log(3, "Message Total: " + data.length);
						
						if (!message.list[list]) {
							message.list[list].update = message.list._updateList(list);
						}
						
						for (i = 0; i < data.length; i++) {
							var uuid = data[i];
							
							
							
							if (!message[uuid]) {
								app.log(3, "message[" + uuid + "] doesn't exist yet, creating now");
								message._create(uuid);
							} else {
								app.log(3, "message[" + uuid + "] already exists, checking if status changed");
								// message[uuid] already exists, see if tags have changed
								if (message[uuid]['tags'] == list) {
									app.log(3, "message[" + uuid + "] status changed, recreating message");
									// Recreate the message as the message has changed tags
									// TODO: This doesn't seem very efficient...
									message._create(uuid);
									
								} else {
									app.log(3, "message[" + uuid + "] status not changed, nothing to do");
								}
							}
						}
						
						if (callback) {
							callback();
						}
					},
					
					401: function() {
						//ui.showCredsDialog("no-creds");
						//msg.savedList();
					},
					
					407: function() {
						//ui.showCredsDialog("invalid-creds", "msg.savedList();");
					}
				}
			});
		},
	},
		
	_create: function(uuid, callback) {
		var body = {
			"user": app.param('user'),
			"domain": app.param('domain'),
			"pass": app.param('pass')
		};
		
		$.ajax({
			"url": app.httpServer + '/message/' + uuid,
			"dataType": "jsonp",
			"data": body,
			"statusCode": {
				200: function(data) {
					var uuid = data[0].uuid;
					
					app.log(3, "Create Message Detail operation successful for " + uuid);
					app.log(3, "Data Received: " + data[0]);
					message[uuid] = data[0];
					
					$(message).trigger('create', data[0]);
					
					if (callback) {
						callback();
					}
				}
			},
		});
	}
};
