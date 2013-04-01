$(function() {

$('form').on('error', 'input, select', function(e, errMsg) {
    $(this).next('.help-error').remove();
    var html = '<span class="help-error" style="color: #B94A48;">'+ errMsg +'</span>';
    $(this).after(html);
});

$('form').on('focus', 'input, select', function(e) {
    $(this).next('.help-error').remove();
});


//add Meta for second category
$('#addMetaBtn').click(function(e) {
    e.preventDefault();

    var metaName = $('#metaName'),
        metaNameEnglish = $('#metaNameEnglish'),
        property = $('#property');


    var nameVal = $.trim(metaName.val()),
        nameEnglishVal = $.trim(metaNameEnglish.val()),
        propertyVal = $.trim(property.val());

    if (!nameVal) {
        $(metaName).trigger('error', '属性名不能为空');
        return;
    } else if(!nameEnglishVal) {
        $(metaNameEnglish).trigger('error', '属性英文名不能为空');
        return;;
    }

    //清除文件框的值
    metaName.val('');
    metaNameEnglish.val('');
    property.val('');

    var obj = $('#metas').data('metas') || {};

    var html = '<a href="#" data-nameEnglish="'+ nameEnglishVal +'" style="margin-right: 10px;"><span class="label label-info">'+ nameVal + '</span></a>';

    if (nameVal && nameEnglishVal) {
        obj[nameEnglishVal] = [nameVal, propertyVal];
        //删除存在的同名meta属性
        $('#showMeta').find('a[data-nameEnglish='+nameEnglishVal+']').remove();
        $('#showMeta').append(html);
    }

    $('#metas').data('metas', obj);
});


$('#showMeta').on('click', 'a', function(e) {
    var that = $(this);

    e.preventDefault();
    var obj = $('#metas').data('metas') || {};
    var nameEnglish = $(this).attr('data-nameEnglish');

    $('#metaName').val(obj[nameEnglish][0]);
    $('#metaNameEnglish').val(nameEnglish);
    $('#property').val(obj[nameEnglish][1]);

    delete obj[nameEnglish];

    that.remove();
    $('#metas').data('metas', obj);
});


$('form').submit(function(e) {
    var categoryName = $('#categoryName'),
        categoryEnglish = $('#categoryEnglish');

    var categoryNameVal = $.trim(categoryName.val()),
        categoryEnglishVal = $.trim(categoryEnglish.val());

    if (!categoryNameVal) {
        categoryName.trigger('error', '分类目录名称不能为空');
        return false;
    } else if (!categoryEnglishVal){
        categoryEnglish.trigger('error', '目录英文名称不能为空');
        return false;
    }

    var jsonData = $('#metas').data('metas');
    $('#metas').val(JSON.stringify(jsonData));
});

});