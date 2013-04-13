$(function() {
    //点击删除按钮后
    $('#tab1').on('click', '.delete, .purge', function(e) {
        var that = $(this);
        e.preventDefault();
        var url = $(this).attr('href');

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'JSON',
            success: function(data) {
                if (data.status == 'success') {
                    $('#alert strong').text('编号'+ data.postId+ '的帖子已经成功删除'); 
                    that.parents('li').hide();
                }
            },
            complete: function() {
                $('#alert').show();
            }
        });
    });



})