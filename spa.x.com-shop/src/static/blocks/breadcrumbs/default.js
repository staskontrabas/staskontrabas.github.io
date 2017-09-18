$(window).on('load', function() {

    (function($) {
        /* global */
        var slider_min = 0;
        var scroll_distance = 0;
        var scroll_interval_time = 10;
        var scroll_timeouts = new Array();
        var slider_max = 0;
        var current_scroll_rate = new Array(0, 0, 0);
        var last_touch;
        var active_child_offset = 0;
        var transform_array = new Array();
        var children_offsets = new Array();
        var scroll_start_position = 0;
        var current_touches = 0;
        var scroller_container;
        var scroller_node;
        var scroller_links;
        var is_move = false;
        var stage_width;
        var settings;

        /* private */
        function slow_scroll_horizontal_interval(node, new_offset) {
            new_offset = Math.floor(new_offset);
            set_transform(new_offset);
        }

        function slow_scroll_horizontal() {
            var distance_offset_array = new Array();
            transform_array = get_transform_array();
            var node_offset = parseInt(transform_array[4], 10);
            friction_coefficient = settings.friction_coefficient;
            elastic_friction_coefficient = settings.elastic_friction_coefficient;
            snap_friction_coefficient = settings.snap_friction_coefficient;
            if(scroll_distance < -500) {
                scroll_distance = -500;
            } else if(scroll_distance > 500) {
                scroll_distance = 500;
            }
            i = 0;
            while((scroll_distance > 1) || (scroll_distance < -1)) {
                scroll_distance = scroll_distance * friction_coefficient;
                node_offset = node_offset + scroll_distance;
                if((node_offset > slider_min) || (node_offset < (slider_max * -1))) {
                    scroll_distance = scroll_distance * elastic_friction_coefficient;
                    node_offset = node_offset + scroll_distance;
                }
                distance_offset_array[i] = node_offset;
                i++;
            }
            while(node_offset > (slider_min + 0.5)) {
                node_offset = node_offset * friction_coefficient;
                distance_offset_array[i] = node_offset;
                i++;
            }
            while(node_offset < ((slider_max * -1) - 0.5)) {
                node_offset = ((node_offset - (slider_max * -1)) * friction_coefficient) + (slider_max * -1);
                distance_offset_array[i] = node_offset;
                i++;
            }
            for(var j = 0; j < children_offsets.length-1; j++) {
                active_child_offset = j;
                var middle = (children_offsets[active_child_offset] + children_offsets[active_child_offset+1]) * 0.5;
                if(middle < node_offset) break;
            }
            var j_start = 1;
            if((distance_offset_array.length%2) != 0) {
                j_start = 0;
            }
            var lastTimeoutRegistered = 0;
            var count = 0;
            for(var j = j_start; j < distance_offset_array.length; j = j + 2) {
                scroll_timeouts[j] = setTimeout(slow_scroll_horizontal_interval, scroll_interval_time * j, scroller_node, distance_offset_array[j]);
            }
        }

        function set_transform(value){
            scroller_node.css({
                '-webkit-transform':'translateX(' + value + 'px)',
                '-o-transform':'translateX(' + value + 'px)',
                '-moz-transform':'translateX(' + value + 'px)'
            });
        }

        function get_transform_array() {
            var tranform = scroller_node.css('-webkit-transform');
            if (!tranform)
                tranform = scroller_node.css('-o-transform');
            if (!tranform)
                tranform = scroller_node.css('-moz-transform');
            return tranform.split(',')
        }

        function touch_start(event) {
            current_scroll_rate = new Array(0, 0, 0);
            scroll_distance = 0;
            for (var j = 0; j < scroll_timeouts.length; j++) {
                clearTimeout(scroll_timeouts[j]);
            }
            transform_array = get_transform_array();
            var scroll_position = parseInt(transform_array[4], 10);
            if (scroll_position > slider_min) {
                scroll_position = slider_min;
            }
            if (scroll_position < (slider_max * -1)) {
                scroll_position = slider_max * -1;
            }
            //set_transform(scroll_position);
            transform_array = get_transform_array();
            scroll_start_position = (parseInt(transform_array[4], 10) - event.touches[0].pageX) * -1;
            event.preventDefault();
        }

        function touch_move(event){
            transform_array = get_transform_array();
            if (current_touches != event.touches.length) {
                scroll_start_position = (parseInt(transform_array[4], 10) * -1) + event.touches[0].pageX;
            }
            current_touches = event.touches.length;
            var edge_degradation = 0;
            elastic_pull_resistance = settings.elastic_pull_resistance;
            if (parseInt(transform_array[4], 10) >= slider_min) {
                edge_degradation = (scroll_start_position - event.touches[0].pageX) * elastic_pull_resistance;
            }
            if (parseInt(transform_array[4], 10) <= (slider_max * -1)) {
                edge_degradation = (slider_max + ((scroll_start_position - event.touches[0].pageX) * -1)) * elastic_pull_resistance * -1;
            }
            set_transform((scroll_start_position - event.touches[0].pageX - edge_degradation) * -1);
            transform_array = get_transform_array();
            current_scroll_rate[0] = current_scroll_rate[1];
            current_scroll_rate[1] = current_scroll_rate[2];
            current_scroll_rate[2] = parseInt(transform_array[4], 10);
            scroll_distance = ((current_scroll_rate[2] - current_scroll_rate[1]) + (current_scroll_rate[1] - current_scroll_rate[0])) / 2;
            event.preventDefault();
            last_touch = event.touches[0].pageX;
            is_move = true;
        }

        function touch_end(event){
            if (!is_move)
                window.location = $(event.currentTarget).attr('href');
            is_move = false;
            slow_scroll_horizontal();
        }

        function init_slider(){
            stage_width = scroller_container.width();
            scroller_links.unbind('touchstart');
            scroller_links.unbind('touchmove');
            scroller_links.unbind('touchend');
            slider_max = 0;
            $(scroller_node).children().each(function (j) {
                children_offsets[j] = slider_max * -1;
                // alert($(this).width());
                slider_max = slider_max + $(this).width() + parseInt($(this).css('paddingLeft'), 10) + parseInt($(this).css('paddingRight'), 10) + parseInt($(this).css('marginLeft'), 10) + parseInt($(this).css('marginRight'), 10) + parseInt($(this).css('borderLeftWidth'), 10) + parseInt($(this).css('borderRightWidth'), 10);
            });
            $(scroller_node).css('width', slider_max + 'px');
            children_offsets[children_offsets.length] = slider_max * -1;
            slider_max = slider_max - stage_width;
            if (slider_max > 0) {
                scroller_links.bind({
                    'touchstart':function(){touch_start(event)},
                    'touchmove':function(){touch_move(event)},
                    'touchend':function(){touch_end(event)}
                });
                set_transform(slider_max * -1);

            } else {
                set_transform(0);
            }
        }

        /* public */
        $.fn.thermoSlider = function(options) {
            settings = jQuery.extend({}, jQuery.fn.thermoSlider.defaults, options);
            scroller_container = $(this);
            scroller_node = scroller_container.children(':first-child');
            scroller_links = scroller_node.children('a');
            init_slider();
            var change_orientation = "onorientationchange" in window,
                    event = change_orientation ? "orientationchange" : "resize";
            window.addEventListener(event, function () {
                setTimeout(init_slider, 200);
            }, false);
        };

        jQuery.fn.thermoSlider.defaults = {
            'elastic_pull_resistance': 0.6,
            'friction_coefficient': 0.92,
            'elastic_friction_coefficient': 0.8,
            'snap_friction_coefficient': 0.92
        };
    }) (jQuery);

    $('.breadcrumbs').thermoSlider();

});