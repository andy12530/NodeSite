$(function() {
	$('#contact a').click(function(e) {
		e.preventDefault();
		$('#chat').show();
	});

	$('#chat .close').click(function(e) {
		e.preventDefault();
		$('#chat').hide();
	});

	var chatId = $('#chatId').val(),
		myId = $('#myId').val();

	var socketIo = io.connect('http://localhost:3000');
	
	socketIo.on('private message', function(from, nickName, msg) {
		var isNew = false;
		if (chatId !== from) {
			chatId = from;
			isNew = true;
		}

		insertMsg(nickName, msg, isNew);
	});

	// socketIo.on('disconnect', function(data) {
	// 	insertMsg('System', 'offline');
	// });

	function insertMsg(user, msg, isNew) {
		$('#chat').show();
		if (isNew) {
			$('#chat article').append($('<hr/>'));
		}
		
		var $el = $('<li></li>');
		$el.text(user + '  说:  ' + msg);
		$('#chat article').append($el);
	}

	$('#chat .wp-chat-send').click(function(e) {
		e.preventDefault();
		var val = $('#chat textarea').val();
		insertMsg("您", val);
		console.log(chatId);
		socketIo.emit('private message', chatId, val);
		$('#chat textarea').val('');
	})
});