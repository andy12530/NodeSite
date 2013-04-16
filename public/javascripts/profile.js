$(function() {
    //点击删除按钮后
    $('#tab1, #tab2').on('click', '.delete, .purge', function(e) {
        var that = $(this);
        e.preventDefault();
        var url = $(this).attr('href');
        
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'JSON',
            success: function(data) {
                var msg = '编号'+ data.postId;
                if (that.hasClass('.delete')) {
                    msg += '的帖子已经成功删除';
                } else {
                    msg += '的帖子已经彻底删除';
                }
        
                if (data.status == 'success') {
                    $('#alert strong').text(msg); 
                    that.parents('li').hide();
                }
            },
            complete: function() {
                $('#alert').show();
            }
        });
    });



})