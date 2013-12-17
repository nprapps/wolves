$(document).ready(function() {
    var $container = $('#content');
    var $titlecard = $('.titlecard')
    var $titlecard_wrapper = $('.titlecard-wrapper');
    var $w = $(window);
    
    var aspect_width = 16;
    var aspect_height = 9;
    var window_width;
    var window_height;
    
    function on_resize() {
        var w;
        var h;
        var w_optimal;
        var h_optimal;
        var w_offset = 0;
        var h_offset = 0;

        window_width = $w.width();
        window_height = $w.height();
        
        // calculate optimal width if height is constrained to window height
        w_optimal = (window_height * aspect_width) / aspect_height;
        
        // calculate optimal height if width is constrained to window width
        h_optimal = (window_width * aspect_height) / aspect_width;
        
        // decide whether to go with optimal height or width
        if (w_optimal > window_width) {
            w = w_optimal;
            h = window_height;
        } else {
            w = window_width;
            h = h_optimal;
        }
        w_offset = (window_width - w) / 2;
        h_offset = (window_height - h) / 2;
        
        // size the divs accordingly
        $titlecard.width(w + 'px').height(h + 'px');
        $titlecard.css('margin', h_offset + 'px ' + w_offset + 'px');
        $titlecard_wrapper.height(window_height + 'px');
        $container.css('marginTop', window_height + 'px');
    }
    
    $(window).on('resize', on_resize);
    on_resize();
    
});
