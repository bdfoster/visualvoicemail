var ui = {
	initialize: function() {
		if (!app.param('notifyOnNew') == "") {
			$('#notifyOnNew').val(app.param('notifyOnNew'));
		}
		
		if (!app.param('user') == "") {
			$('#user').val(app.param('user'));
		}
		
		if (!app.param('domain') == "") {
			$('#domain').val(app.param('domain'));
		}
		
		// Register Event Handlers on #settings page
		$('#notifyOnNew').change(function() {
			app.param('notifyOnNew', $('#notifyOnNew').val());
		});
		$('#user').change(function() {
			app.param('user', $('#user').val());
		});
		$('#domain').change(function() {
			app.param('domain', $('#domain').val());
		});
		$('#pass').change(function() {
			app.param('pass', $('#pass').val());
		});
		
	},
	
	onMessageCreate: function(msg) {
		
		if ($("#msg-" + msg.uuid).length) {
			app.log(2, "Updating entry for message " + msg.uuid);
		} else {
			app.log(2, "Creating message entry for message " + msg.uuid);
			$('#msgList').prepend($('<li data-msg-sort="' + msg.received_epoch + '"><a id="msg-' + msg.uuid + '" href="#msgDetail" class="ui-btn msg"></a></li>'));
			$('#msg-' + msg.uuid).on('click', msg, function() {
				$('#messageCallerName').html(msg.caller_id_name);
				$('#messageCallerNumber').html(msg.caller_id_number);
				$('#messageReceived').html(moment.unix(msg.received_epoch).format("dddd, MMMM Do YYYY, h:mm:ss a"));
				$('#messageDuration').html(msg.duration_seconds);
				$('#messageSlider').attr('max', msg.duration_seconds);
			});
		}
		
		if (msg.caller_id_name) {
			// Insert Caller ID Name
			$('#msg-' + msg.uuid).append('<h3>' + msg.caller_id_name + '</h3>');
		} else {
			// Insert Caller ID Number
			$('#msg-' + msg.uuid).append('<h3>' + msg.caller_id_number + '</h3>')
		}
				
		if (msg.transcription) {
			// Insert Transcription
			$('#msg-' + msg.uuid).append('<p>' + msg.transcription + '</p>');
		} else {
			// Transcription not available
			$('#msg-' + msg.uuid).append('<p><i>Transcription Not Available</i></p>');
		}
		
		// Insert Timestamp
		msg.received_date = moment.unix(msg.received_epoch);
		$('#msg-' + msg.uuid).append('<p class="ui-li-aside"><strong>' + msg.received_date.fromNow() + '</strong></p>');
		
		// Tags
		if (msg.tags == 'new') {
			$('#msg-' + msg.uuid).addClass('msg-new');
		} else {
			$('#msg-' + msg.uuid).addClass('msg-saved');
		}
	
		ui.updateMessageCounts();
	},
	
	updateMessageCounts: function() {
		app.log(3, "Updating message counts...");
		
		$('#allCount').html($('#msgList li .msg').size());
		$('#newCount').html($('#msgList li .msg-new').size());
		$('#savedCount').html($('#msgList li .msg-saved').size());		
	},
	
	showAllMessages: function() {
		app.log(2, 'Showing all messages');
		$('#msgList li .msg-saved').slideDown(750);
		$('#msgList li .msg-new').slideDown(750);
	},
	
	showSavedMessages: function() {
		app.log(2, 'Showing saved messages');
		$('#msgList li .msg-new').slideUp(750);
		$('#msgList li .msg-saved').slideDown(750);
	},
	
	showNewMessages: function() {
		app.log(2, 'Showing new messages');
		$('#msgList li .msg-saved').slideUp(750);
		$('#msgList li .msg-new').slideDown(750);
	}
};
