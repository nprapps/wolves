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
    var currently_playing = null;
    
    var volume_ambient_active = 0; //.3
    var volume_ambient_inactive = 0; // .1
    var volume_narration_active = 0; //1
    var volume_narration_inactive = 0; //0
    
    var cuepoints = [
        { 'id': 0, 'audio_cue': 0, 'audio_end': 10 },
        { 'id': 1, 'audio_cue': 20, 'audio_end': 30 },
        { 'id': 2, 'audio_cue': 40, 'audio_end': 50 },
        { 'id': 3, 'audio_cue': 60, 'audio_end': 70 },
        { 'id': 4, 'audio_cue': 80, 'audio_end': 90 },
        { 'id': 5, 'audio_cue': 100, 'audio_end': 110 }
    ];

	/*if (Modernizr.audio) {
	    audio_supported = true;
	}*/
	
    //toggle captions
	$( '.toggle-captions' ).click(function() {
		$( '.edge-caption' ).fadeToggle( 'slow', function() {
		});
		$('body').toggleClass('focused');
		if ($(this).find('p').text() == 'Show Captions')
		$(this).find('p').text('Hide Captions');
		else
		$(this).find('p').text('Show Captions');
	});
	
	$('.caption-trigger').click(function() {
		$( this ).toggleClass('cap-on');
	});
	
	$('.pt').click(function() {
		$( '.titlecard-first' ).toggleClass('fadeOut');
		if ($(this).text() == 'Hide Wolf')
		$(this).text('Show Wolf');
		else
		$(this).text('Hide Wolf');
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
            supplied: 'oga, mp3',
            timeupdate: check_end_cues,
            volume: volume_narration_active
        });

        $ambient_player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                	mp3: 'https://dl.dropboxusercontent.com/u/2639930/wind2.mp3'
                }).jPlayer('play', 2);
//                }).jPlayer('pause');
            },
            cssSelectorAncestor: '#jp_container_2',
            loop: true,
            supplied: 'mp3',
            volume: volume_ambient_active
        });
    }
    

    // CUEPOINTS

    // FOR DEMO PURPOSES: Make every *other* .edge-to-edge a cuepoint and assign an
    // arbitrary audio timing to each
    var counter = 0;
    $('.edge-to-edge').each(function(k,v) {
        var this_img = $('.edge-to-edge:eq(' + k + ')');
        // only make every *other* wide image a cuepoint (for demo purposes)
        if (k%1 == 0) {
            this_img.attr('id', 'cue' + counter);
            counter++;
        }
    });
    
    // if any part of the image is visible onscreen, returns true
    function is_visible(el) {
        var rect = document.getElementById(el).getBoundingClientRect();
        return (
            rect.top >= -rect.height &&
            rect.top <= rect.height &&
            rect.bottom >= 0
        );
    }
    
    function on_scroll() {
        var num_visible = 0;
        
        // loop through all cuepoints
        for (i = 0; i < cuepoints.length; i++) {
            // check if this cuepoint is visible
            if (is_visible('cue' + i)) {
                console.log('cue' + i + ' is visible');
                // check if this cuepoint's audio is already playing
                if (currently_playing != i) {
                    // if not, play the cuepoint
                    fade_narration('in', cuepoints[i].audio_cue);
                    fade_ambient('out');
                    currently_playing = i;
                }
                num_visible++;
            }
        }
        if (num_visible == 0) {
            console.log('no cues are visible');
            if (currently_playing != null) {
                fade_ambient('in');
                fade_narration('out');
                currently_playing = null;
            }
        }
    }
    
    // stop audio when the end cuepoint is reached
    function check_end_cues(e) {
        if (currently_playing &&
            e.jPlayer.status.currentTime >= cuepoints[currently_playing].audio_end &&
            e.jPlayer.status.currentTime <= (cuepoints[currently_playing].audio_end + 5)) {
            fade_narration('out');
            //$(this).jPlayer('pause'); 
        }
    }

    // call on_scroll only after the scroll has completed
    $(window).on('scroll', _.debounce(function() {
        on_scroll()
    }, 100));
    
    function fade_ambient(dir) {
        var end_vol;
        
        if (dir == 'in') {
            end_vol = volume_ambient_active;
        } else {
            end_vol = volume_ambient_inactive;
        }
        $ambient_player.find('audio').animate({volume: end_vol}, 1000);
    }
    
    function fade_narration(dir, cue) {
        var end_vol;
        
        if (dir == 'in') {
            end_vol = volume_narration_active;
            $player.find('audio').animate({volume: end_vol}, 700, function() {
                $player.jPlayer('play', cue);
            });
        } else {
            end_vol = volume_narration_inactive;
            $player.find('audio').animate({volume: end_vol}, 700, function() {
                $player.jPlayer('pause');
            });
        }
    }
    

    //titlecard smooth scroll
    $('#title-text').click(function() {
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
