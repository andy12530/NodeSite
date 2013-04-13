$(function() {
    $('#ads .nav-tabs').on('click', 'li', function(e) {
        e.preventDefault();
        var id = this.id;

        if (id == $('#ads .active').attr('id')) {
            return false;
        } else {
            $('#ads .nav-tabs li').removeClass('active');
            $(this).addClass('active');

            console.log(id);
            if (id == 'filter-sell') {
                $('#ads .sell').show();
                $('#ads .buy').hide();
            } else if (id == 'filter-buy') {
                $('#ads .sell').hide();
                $('#ads .buy').show();
            } else {
                $('#ads .sell').show();
                $('#ads .buy').show();
            }
        }
    });
})