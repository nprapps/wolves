$(document).ready(function() {
    var $container = $('#content');
    var $titlecard = $('.titlecard')
    var $titlecard_wrapper = $('.titlecard-wrapper');
    var $w = $(window);
    var $ambient_audio = $('#audio-ambient');
    var $ambient_player = $('#pop-audio-ambient');
    var $audio = $('#audio');
    var $player = $('#pop-audio');
    var aspect_width = 16;
    var aspect_height = 9;
    var window_width;
    var window_height;
    var AUDIO_LENGTH = 60;
    var audio_supported = true;
    var cuepoints = [];
    var currently_playing = null;

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
                    oga: 'http://download.npr.org/anon.npr-mp3/npr/specials/2012/09/20120913_specials_cushman.ogg',
                	mp3: 'http://download.npr.org/anon.npr-mp3/npr/specials/2012/09/20120913_specials_cushman.mp3'
                }).jPlayer('pause');
            },
            play: function() { },
            ended: function (event) {
                $(this).jPlayer('pause', AUDIO_LENGTH - 1);
            },
            swfPath: 'js/lib',
            supplied: 'oga, mp3'
        });

        $ambient_player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                	mp3: 'http://apps.npr.org/tshirt/prototypes/media/falcon-hood.mp3'
                }).jPlayer('play', 2);
//                }).jPlayer('pause');
            },
            cssSelectorAncestor: '#jp_container_2',
            loop: true,
            supplied: 'mp3',
            volume: .2
        });
    }
    

    // get cuepoints
    function is_visible(el) {
        // if any part of the image is visible onscreen, returns true
        var rect = document.getElementById(el).getBoundingClientRect();
        return (
            rect.top >= -rect.height &&
            rect.top <= rect.height &&
            rect.bottom >= 0
        );
    }
    $('.wide-image').each(function(k,v) {
        var this_img = $('.wide-image:eq(' + k + ')');
        
        // only make every *other* wide image a cuepoint (for demo purposes)
        if (k%2 == 0) {
            var num_cuepoints = cuepoints.length;
            this_img.attr('id', 'cue' + num_cuepoints);
            cuepoints.push( {
                'id': num_cuepoints,
                'audio_cue': 20 * num_cuepoints
            });
        }
    });
    
    function on_scroll() {
        var num_visible = 0;
        
        for (i = 0; i < cuepoints.length; i++) {
            if (is_visible('cue' + i)) {
                console.log('cue' + i + ' is visible');
                if (currently_playing != i) {
                    $player.jPlayer('play', cuepoints[i].audio_cue);
                    $ambient_player.jPlayer('volume', .03);
                    currently_playing = i;
                }
                num_visible++;
            }
        }
        if (num_visible == 0) {
            console.log('no cues are visible');
            $player.jPlayer('pause');
            $ambient_player.jPlayer('volume', .3);
            currently_playing = null;
        }
    }
    $(window).on('scroll', _.debounce(function() {
        on_scroll()
    }, 100));
    

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
