$(function() {
    $('form').on('error', 'input, select', function(e, errMsg) {
        $(this).next('.help-error').remove();
        var html = '<span class="help-error" style="color: #B94A48;">'+ errMsg +'</span>';
        $(this).after(html);
    });

    $('form').on('focus', 'input, select', function(e) {
        $(this).next('.help-error').remove();
    });

    $('form').bind('submit', function(e) {
        var requiredInput = $(this).find(':required');
        var error = false;

        $.each(requiredInput, function() {
            var that = $(this);
            var val = $.trim(that.val());

            if(!val) {
                that.trigger('error', '不能为空')
                error = true;
                return;
            }
        });

        if (error) {
            return false;
        }
    });

    $('form').on('submit', 'input:required', function() {
        var that = $(this);
        var val = $.trim(that.val);

        if (!val) {
            that.trigger('error', '该项值不能为空');
        }
    })

    //点击一级类目，获取二级目录信息
    $('#firstCat').on('click', 'a', function(e) {
        e.preventDefault();
        $('#firstCat li').removeClass('active');
        $(this).parent().addClass('active');
        
        var firstCatId = $(this).attr('data-firstCatId');
        $('#firstCatId').val(firstCatId);

        $.ajax({
            url: '/ajax/secondCat',
            type: 'GET',
            data: {firstCatId: firstCatId},
            dataType: 'JSON',
            success: function(data) {
                var html = '<div class="cat">';
                $.each(data, function(k, item) {
                    html += '<a href="" data-listId='+ k +' data-secondEngName='+ item.categoryEnglish +' data-secondCatId="'+ item._id +'" class="cat-item">'+ item.category +'</a>';
                });
                html += '</div>';

                $('#secondCat').html(html);
                
                //存储二级目录信息
                $('#firstCat').data('categoryData', data);
            }
        });
    });

    var createForm = function(metaData, target) {
        var html = '';
        $.each(metaData, function(k, v) {
            html += '<div class="control-group">\
                        <label for="'+ k +'" class="control-label">'+ v[0] +'</label>\
                        <div class="controls">';
            
            if (v[1]) { //该项表单存在property
                html += '<div class="input-prepend">\
                            <input id="'+ k +'" name='+ k +' type="text" class="input-large">\
                            <span class="add-on">'+ v[1] +'</span>\
                        </div>';
            } else {
                html += '<input id="'+ k +'" name='+ k +' type="text" class="xinput-large">';
            }

            html += '</div></div>';
        });
        $(target).empty().html(html);
    }


    //选择二级类目
    $('#secondCat').on('click', 'a', function(e) {
        e.preventDefault();

        var secondData = $('#firstCat').data('categoryData') || {},
            secondListId = $(this).attr('data-listId');
        
        var secondObj = secondData[secondListId];

        if (secondObj.metas) {
            secondMetaObj = $.parseJSON(secondObj.metas);
            createForm(secondMetaObj, $('#metaData'));
        }

        //设置ID值
        var secondCatId = $(this).attr('data-secondCatId');
        $('#secondCatId').val(secondCatId);

        //设置文本值
        var catInfo = $('#firstCat .active').text() + ' - ' + secondObj.category;
        $('#catInfo').val(catInfo);

        $('#content').hide();
        $('#createForm').show();
    });

    //更改分类
    $('#changeCat').bind('click', function(e) {
        e.preventDefault();
        $('#createForm').hide();
        $('#content').show();
    });
})