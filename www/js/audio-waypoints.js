//audio player

    if (audio_supported) {
        /*
         * Load audio player
         */
        $player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                    mp3: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                	oga: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
                }).jPlayer('pause');
            },
            play: function() { },
            ended: function (event) {
                $(this).jPlayer('pause', AUDIO_LENGTH - 1);
            },
            swfPath: 'js/lib',
            supplied: 'mp3, oga',
            timeupdate: check_end_cues,
            volume: volume_narration_active
        });

        $ambient_player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                	mp3: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                	oga: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
                }).jPlayer('play', 2);
//                }).jPlayer('pause');
            },
            cssSelectorAncestor: '#jp_container_2',
            loop: true,
            supplied: 'mp3, oga',
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