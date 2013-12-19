$(document).ready(function() {
    var $container = $('#content');
    var $titlecard = $('.titlecard')
    var $titlecard_wrapper = $('.titlecard-wrapper');
    var $w = $(window);
    var $audio = $('#audio');
    var $player = $('#pop-audio');
    var aspect_width = 16;
    var aspect_height = 9;
    var window_width;
    var window_height;
    var AUDIO_LENGTH = 60;
    var audio_supported = true;
	/*if (Modernizr.audio) {
	    audio_supported = true;
	}*/
	
    //toggle captions
	$( '.toggle-captions' ).click(function() {
		$( '.edge-caption' ).fadeToggle( 'slow', function() {
		});
		$('body').toggleClass('focused');
		if ($(this).find('p').text() == 'Show Captions')
		$(this).find('p').text('Hide Captions')
		else
		$(this).find('p').text('Show Captions');
	});
	
	//audio player
	//if (!audio_supported) { $audio.hide(); }

    if (audio_supported) {
        /*
         * Load audio player
         */
        $player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                	mp3: 'http://download.npr.org/anon.npr-mp3/npr/specials/2012/09/20120913_specials_cushman.mp3',
                    oga: 'http://download.npr.org/anon.npr-mp3/npr/specials/2012/09/20120913_specials_cushman.ogg',
                    
                }).jPlayer('pause');
            },
            play: function() { // To avoid both jPlayers playing together.
                $(this).jPlayer('pauseOthers');
            },
            ended: function (event) {
                $(this).jPlayer('pause', AUDIO_LENGTH - 1);
            },
            swfPath: 'js/lib',
            supplied: 'mp3, oga'
        });
    }
    
    //titlecard smooth scroll
    
    $('.titlecard-wrapper').click(function() {
		$.smoothScroll({
			speed: 800,
			scrollTarget: '.intro'
		});
		return false;
	});
    
    //share popover
    $(function () {
        $('body').popover({
            selector: '[data-toggle="popover"]'
        });
    });
	
	$('.share-this').popover({
        'selector': '',
        'placement': 'left',
        //'title': '<p>Share</p>',
        'content': '<p><i class="fa fa-twitter"></i></p><p><i class="fa fa-facebook-square"></i></p><p>Grab the link</p>',
        'html': 'true'
      });
    
	
    
    //resize titlecard
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
        //$titlecard.css('margin', h_offset + 'px ' + w_offset + 'px');
        $titlecard_wrapper.height(window_height + 'px');
        $container.css('marginTop', window_height + 'px');
    }
    
    $(window).on('resize', on_resize);
    on_resize();
    
});
