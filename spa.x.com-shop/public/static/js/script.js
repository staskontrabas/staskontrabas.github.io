$(document).ready(function() {

  $('.basket-item__control').click(function(event) {
    event.preventDefault();

    var elemSum = $(this).parent().children('.basket-item__sum');
    var sum = parseInt(elemSum.val(), 10);
    var isMinus = $(this).hasClass('basket-item__control_minus');
    var buttonDisabled = $(this).parent().children('.basket-item__control_minus');

    if (isNaN(sum)) {
      sum = 1;
    }

    if (isMinus){
      --sum;
    } else {
      ++sum;
    }

    if (sum <= 1) {
      sum = 1;
      buttonDisabled.prop('disabled',true);
    } else {
      buttonDisabled.prop('disabled',false);
    }

    elemSum.val(sum);

  });

  controlDisabled();
});

function controlDisabled() {
  $('.basket-item__control-wrapper').each(function(index, el) {
    var elemSum = $(this).children('.basket-item__sum');
    var sum = parseInt(elemSum.val(), 10);
    var buttonDisabled = $(this).children('.basket-item__control_minus');

    if (isNaN(sum)) {
      sum = 1;
    }

    if (sum <= 1) {
      sum = 1;
      buttonDisabled.prop('disabled',true);
    } else {
      buttonDisabled.prop('disabled',false);
    }
  });
}
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
$(document).on("click", ".category-good__item-button, .category-good__select-button", function() {
  return false
});
$(document).ready(function() {
 $(window).on('load', function() {

  $('.radio-group_home .radio__input').change(function(event) {
   
   $('.carousel').trigger('destroy.owl.carousel');
    
    $('.carousel').each(function(index, el) {
       var sliderOwl = $(this),
          sliderParametrs = {},
          attrParametrs = $(this).attr('data-options');
      if (typeof attrParametrs != 'undefined')
        sliderParametrs = JSON.parse(attrParametrs);
      sliderOwl.owlCarousel(sliderParametrs);
    });

   });

 });

});
var markerList = [];

$(window).on('load', function(event) {

  if($('body').find('.pickup__item').length){
    $('.pickup__item').each(function(index, el) {
    var pickupLink = $(this).find('a'),
        markerAddress = pickupLink.find('b').text(),
        markerLink = pickupLink.attr('href'),
        markerTime = pickupLink.find('span').text(),
        markerLat = pickupLink.attr('data-lat'),
        markerLng = pickupLink.attr('data-lng');
        markerList.push({
          lat: Number(markerLat),
          lng: Number(markerLng),
          shortAddres: markerAddress,
          shortTime: markerTime,
          link: markerLink
        });
    });
  }

});

var infoWindows = [];

function initMap() {

  var map = new google.maps.Map(document.getElementById('pickup__map'), {
    zoom: 10,
    center: {lat: 55.755814, lng: 37.617635},
    disableDefaultUI: true
  });

  var markers = [];
  markerList.map(function(location, i) {

  	var contentString = '<a href="'+location.link+'" class="map__link">'
	  	+ '<b>' + location.shortAddres+'</b>'
	  	+ '<br/>'
	  	+ '<span>' + location.shortTime + '</span>'
	  	+ '</a>',
  	infowindow = new google.maps.InfoWindow({
    	content: contentString,
    	pixelOffset: new google.maps.Size(-1,15)
    }),
    icon = {
      url: 'static/svg/marker.svg',
      scaledSize: new google.maps.Size(23, 32)
    },
		marker = new google.maps.Marker({
      position: {lat: location.lat, lng: location.lng},
      icon: icon
    });
    markers.push(marker);
    infoWindows.push(infowindow);
    marker.addListener('click', function() {
      closeAllInfoWindows();
    	shortInfo(marker, infowindow);
	  });

  });

  function closeAllInfoWindows() {
    for (var i=0;i<infoWindows.length;i++) {
       infoWindows[i].close();
    }
  }

  var markerCluster = new MarkerClusterer(map, markers, {
  	// imagePath: 'img/m',
    styles: [{
      width: 53,
      height: 52,
      url: 'static/img/m1.png',
      textColor: 'white',
      textSize: 12
    }]
  });

  function shortInfo(marker, infowindow) {
    infowindow.open(map, marker);
	}

}
$(document).ready(function() {

	$('.pickup .radio__input').bind('click', function(event) {
		if($(this).attr('data-link') == 'js-maps'){
			if(!$('body').hasClass('init-map')){
        if($('body').find('.pickup__item').length){
				  initMap();
        }
				$('body').addClass('init-map');
			}
		}
	});

});
$(window).on('load', function(event) {
  if($('body').find('.pickup-detail__map').length){
      var pickupMap = $('.pickup-detail__map'),
          pickupMapLat = pickupMap.attr('data-lat'),
          markerLat = Number(pickupMapLat),
          pickupMapLng = pickupMap.attr('data-lng'),
          markerLng = Number(pickupMapLng);
          initMapDetail(markerLat,markerLng);
  }
});

function initMapDetail(lat,lng) {

  var map = new google.maps.Map(document.getElementById('js-pickup-detail-map'), {
    zoom: 10,
    center: {lat: lat, lng: lng},
    disableDefaultUI: true,
    scrollwheel: false,
    scaleControl: false
  });

  var iconDetail = {
    url: 'static/svg/marker.svg',
    scaledSize: new google.maps.Size(23, 32)
  },
  markerDetail = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    icon: iconDetail,
    map: map
  });

}
$(document).ready(function() {

	$('.header__menu').click(function(event) {
		if($('body').hasClass('open')){
			$('body').removeClass('open');
			$('body').css('overflow', 'visible');
			$('html').css('overflow', 'visible');
		} else {
			$('body').addClass('open');
			$('body').css('overflow', 'hidden');
			$('html').css('overflow', 'hidden');
		}
		event.preventDefault();
	});

});
$(document).ready(function() {

	var search = $('.search');

	$('a[data-type="open-search"]').bind('click', function(event) {
		if(search.hasClass('show')){
			$(this).removeClass('active');
			search.removeClass('show open_suggest');
		} else {
			$(this).addClass('active');
			search.addClass('show');
		}
	});

	$('.search__input .input').keyup(function(event) {
		if($(this).val().length > 0){
			search.addClass('open_suggest');
		} else {
			search.removeClass('open_suggest');
		}
	});

	$('a[data-type="search-clear"]').bind('click', function(event) {
		search.removeClass('open_suggest');
		$('.search__input .input').val('').focus();
		event.preventDefault();
	});

});
/**
 * Owl Carousel v2.2.1
 * Copyright 2013-2017 David Deutsch
 * Licensed under  ()
 */
/**
 * Owl carousel
 * @version 2.1.6
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;(function($, window, document, undefined) {

  /**
   * Creates a carousel.
   * @class The Owl Carousel.
   * @public
   * @param {HTMLElement|jQuery} element - The element to create the carousel for.
   * @param {Object} [options] - The options
   */
  function Owl(element, options) {

    /**
     * Current settings for the carousel.
     * @public
     */
    this.settings = null;

    /**
     * Current options set by the caller including defaults.
     * @public
     */
    this.options = $.extend({}, Owl.Defaults, options);

    /**
     * Plugin element.
     * @public
     */
    this.$element = $(element);

    /**
     * Proxied event handlers.
     * @protected
     */
    this._handlers = {};

    /**
     * References to the running plugins of this carousel.
     * @protected
     */
    this._plugins = {};

    /**
     * Currently suppressed events to prevent them from beeing retriggered.
     * @protected
     */
    this._supress = {};

    /**
     * Absolute current position.
     * @protected
     */
    this._current = null;

    /**
     * Animation speed in milliseconds.
     * @protected
     */
    this._speed = null;

    /**
     * Coordinates of all items in pixel.
     * @todo The name of this member is missleading.
     * @protected
     */
    this._coordinates = [];

    /**
     * Current breakpoint.
     * @todo Real media queries would be nice.
     * @protected
     */
    this._breakpoint = null;

    /**
     * Current width of the plugin element.
     */
    this._width = null;

    /**
     * All real items.
     * @protected
     */
    this._items = [];

    /**
     * All cloned items.
     * @protected
     */
    this._clones = [];

    /**
     * Merge values of all items.
     * @todo Maybe this could be part of a plugin.
     * @protected
     */
    this._mergers = [];

    /**
     * Widths of all items.
     */
    this._widths = [];

    /**
     * Invalidated parts within the update process.
     * @protected
     */
    this._invalidated = {};

    /**
     * Ordered list of workers for the update process.
     * @protected
     */
    this._pipe = [];

    /**
     * Current state information for the drag operation.
     * @todo #261
     * @protected
     */
    this._drag = {
      time: null,
      target: null,
      pointer: null,
      stage: {
        start: null,
        current: null
      },
      direction: null
    };

    /**
     * Current state information and their tags.
     * @type {Object}
     * @protected
     */
    this._states = {
      current: {},
      tags: {
        'initializing': [ 'busy' ],
        'animating': [ 'busy' ],
        'dragging': [ 'interacting' ]
      }
    };

    $.each([ 'onResize', 'onThrottledResize' ], $.proxy(function(i, handler) {
      this._handlers[handler] = $.proxy(this[handler], this);
    }, this));

    $.each(Owl.Plugins, $.proxy(function(key, plugin) {
      this._plugins[key.charAt(0).toLowerCase() + key.slice(1)]
        = new plugin(this);
    }, this));

    $.each(Owl.Workers, $.proxy(function(priority, worker) {
      this._pipe.push({
        'filter': worker.filter,
        'run': $.proxy(worker.run, this)
      });
    }, this));

    this.setup();
    this.initialize();
  }

  /**
   * Default options for the carousel.
   * @public
   */
  Owl.Defaults = {
    items: 3,
    loop: false,
    center: false,
    rewind: false,

    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    freeDrag: false,

    margin: 0,
    stagePadding: 0,

    merge: false,
    mergeFit: true,
    autoWidth: false,

    startPosition: 0,
    rtl: false,

    smartSpeed: 250,
    fluidSpeed: false,
    dragEndSpeed: false,

    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: window,

    fallbackEasing: 'swing',

    info: false,

    nestedItemSelector: false,
    itemElement: 'div',
    stageElement: 'div',

    refreshClass: 'carousel-refresh',
    loadedClass: 'carousel-loaded',
    loadingClass: 'carousel-loading',
    rtlClass: 'carousel-rtl',
    responsiveClass: 'carousel__responsive',
    dragClass: 'carousel-drag',
    itemClass: 'carousel__item',
    stageClass: 'carousel__stage',
    stageOuterClass: 'carousel__stage-outer',
    grabClass: 'carousel-grab'
  };

  /**
   * Enumeration for width.
   * @public
   * @readonly
   * @enum {String}
   */
  Owl.Width = {
    Default: 'default',
    Inner: 'inner',
    Outer: 'outer'
  };

  /**
   * Enumeration for types.
   * @public
   * @readonly
   * @enum {String}
   */
  Owl.Type = {
    Event: 'event',
    State: 'state'
  };

  /**
   * Contains all registered plugins.
   * @public
   */
  Owl.Plugins = {};

  /**
   * List of workers involved in the update process.
   */
  Owl.Workers = [ {
    filter: [ 'width', 'settings' ],
    run: function() {
      this._width = this.$element.width();
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function(cache) {
      cache.current = this._items && this._items[this.relative(this._current)];
    }
  }, {
    filter: [ 'items', 'settings' ],
    run: function() {
      this.$stage.children('.cloned').remove();
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function(cache) {
      var margin = this.settings.margin || '',
        grid = !this.settings.autoWidth,
        rtl = this.settings.rtl,
        css = {
          'width': 'auto',
          'margin-left': rtl ? margin : '',
          'margin-right': rtl ? '' : margin
        };

      !grid && this.$stage.children().css(css);

      cache.css = css;
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function(cache) {
      var width = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
        merge = null,
        iterator = this._items.length,
        grid = !this.settings.autoWidth,
        widths = [];

      cache.items = {
        merge: false,
        width: width
      };

      while (iterator--) {
        merge = this._mergers[iterator];
        merge = this.settings.mergeFit && Math.min(merge, this.settings.items) || merge;

        cache.items.merge = merge > 1 || cache.items.merge;

        widths[iterator] = !grid ? this._items[iterator].width() : width * merge;
      }

      this._widths = widths;
    }
  }, {
    filter: [ 'items', 'settings' ],
    run: function() {
      var clones = [],
        items = this._items,
        settings = this.settings,
        // TODO: Should be computed from number of min width items in stage
        view = Math.max(settings.items * 2, 4),
        size = Math.ceil(items.length / 2) * 2,
        repeat = settings.loop && items.length ? settings.rewind ? view : Math.max(view, size) : 0,
        append = '',
        prepend = '';

      repeat /= 2;

      while (repeat--) {
        // Switch to only using appended clones
        clones.push(this.normalize(clones.length / 2, true));
        append = append + items[clones[clones.length - 1]][0].outerHTML;
        clones.push(this.normalize(items.length - 1 - (clones.length - 1) / 2, true));
        prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
      }

      this._clones = clones;

      $(append).addClass('cloned').appendTo(this.$stage);
      $(prepend).addClass('cloned').prependTo(this.$stage);
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function() {
      var rtl = this.settings.rtl ? 1 : -1,
        size = this._clones.length + this._items.length,
        iterator = -1,
        previous = 0,
        current = 0,
        coordinates = [];

      while (++iterator < size) {
        previous = coordinates[iterator - 1] || 0;
        current = this._widths[this.relative(iterator)] + this.settings.margin;
        coordinates.push(previous + current * rtl);
      }

      this._coordinates = coordinates;
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function() {
      var padding = this.settings.stagePadding,
        coordinates = this._coordinates,
        css = {
          'width': Math.ceil(Math.abs(coordinates[coordinates.length - 1])) + padding * 2,
          'padding-left': padding || '',
          'padding-right': padding || ''
        };

      this.$stage.css(css);
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function(cache) {
      var iterator = this._coordinates.length,
        grid = !this.settings.autoWidth,
        items = this.$stage.children();

      if (grid && cache.items.merge) {
        while (iterator--) {
          cache.css.width = this._widths[this.relative(iterator)];
          items.eq(iterator).css(cache.css);
        }
      } else if (grid) {
        cache.css.width = cache.items.width;
        items.css(cache.css);
      }
    }
  }, {
    filter: [ 'items' ],
    run: function() {
      this._coordinates.length < 1 && this.$stage.removeAttr('style');
    }
  }, {
    filter: [ 'width', 'items', 'settings' ],
    run: function(cache) {
      cache.current = cache.current ? this.$stage.children().index(cache.current) : 0;
      cache.current = Math.max(this.minimum(), Math.min(this.maximum(), cache.current));
      this.reset(cache.current);
    }
  }, {
    filter: [ 'position' ],
    run: function() {
      this.animate(this.coordinates(this._current));
    }
  }, {
    filter: [ 'width', 'position', 'items', 'settings' ],
    run: function() {
      var rtl = this.settings.rtl ? 1 : -1,
        padding = this.settings.stagePadding * 2,
        begin = this.coordinates(this.current()) + padding,
        end = begin + this.width() * rtl,
        inner, outer, matches = [], i, n;

      for (i = 0, n = this._coordinates.length; i < n; i++) {
        inner = this._coordinates[i - 1] || 0;
        outer = Math.abs(this._coordinates[i]) + padding * rtl;

        if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end)))
          || (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
          matches.push(i);
        }
      }

      this.$stage.children('.active').removeClass('active');
      this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass('active');

      if (this.settings.center) {
        this.$stage.children('.center').removeClass('center');
        this.$stage.children().eq(this.current()).addClass('center');
      }
    }
  } ];

  /**
   * Initializes the carousel.
   * @protected
   */
  Owl.prototype.initialize = function() {
    this.enter('initializing');
    this.trigger('initialize');

    this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

    if (this.settings.autoWidth && !this.is('pre-loading')) {
      var imgs, nestedSelector, width;
      imgs = this.$element.find('img');
      nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
      width = this.$element.children(nestedSelector).width();

      if (imgs.length && width <= 0) {
        this.preloadAutoWidthImages(imgs);
      }
    }

    this.$element.addClass(this.options.loadingClass);

    // create stage
    this.$stage = $('<' + this.settings.stageElement + ' class="' + this.settings.stageClass + '"/>')
      .wrap('<div class="' + this.settings.stageOuterClass + '"/>');

    // append stage
    this.$element.append(this.$stage.parent());

    // append content
    this.replace(this.$element.children().not(this.$stage.parent()));

    // check visibility
    if (this.$element.is(':visible')) {
      // update view
      this.refresh();
    } else {
      // invalidate width
      this.invalidate('width');
    }

    this.$element
      .removeClass(this.options.loadingClass)
      .addClass(this.options.loadedClass);

    // register event handlers
    this.registerEventHandlers();

    this.leave('initializing');
    this.trigger('initialized');
  };

  /**
   * Setups the current settings.
   * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
   * @todo Support for media queries by using `matchMedia` would be nice.
   * @public
   */
  Owl.prototype.setup = function() {
    var viewport = this.viewport(),
      overwrites = this.options.responsive,
      match = -1,
      settings = null;

    if (!overwrites) {
      settings = $.extend({}, this.options);
    } else {
      $.each(overwrites, function(breakpoint) {
        if (breakpoint <= viewport && breakpoint > match) {
          match = Number(breakpoint);
        }
      });

      settings = $.extend({}, this.options, overwrites[match]);
      if (typeof settings.stagePadding === 'function') {
        settings.stagePadding = settings.stagePadding();
      }
      delete settings.responsive;

      // responsive class
      if (settings.responsiveClass) {
        this.$element.attr('class',
          this.$element.attr('class').replace(new RegExp('(' + this.options.responsiveClass + '-)\\S+\\s', 'g'), '$1' + match)
        );
      }
    }

    this.trigger('change', { property: { name: 'settings', value: settings } });
    this._breakpoint = match;
    this.settings = settings;
    this.invalidate('settings');
    this.trigger('changed', { property: { name: 'settings', value: this.settings } });
  };

  /**
   * Updates option logic if necessery.
   * @protected
   */
  Owl.prototype.optionsLogic = function() {
    if (this.settings.autoWidth) {
      this.settings.stagePadding = false;
      this.settings.merge = false;
    }
  };

  /**
   * Prepares an item before add.
   * @todo Rename event parameter `content` to `item`.
   * @protected
   * @returns {jQuery|HTMLElement} - The item container.
   */
  Owl.prototype.prepare = function(item) {
    var event = this.trigger('prepare', { content: item });

    if (!event.data) {
      event.data = $('<' + this.settings.itemElement + '/>')
        .addClass(this.options.itemClass).append(item)
    }

    this.trigger('prepared', { content: event.data });

    return event.data;
  };

  /**
   * Updates the view.
   * @public
   */
  Owl.prototype.update = function() {
    var i = 0,
      n = this._pipe.length,
      filter = $.proxy(function(p) { return this[p] }, this._invalidated),
      cache = {};

    while (i < n) {
      if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
        this._pipe[i].run(cache);
      }
      i++;
    }

    this._invalidated = {};

    !this.is('valid') && this.enter('valid');
  };

  /**
   * Gets the width of the view.
   * @public
   * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
   * @returns {Number} - The width of the view in pixel.
   */
  Owl.prototype.width = function(dimension) {
    dimension = dimension || Owl.Width.Default;
    switch (dimension) {
      case Owl.Width.Inner:
      case Owl.Width.Outer:
        return this._width;
      default:
        return this._width - this.settings.stagePadding * 2 + this.settings.margin;
    }
  };

  /**
   * Refreshes the carousel primarily for adaptive purposes.
   * @public
   */
  Owl.prototype.refresh = function() {
    this.enter('refreshing');
    this.trigger('refresh');

    this.setup();

    this.optionsLogic();

    this.$element.addClass(this.options.refreshClass);

    this.update();

    this.$element.removeClass(this.options.refreshClass);

    this.leave('refreshing');
    this.trigger('refreshed');
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onThrottledResize = function() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate);
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onResize = function() {
    if (!this._items.length) {
      return false;
    }

    if (this._width === this.$element.width()) {
      return false;
    }

    if (!this.$element.is(':visible')) {
      return false;
    }

    this.enter('resizing');

    if (this.trigger('resize').isDefaultPrevented()) {
      this.leave('resizing');
      return false;
    }

    this.invalidate('width');

    this.refresh();

    this.leave('resizing');
    this.trigger('resized');
  };

  /**
   * Registers event handlers.
   * @todo Check `msPointerEnabled`
   * @todo #261
   * @protected
   */
  Owl.prototype.registerEventHandlers = function() {
    if ($.support.transition) {
      this.$stage.on($.support.transition.end + '.owl.core', $.proxy(this.onTransitionEnd, this));
    }

    if (this.settings.responsive !== false) {
      this.on(window, 'resize', this._handlers.onThrottledResize);
    }

    if (this.settings.mouseDrag) {
      this.$element.addClass(this.options.dragClass);
      this.$stage.on('mousedown.owl.core', $.proxy(this.onDragStart, this));
      this.$stage.on('dragstart.owl.core selectstart.owl.core', function() { return false });
    }

    if (this.settings.touchDrag){
      this.$stage.on('touchstart.owl.core', $.proxy(this.onDragStart, this));
      this.$stage.on('touchcancel.owl.core', $.proxy(this.onDragEnd, this));
    }
  };

  /**
   * Handles `touchstart` and `mousedown` events.
   * @todo Horizontal swipe threshold as option
   * @todo #261
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragStart = function(event) {
    var stage = null;

    if (event.which === 3) {
      return;
    }

    if ($.support.transform) {
      stage = this.$stage.css('transform').replace(/.*\(|\)| /g, '').split(',');
      stage = {
        x: stage[stage.length === 16 ? 12 : 4],
        y: stage[stage.length === 16 ? 13 : 5]
      };
    } else {
      stage = this.$stage.position();
      stage = {
        x: this.settings.rtl ?
          stage.left + this.$stage.width() - this.width() + this.settings.margin :
          stage.left,
        y: stage.top
      };
    }

    if (this.is('animating')) {
      $.support.transform ? this.animate(stage.x) : this.$stage.stop()
      this.invalidate('position');
    }

    this.$element.toggleClass(this.options.grabClass, event.type === 'mousedown');

    this.speed(0);

    this._drag.time = new Date().getTime();
    this._drag.target = $(event.target);
    this._drag.stage.start = stage;
    this._drag.stage.current = stage;
    this._drag.pointer = this.pointer(event);

    $(document).on('mouseup.owl.core touchend.owl.core', $.proxy(this.onDragEnd, this));

    $(document).one('mousemove.owl.core touchmove.owl.core', $.proxy(function(event) {
      var delta = this.difference(this._drag.pointer, this.pointer(event));

      $(document).on('mousemove.owl.core touchmove.owl.core', $.proxy(this.onDragMove, this));

      if (Math.abs(delta.x) < Math.abs(delta.y) && this.is('valid')) {
        return;
      }

      event.preventDefault();

      this.enter('dragging');
      this.trigger('drag');
    }, this));
  };

  /**
   * Handles the `touchmove` and `mousemove` events.
   * @todo #261
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragMove = function(event) {
    var minimum = null,
      maximum = null,
      pull = null,
      delta = this.difference(this._drag.pointer, this.pointer(event)),
      stage = this.difference(this._drag.stage.start, delta);

    if (!this.is('dragging')) {
      return;
    }

    event.preventDefault();

    if (this.settings.loop) {
      minimum = this.coordinates(this.minimum());
      maximum = this.coordinates(this.maximum() + 1) - minimum;
      stage.x = (((stage.x - minimum) % maximum + maximum) % maximum) + minimum;
    } else {
      minimum = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
      maximum = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
      pull = this.settings.pullDrag ? -1 * delta.x / 5 : 0;
      stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
    }

    this._drag.stage.current = stage;

    this.animate(stage.x);
  };

  /**
   * Handles the `touchend` and `mouseup` events.
   * @todo #261
   * @todo Threshold for click event
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragEnd = function(event) {
    var delta = this.difference(this._drag.pointer, this.pointer(event)),
      stage = this._drag.stage.current,
      direction = delta.x > 0 ^ this.settings.rtl ? 'left' : 'right';

    $(document).off('.owl.core');

    this.$element.removeClass(this.options.grabClass);

    if (delta.x !== 0 && this.is('dragging') || !this.is('valid')) {
      this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
      this.current(this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction));
      this.invalidate('position');
      this.update();

      this._drag.direction = direction;

      if (Math.abs(delta.x) > 3 || new Date().getTime() - this._drag.time > 300) {
        this._drag.target.one('click.owl.core', function() { return false; });
      }
    }

    if (!this.is('dragging')) {
      return;
    }

    this.leave('dragging');
    this.trigger('dragged');
  };

  /**
   * Gets absolute position of the closest item for a coordinate.
   * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
   * @protected
   * @param {Number} coordinate - The coordinate in pixel.
   * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
   * @return {Number} - The absolute position of the closest item.
   */
  Owl.prototype.closest = function(coordinate, direction) {
    var position = -1,
      pull = 30,
      width = this.width(),
      coordinates = this.coordinates();

    if (!this.settings.freeDrag) {
      // check closest item
      $.each(coordinates, $.proxy(function(index, value) {
        // on a left pull, check on current index
        if (direction === 'left' && coordinate > value - pull && coordinate < value + pull) {
          position = index;
        // on a right pull, check on previous index
        // to do so, subtract width from value and set position = index + 1
        } else if (direction === 'right' && coordinate > value - width - pull && coordinate < value - width + pull) {
          position = index + 1;
        } else if (this.op(coordinate, '<', value)
          && this.op(coordinate, '>', coordinates[index + 1] || value - width)) {
          position = direction === 'left' ? index + 1 : index;
        }
        return position === -1;
      }, this));
    }

    if (!this.settings.loop) {
      // non loop boundries
      if (this.op(coordinate, '>', coordinates[this.minimum()])) {
        position = coordinate = this.minimum();
      } else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
        position = coordinate = this.maximum();
      }
    }

    return position;
  };

  /**
   * Animates the stage.
   * @todo #270
   * @public
   * @param {Number} coordinate - The coordinate in pixels.
   */
  Owl.prototype.animate = function(coordinate) {
    var animate = this.speed() > 0;

    this.is('animating') && this.onTransitionEnd();

    if (animate) {
      this.enter('animating');
      this.trigger('translate');
    }

    if ($.support.transform3d && $.support.transition) {
      this.$stage.css({
        transform: 'translate3d(' + coordinate + 'px,0px,0px)',
        transition: (this.speed() / 1000) + 's'
      });
    } else if (animate) {
      this.$stage.animate({
        left: coordinate + 'px'
      }, this.speed(), this.settings.fallbackEasing, $.proxy(this.onTransitionEnd, this));
    } else {
      this.$stage.css({
        left: coordinate + 'px'
      });
    }
  };

  /**
   * Checks whether the carousel is in a specific state or not.
   * @param {String} state - The state to check.
   * @returns {Boolean} - The flag which indicates if the carousel is busy.
   */
  Owl.prototype.is = function(state) {
    return this._states.current[state] && this._states.current[state] > 0;
  };

  /**
   * Sets the absolute position of the current item.
   * @public
   * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
   * @returns {Number} - The absolute position of the current item.
   */
  Owl.prototype.current = function(position) {
    if (position === undefined) {
      return this._current;
    }

    if (this._items.length === 0) {
      return undefined;
    }

    position = this.normalize(position);

    if (this._current !== position) {
      var event = this.trigger('change', { property: { name: 'position', value: position } });

      if (event.data !== undefined) {
        position = this.normalize(event.data);
      }

      this._current = position;

      this.invalidate('position');

      this.trigger('changed', { property: { name: 'position', value: this._current } });
    }

    return this._current;
  };

  /**
   * Invalidates the given part of the update routine.
   * @param {String} [part] - The part to invalidate.
   * @returns {Array.<String>} - The invalidated parts.
   */
  Owl.prototype.invalidate = function(part) {
    if ($.type(part) === 'string') {
      this._invalidated[part] = true;
      this.is('valid') && this.leave('valid');
    }
    return $.map(this._invalidated, function(v, i) { return i });
  };

  /**
   * Resets the absolute position of the current item.
   * @public
   * @param {Number} position - The absolute position of the new item.
   */
  Owl.prototype.reset = function(position) {
    position = this.normalize(position);

    if (position === undefined) {
      return;
    }

    this._speed = 0;
    this._current = position;

    this.suppress([ 'translate', 'translated' ]);

    this.animate(this.coordinates(position));

    this.release([ 'translate', 'translated' ]);
  };

  /**
   * Normalizes an absolute or a relative position of an item.
   * @public
   * @param {Number} position - The absolute or relative position to normalize.
   * @param {Boolean} [relative=false] - Whether the given position is relative or not.
   * @returns {Number} - The normalized position.
   */
  Owl.prototype.normalize = function(position, relative) {
    var n = this._items.length,
      m = relative ? 0 : this._clones.length;

    if (!this.isNumeric(position) || n < 1) {
      position = undefined;
    } else if (position < 0 || position >= n + m) {
      position = ((position - m / 2) % n + n) % n + m / 2;
    }

    return position;
  };

  /**
   * Converts an absolute position of an item into a relative one.
   * @public
   * @param {Number} position - The absolute position to convert.
   * @returns {Number} - The converted position.
   */
  Owl.prototype.relative = function(position) {
    position -= this._clones.length / 2;
    return this.normalize(position, true);
  };

  /**
   * Gets the maximum position for the current item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.maximum = function(relative) {
    var settings = this.settings,
      maximum = this._coordinates.length,
      iterator,
      reciprocalItemsWidth,
      elementWidth;

    if (settings.loop) {
      maximum = this._clones.length / 2 + this._items.length - 1;
    } else if (settings.autoWidth || settings.merge) {
      iterator = this._items.length;
      reciprocalItemsWidth = this._items[--iterator].width();
      elementWidth = this.$element.width();
      while (iterator--) {
        reciprocalItemsWidth += this._items[iterator].width() + this.settings.margin;
        if (reciprocalItemsWidth > elementWidth) {
          break;
        }
      }
      maximum = iterator + 1;
    } else if (settings.center) {
      maximum = this._items.length - 1;
    } else {
      maximum = this._items.length - settings.items;
    }

    if (relative) {
      maximum -= this._clones.length / 2;
    }

    return Math.max(maximum, 0);
  };

  /**
   * Gets the minimum position for the current item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.minimum = function(relative) {
    return relative ? 0 : this._clones.length / 2;
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.items = function(position) {
    if (position === undefined) {
      return this._items.slice();
    }

    position = this.normalize(position, true);
    return this._items[position];
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.mergers = function(position) {
    if (position === undefined) {
      return this._mergers.slice();
    }

    position = this.normalize(position, true);
    return this._mergers[position];
  };

  /**
   * Gets the absolute positions of clones for an item.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
   */
  Owl.prototype.clones = function(position) {
    var odd = this._clones.length / 2,
      even = odd + this._items.length,
      map = function(index) { return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2 };

    if (position === undefined) {
      return $.map(this._clones, function(v, i) { return map(i) });
    }

    return $.map(this._clones, function(v, i) { return v === position ? map(i) : null });
  };

  /**
   * Sets the current animation speed.
   * @public
   * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
   * @returns {Number} - The current animation speed in milliseconds.
   */
  Owl.prototype.speed = function(speed) {
    if (speed !== undefined) {
      this._speed = speed;
    }

    return this._speed;
  };

  /**
   * Gets the coordinate of an item.
   * @todo The name of this method is missleanding.
   * @public
   * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
   * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
   */
  Owl.prototype.coordinates = function(position) {
    var multiplier = 1,
      newPosition = position - 1,
      coordinate;

    if (position === undefined) {
      return $.map(this._coordinates, $.proxy(function(coordinate, index) {
        return this.coordinates(index);
      }, this));
    }

    if (this.settings.center) {
      if (this.settings.rtl) {
        multiplier = -1;
        newPosition = position + 1;
      }

      coordinate = this._coordinates[position];
      coordinate += (this.width() - coordinate + (this._coordinates[newPosition] || 0)) / 2 * multiplier;
    } else {
      coordinate = this._coordinates[newPosition] || 0;
    }

    coordinate = Math.ceil(coordinate);

    return coordinate;
  };

  /**
   * Calculates the speed for a translation.
   * @protected
   * @param {Number} from - The absolute position of the start item.
   * @param {Number} to - The absolute position of the target item.
   * @param {Number} [factor=undefined] - The time factor in milliseconds.
   * @returns {Number} - The time in milliseconds for the translation.
   */
  Owl.prototype.duration = function(from, to, factor) {
    if (factor === 0) {
      return 0;
    }

    return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
  };

  /**
   * Slides to the specified item.
   * @public
   * @param {Number} position - The position of the item.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.to = function(position, speed) {
    var current = this.current(),
      revert = null,
      distance = position - this.relative(current),
      direction = (distance > 0) - (distance < 0),
      items = this._items.length,
      minimum = this.minimum(),
      maximum = this.maximum();

    if (this.settings.loop) {
      if (!this.settings.rewind && Math.abs(distance) > items / 2) {
        distance += direction * -1 * items;
      }

      position = current + distance;
      revert = ((position - minimum) % items + items) % items + minimum;

      if (revert !== position && revert - distance <= maximum && revert - distance > 0) {
        current = revert - distance;
        position = revert;
        this.reset(current);
      }
    } else if (this.settings.rewind) {
      maximum += 1;
      position = (position % maximum + maximum) % maximum;
    } else {
      position = Math.max(minimum, Math.min(maximum, position));
    }

    this.speed(this.duration(current, position, speed));
    this.current(position);

    if (this.$element.is(':visible')) {
      this.update();
    }
  };

  /**
   * Slides to the next item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.next = function(speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) + 1, speed);
  };

  /**
   * Slides to the previous item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.prev = function(speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) - 1, speed);
  };

  /**
   * Handles the end of an animation.
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onTransitionEnd = function(event) {

    // if css2 animation then event object is undefined
    if (event !== undefined) {
      event.stopPropagation();

      // Catch only owl-stage transitionEnd event
      if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
        return false;
      }
    }

    this.leave('animating');
    this.trigger('translated');
  };

  /**
   * Gets viewport width.
   * @protected
   * @return {Number} - The width in pixel.
   */
  Owl.prototype.viewport = function() {
    var width;
    if (this.options.responsiveBaseElement !== window) {
      width = $(this.options.responsiveBaseElement).width();
    } else if (window.innerWidth) {
      width = window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      width = document.documentElement.clientWidth;
    } else {
      console.warn('Can not detect viewport width.');
    }
    return width;
  };

  /**
   * Replaces the current content.
   * @public
   * @param {HTMLElement|jQuery|String} content - The new content.
   */
  Owl.prototype.replace = function(content) {
    this.$stage.empty();
    this._items = [];

    if (content) {
      content = (content instanceof jQuery) ? content : $(content);
    }

    if (this.settings.nestedItemSelector) {
      content = content.find('.' + this.settings.nestedItemSelector);
    }

    content.filter(function() {
      return this.nodeType === 1;
    }).each($.proxy(function(index, item) {
      item = this.prepare(item);
      this.$stage.append(item);
      this._items.push(item);
      this._mergers.push(item.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
    }, this));

    this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

    this.invalidate('items');
  };

  /**
   * Adds an item.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {HTMLElement|jQuery|String} content - The item content to add.
   * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
   */
  Owl.prototype.add = function(content, position) {
    var current = this.relative(this._current);

    position = position === undefined ? this._items.length : this.normalize(position, true);
    content = content instanceof jQuery ? content : $(content);

    this.trigger('add', { content: content, position: position });

    content = this.prepare(content);

    if (this._items.length === 0 || position === this._items.length) {
      this._items.length === 0 && this.$stage.append(content);
      this._items.length !== 0 && this._items[position - 1].after(content);
      this._items.push(content);
      this._mergers.push(content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
    } else {
      this._items[position].before(content);
      this._items.splice(position, 0, content);
      this._mergers.splice(position, 0, content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
    }

    this._items[current] && this.reset(this._items[current].index());

    this.invalidate('items');

    this.trigger('added', { content: content, position: position });
  };

  /**
   * Removes an item by its position.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {Number} position - The relative position of the item to remove.
   */
  Owl.prototype.remove = function(position) {
    position = this.normalize(position, true);

    if (position === undefined) {
      return;
    }

    this.trigger('remove', { content: this._items[position], position: position });

    this._items[position].remove();
    this._items.splice(position, 1);
    this._mergers.splice(position, 1);

    this.invalidate('items');

    this.trigger('removed', { content: null, position: position });
  };

  /**
   * Preloads images with auto width.
   * @todo Replace by a more generic approach
   * @protected
   */
  Owl.prototype.preloadAutoWidthImages = function(images) {
    images.each($.proxy(function(i, element) {
      this.enter('pre-loading');
      element = $(element);
      $(new Image()).one('load', $.proxy(function(e) {
        element.attr('src', e.target.src);
        element.css('opacity', 1);
        this.leave('pre-loading');
        !this.is('pre-loading') && !this.is('initializing') && this.refresh();
      }, this)).attr('src', element.attr('src') || element.attr('data-src') || element.attr('data-src-retina'));
    }, this));
  };

  /**
   * Destroys the carousel.
   * @public
   */
  Owl.prototype.destroy = function() {

    this.$element.off('.owl.core');
    this.$stage.off('.owl.core');
    $(document).off('.owl.core');

    if (this.settings.responsive !== false) {
      window.clearTimeout(this.resizeTimer);
      this.off(window, 'resize', this._handlers.onThrottledResize);
    }

    for (var i in this._plugins) {
      this._plugins[i].destroy();
    }

    this.$stage.children('.cloned').remove();

    this.$stage.unwrap();
    this.$stage.children().contents().unwrap();
    this.$stage.children().unwrap();

    this.$element
      .removeClass(this.options.refreshClass)
      .removeClass(this.options.loadingClass)
      .removeClass(this.options.loadedClass)
      .removeClass(this.options.rtlClass)
      .removeClass(this.options.dragClass)
      .removeClass(this.options.grabClass)
      .attr('class', this.$element.attr('class').replace(new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'), ''))
      .removeData('owl.carousel');
  };

  /**
   * Operators to calculate right-to-left and left-to-right.
   * @protected
   * @param {Number} [a] - The left side operand.
   * @param {String} [o] - The operator.
   * @param {Number} [b] - The right side operand.
   */
  Owl.prototype.op = function(a, o, b) {
    var rtl = this.settings.rtl;
    switch (o) {
      case '<':
        return rtl ? a > b : a < b;
      case '>':
        return rtl ? a < b : a > b;
      case '>=':
        return rtl ? a <= b : a >= b;
      case '<=':
        return rtl ? a >= b : a <= b;
      default:
        break;
    }
  };

  /**
   * Attaches to an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The event handler to attach.
   * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
   */
  Owl.prototype.on = function(element, event, listener, capture) {
    if (element.addEventListener) {
      element.addEventListener(event, listener, capture);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, listener);
    }
  };

  /**
   * Detaches from an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The attached event handler to detach.
   * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
   */
  Owl.prototype.off = function(element, event, listener, capture) {
    if (element.removeEventListener) {
      element.removeEventListener(event, listener, capture);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, listener);
    }
  };

  /**
   * Triggers a public event.
   * @todo Remove `status`, `relatedTarget` should be used instead.
   * @protected
   * @param {String} name - The event name.
   * @param {*} [data=null] - The event data.
   * @param {String} [namespace=carousel] - The event namespace.
   * @param {String} [state] - The state which is associated with the event.
   * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
   * @returns {Event} - The event arguments.
   */
  Owl.prototype.trigger = function(name, data, namespace, state, enter) {
    var status = {
      item: { count: this._items.length, index: this.current() }
    }, handler = $.camelCase(
      $.grep([ 'on', name, namespace ], function(v) { return v })
        .join('-').toLowerCase()
    ), event = $.Event(
      [ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(),
      $.extend({ relatedTarget: this }, status, data)
    );

    if (!this._supress[name]) {
      $.each(this._plugins, function(name, plugin) {
        if (plugin.onTrigger) {
          plugin.onTrigger(event);
        }
      });

      this.register({ type: Owl.Type.Event, name: name });
      this.$element.trigger(event);

      if (this.settings && typeof this.settings[handler] === 'function') {
        this.settings[handler].call(this, event);
      }
    }

    return event;
  };

  /**
   * Enters a state.
   * @param name - The state name.
   */
  Owl.prototype.enter = function(name) {
    $.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
      if (this._states.current[name] === undefined) {
        this._states.current[name] = 0;
      }

      this._states.current[name]++;
    }, this));
  };

  /**
   * Leaves a state.
   * @param name - The state name.
   */
  Owl.prototype.leave = function(name) {
    $.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
      this._states.current[name]--;
    }, this));
  };

  /**
   * Registers an event or state.
   * @public
   * @param {Object} object - The event or state to register.
   */
  Owl.prototype.register = function(object) {
    if (object.type === Owl.Type.Event) {
      if (!$.event.special[object.name]) {
        $.event.special[object.name] = {};
      }

      if (!$.event.special[object.name].owl) {
        var _default = $.event.special[object.name]._default;
        $.event.special[object.name]._default = function(e) {
          if (_default && _default.apply && (!e.namespace || e.namespace.indexOf('owl') === -1)) {
            return _default.apply(this, arguments);
          }
          return e.namespace && e.namespace.indexOf('owl') > -1;
        };
        $.event.special[object.name].owl = true;
      }
    } else if (object.type === Owl.Type.State) {
      if (!this._states.tags[object.name]) {
        this._states.tags[object.name] = object.tags;
      } else {
        this._states.tags[object.name] = this._states.tags[object.name].concat(object.tags);
      }

      this._states.tags[object.name] = $.grep(this._states.tags[object.name], $.proxy(function(tag, i) {
        return $.inArray(tag, this._states.tags[object.name]) === i;
      }, this));
    }
  };

  /**
   * Suppresses events.
   * @protected
   * @param {Array.<String>} events - The events to suppress.
   */
  Owl.prototype.suppress = function(events) {
    $.each(events, $.proxy(function(index, event) {
      this._supress[event] = true;
    }, this));
  };

  /**
   * Releases suppressed events.
   * @protected
   * @param {Array.<String>} events - The events to release.
   */
  Owl.prototype.release = function(events) {
    $.each(events, $.proxy(function(index, event) {
      delete this._supress[event];
    }, this));
  };

  /**
   * Gets unified pointer coordinates from event.
   * @todo #261
   * @protected
   * @param {Event} - The `mousedown` or `touchstart` event.
   * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
   */
  Owl.prototype.pointer = function(event) {
    var result = { x: null, y: null };

    event = event.originalEvent || event || window.event;

    event = event.touches && event.touches.length ?
      event.touches[0] : event.changedTouches && event.changedTouches.length ?
        event.changedTouches[0] : event;

    if (event.pageX) {
      result.x = event.pageX;
      result.y = event.pageY;
    } else {
      result.x = event.clientX;
      result.y = event.clientY;
    }

    return result;
  };

  /**
   * Determines if the input is a Number or something that can be coerced to a Number
   * @protected
   * @param {Number|String|Object|Array|Boolean|RegExp|Function|Symbol} - The input to be tested
   * @returns {Boolean} - An indication if the input is a Number or can be coerced to a Number
   */
  Owl.prototype.isNumeric = function(number) {
    return !isNaN(parseFloat(number));
  };

  /**
   * Gets the difference of two vectors.
   * @todo #261
   * @protected
   * @param {Object} - The first vector.
   * @param {Object} - The second vector.
   * @returns {Object} - The difference.
   */
  Owl.prototype.difference = function(first, second) {
    return {
      x: first.x - second.x,
      y: first.y - second.y
    };
  };

  /**
   * The jQuery Plugin for the Owl Carousel
   * @todo Navigation plugin `next` and `prev`
   * @public
   */
  $.fn.owlCarousel = function(option) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
      var $this = $(this),
        data = $this.data('owl.carousel');

      if (!data) {
        data = new Owl(this, typeof option == 'object' && option);
        $this.data('owl.carousel', data);

        $.each([
          'next', 'prev', 'to', 'destroy', 'refresh', 'replace', 'add', 'remove'
        ], function(i, event) {
          data.register({ type: Owl.Type.Event, name: event });
          data.$element.on(event + '.owl.carousel.core', $.proxy(function(e) {
            if (e.namespace && e.relatedTarget !== this) {
              this.suppress([ event ]);
              data[event].apply(this, [].slice.call(arguments, 1));
              this.release([ event ]);
            }
          }, data));
        });
      }

      if (typeof option == 'string' && option.charAt(0) !== '_') {
        data[option].apply(data, args);
      }
    });
  };

  /**
   * The constructor for the jQuery Plugin
   * @public
   */
  $.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the auto refresh plugin.
   * @class The Auto Refresh Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var AutoRefresh = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Refresh interval.
     * @protected
     * @type {number}
     */
    this._interval = null;

    /**
     * Whether the element is currently visible or not.
     * @protected
     * @type {Boolean}
     */
    this._visible = null;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.autoRefresh) {
          this.watch();
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  AutoRefresh.Defaults = {
    autoRefresh: true,
    autoRefreshInterval: 500
  };

  /**
   * Watches the element.
   */
  AutoRefresh.prototype.watch = function() {
    if (this._interval) {
      return;
    }

    this._visible = this._core.$element.is(':visible');
    this._interval = window.setInterval($.proxy(this.refresh, this), this._core.settings.autoRefreshInterval);
  };

  /**
   * Refreshes the element.
   */
  AutoRefresh.prototype.refresh = function() {
    if (this._core.$element.is(':visible') === this._visible) {
      return;
    }

    this._visible = !this._visible;

    this._core.$element.toggleClass('carousel-hidden', !this._visible);

    this._visible && (this._core.invalidate('width') && this._core.refresh());
  };

  /**
   * Destroys the plugin.
   */
  AutoRefresh.prototype.destroy = function() {
    var handler, property;

    window.clearInterval(this._interval);

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the lazy plugin.
   * @class The Lazy Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Lazy = function(carousel) {

    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Already loaded items.
     * @protected
     * @type {Array.<jQuery>}
     */
    this._loaded = [];

    /**
     * Event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel change.owl.carousel resized.owl.carousel': $.proxy(function(e) {
        if (!e.namespace) {
          return;
        }

        if (!this._core.settings || !this._core.settings.lazyLoad) {
          return;
        }

        if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
          var settings = this._core.settings,
            n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
            i = ((settings.center && n * -1) || 0),
            position = (e.property && e.property.value !== undefined ? e.property.value : this._core.current()) + i,
            clones = this._core.clones().length,
            load = $.proxy(function(i, v) { this.load(v) }, this);

          while (i++ < n) {
            this.load(clones / 2 + this._core.relative(position));
            clones && $.each(this._core.clones(this._core.relative(position)), load);
            position++;
          }
        }
      }, this)
    };

    // set the default options
    this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

    // register event handler
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  Lazy.Defaults = {
    lazyLoad: false
  };

  /**
   * Loads all resources of an item at the specified position.
   * @param {Number} position - The absolute position of the item.
   * @protected
   */
  Lazy.prototype.load = function(position) {
    var $item = this._core.$stage.children().eq(position),
      $elements = $item && $item.find('.carousel__lazy');

    if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
      return;
    }

    $elements.each($.proxy(function(index, element) {
      var $element = $(element), image,
        url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src');

      this._core.trigger('load', { element: $element, url: url }, 'lazy');

      if ($element.is('img')) {
        $element.one('load.owl.lazy', $.proxy(function() {
          $element.css('opacity', 1);
          this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
        }, this)).attr('src', url);
      } else {
        image = new Image();
        image.onload = $.proxy(function() {
          $element.css({
            'background-image': 'url("' + url + '")',
            'opacity': '1'
          });
          this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
        }, this);
        image.src = url;
      }
    }, this));

    this._loaded.push($item.get(0));
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Lazy.prototype.destroy = function() {
    var handler, property;

    for (handler in this.handlers) {
      this._core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the auto height plugin.
   * @class The Auto Height Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var AutoHeight = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.autoHeight) {
          this.update();
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.autoHeight && e.property.name == 'position'){
          this.update();
        }
      }, this),
      'loaded.owl.lazy': $.proxy(function(e) {
        if (e.namespace && this._core.settings.autoHeight
          && e.element.closest('.' + this._core.settings.itemClass).index() === this._core.current()) {
          this.update();
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  AutoHeight.Defaults = {
    autoHeight: false,
    autoHeightClass: 'carousel__height'
  };

  /**
   * Updates the view.
   */
  AutoHeight.prototype.update = function() {
    var start = this._core._current,
      end = start + this._core.settings.items,
      visible = this._core.$stage.children().toArray().slice(start, end),
      heights = [],
      maxheight = 0;

    $.each(visible, function(index, item) {
      heights.push($(item).height());
    });

    maxheight = Math.max.apply(null, heights);

    this._core.$stage.parent()
      .height(maxheight)
      .addClass(this._core.settings.autoHeightClass);
  };

  AutoHeight.prototype.destroy = function() {
    var handler, property;

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the video plugin.
   * @class The Video Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Video = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Cache all video URLs.
     * @protected
     * @type {Object}
     */
    this._videos = {};

    /**
     * Current playing item.
     * @protected
     * @type {jQuery}
     */
    this._playing = null;

    /**
     * All event handlers.
     * @todo The cloned content removale is too late
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel': $.proxy(function(e) {
        if (e.namespace) {
          this._core.register({ type: 'state', name: 'playing', tags: [ 'interacting' ] });
        }
      }, this),
      'resize.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
          e.preventDefault();
        }
      }, this),
      'refreshed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.is('resizing')) {
          this._core.$stage.find('.cloned .carousel__video-frame').remove();
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && e.property.name === 'position' && this._playing) {
          this.stop();
        }
      }, this),
      'prepared.owl.carousel': $.proxy(function(e) {
        if (!e.namespace) {
          return;
        }

        var $element = $(e.content).find('.owl-video');

        if ($element.length) {
          $element.css('display', 'none');
          this.fetch($element, $(e.content));
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Video.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);

    this._core.$element.on('click.owl.video', '.carousel__video-play-icon', $.proxy(function(e) {
      this.play(e);
    }, this));
  };

  /**
   * Default options.
   * @public
   */
  Video.Defaults = {
    video: false,
    videoHeight: false,
    videoWidth: false
  };

  /**
   * Gets the video ID and the type (YouTube/Vimeo/vzaar only).
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {jQuery} item - The item containing the video.
   */
  Video.prototype.fetch = function(target, item) {
      var type = (function() {
          if (target.attr('data-vimeo-id')) {
            return 'vimeo';
          } else if (target.attr('data-vzaar-id')) {
            return 'vzaar'
          } else {
            return 'youtube';
          }
        })(),
        id = target.attr('data-vimeo-id') || target.attr('data-youtube-id') || target.attr('data-vzaar-id'),
        width = target.attr('data-width') || this._core.settings.videoWidth,
        height = target.attr('data-height') || this._core.settings.videoHeight,
        url = target.attr('href');

    if (url) {

      /*
          Parses the id's out of the following urls (and probably more):
          https://www.youtube.com/watch?v=:id
          https://youtu.be/:id
          https://vimeo.com/:id
          https://vimeo.com/channels/:channel/:id
          https://vimeo.com/groups/:group/videos/:id
          https://app.vzaar.com/videos/:id

          Visual example: https://regexper.com/#(http%3A%7Chttps%3A%7C)%5C%2F%5C%2F(player.%7Cwww.%7Capp.)%3F(vimeo%5C.com%7Cyoutu(be%5C.com%7C%5C.be%7Cbe%5C.googleapis%5C.com)%7Cvzaar%5C.com)%5C%2F(video%5C%2F%7Cvideos%5C%2F%7Cembed%5C%2F%7Cchannels%5C%2F.%2B%5C%2F%7Cgroups%5C%2F.%2B%5C%2F%7Cwatch%5C%3Fv%3D%7Cv%5C%2F)%3F(%5BA-Za-z0-9._%25-%5D*)(%5C%26%5CS%2B)%3F
      */

      id = url.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

      if (id[3].indexOf('youtu') > -1) {
        type = 'youtube';
      } else if (id[3].indexOf('vimeo') > -1) {
        type = 'vimeo';
      } else if (id[3].indexOf('vzaar') > -1) {
        type = 'vzaar';
      } else {
        throw new Error('Video URL not supported.');
      }
      id = id[6];
    } else {
      throw new Error('Missing video URL.');
    }

    this._videos[url] = {
      type: type,
      id: id,
      width: width,
      height: height
    };

    item.attr('data-video', url);

    this.thumbnail(target, this._videos[url]);
  };

  /**
   * Creates video thumbnail.
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {Object} info - The video info object.
   * @see `fetch`
   */
  Video.prototype.thumbnail = function(target, video) {
    var tnLink,
      icon,
      path,
      dimensions = video.width && video.height ? 'style="width:' + video.width + 'px;height:' + video.height + 'px;"' : '',
      customTn = target.find('img'),
      srcType = 'src',
      lazyClass = '',
      settings = this._core.settings,
      create = function(path) {
        icon = '<div class="carousel__video-play-icon"></div>';

        if (settings.lazyLoad) {
          tnLink = '<div class="carousel__video-tn ' + lazyClass + '" ' + srcType + '="' + path + '"></div>';
        } else {
          tnLink = '<div class="carousel__video-tn" style="opacity:1;background-image:url(' + path + ')"></div>';
        }
        target.after(tnLink);
        target.after(icon);
      };

    // wrap video content into carousel__video-wrapper div
    target.wrap('<div class="carousel__video-wrapper"' + dimensions + '></div>');

    if (this._core.settings.lazyLoad) {
      srcType = 'data-src';
      lazyClass = 'carousel__lazy';
    }

    // custom thumbnail
    if (customTn.length) {
      create(customTn.attr(srcType));
      customTn.remove();
      return false;
    }

    if (video.type === 'youtube') {
      path = "//img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
      create(path);
    } else if (video.type === 'vimeo') {
      $.ajax({
        type: 'GET',
        url: '//vimeo.com/api/v2/video/' + video.id + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data) {
          path = data[0].thumbnail_large;
          create(path);
        }
      });
    } else if (video.type === 'vzaar') {
      $.ajax({
        type: 'GET',
        url: '//vzaar.com/api/videos/' + video.id + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data) {
          path = data.framegrab_url;
          create(path);
        }
      });
    }
  };

  /**
   * Stops the current video.
   * @public
   */
  Video.prototype.stop = function() {
    this._core.trigger('stop', null, 'video');
    this._playing.find('.carousel__video-frame').remove();
    this._playing.removeClass('carousel__video-playing');
    this._playing = null;
    this._core.leave('playing');
    this._core.trigger('stopped', null, 'video');
  };

  /**
   * Starts the current video.
   * @public
   * @param {Event} event - The event arguments.
   */
  Video.prototype.play = function(event) {
    var target = $(event.target),
      item = target.closest('.' + this._core.settings.itemClass),
      video = this._videos[item.attr('data-video')],
      width = video.width || '100%',
      height = video.height || this._core.$stage.height(),
      html;

    if (this._playing) {
      return;
    }

    this._core.enter('playing');
    this._core.trigger('play', null, 'video');

    item = this._core.items(this._core.relative(item.index()));

    this._core.reset(item.index());

    if (video.type === 'youtube') {
      html = '<iframe width="' + width + '" height="' + height + '" src="//www.youtube.com/embed/' +
        video.id + '?autoplay=1&rel=0&v=' + video.id + '" frameborder="0" allowfullscreen></iframe>';
    } else if (video.type === 'vimeo') {
      html = '<iframe src="//player.vimeo.com/video/' + video.id +
        '?autoplay=1" width="' + width + '" height="' + height +
        '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    } else if (video.type === 'vzaar') {
      html = '<iframe frameborder="0"' + 'height="' + height + '"' + 'width="' + width +
        '" allowfullscreen mozallowfullscreen webkitAllowFullScreen ' +
        'src="//view.vzaar.com/' + video.id + '/player?autoplay=true"></iframe>';
    }

    $('<div class="carousel__video-frame">' + html + '</div>').insertAfter(item.find('.owl-video'));

    this._playing = item.addClass('carousel__video-playing');
  };

  /**
   * Checks whether an video is currently in full screen mode or not.
   * @todo Bad style because looks like a readonly method but changes members.
   * @protected
   * @returns {Boolean}
   */
  Video.prototype.isInFullScreen = function() {
    var element = document.fullscreenElement || document.mozFullScreenElement ||
        document.webkitFullscreenElement;

    return element && $(element).parent().hasClass('carousel__video-frame');
  };

  /**
   * Destroys the plugin.
   */
  Video.prototype.destroy = function() {
    var handler, property;

    this._core.$element.off('click.owl.video');

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the animate plugin.
   * @class The Navigation Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Animate = function(scope) {
    this.core = scope;
    this.core.options = $.extend({}, Animate.Defaults, this.core.options);
    this.swapping = true;
    this.previous = undefined;
    this.next = undefined;

    this.handlers = {
      'change.owl.carousel': $.proxy(function(e) {
        if (e.namespace && e.property.name == 'position') {
          this.previous = this.core.current();
          this.next = e.property.value;
        }
      }, this),
      'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
        if (e.namespace) {
          this.swapping = e.type == 'translated';
        }
      }, this),
      'translate.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
          this.swap();
        }
      }, this)
    };

    this.core.$element.on(this.handlers);
  };

  /**
   * Default options.
   * @public
   */
  Animate.Defaults = {
    animateOut: false,
    animateIn: false
  };

  /**
   * Toggles the animation classes whenever an translations starts.
   * @protected
   * @returns {Boolean|undefined}
   */
  Animate.prototype.swap = function() {

    if (this.core.settings.items !== 1) {
      return;
    }

    if (!$.support.animation || !$.support.transition) {
      return;
    }

    this.core.speed(0);

    var left,
      clear = $.proxy(this.clear, this),
      previous = this.core.$stage.children().eq(this.previous),
      next = this.core.$stage.children().eq(this.next),
      incoming = this.core.settings.animateIn,
      outgoing = this.core.settings.animateOut;

    if (this.core.current() === this.previous) {
      return;
    }

    if (outgoing) {
      left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
      previous.one($.support.animation.end, clear)
        .css( { 'left': left + 'px' } )
        .addClass('carousel__animated carousel__animated-out')
        .addClass(outgoing);
    }

    if (incoming) {
      next.one($.support.animation.end, clear)
        .addClass('carousel__animated carousel__animated-in')
        .addClass(incoming);
    }
  };

  Animate.prototype.clear = function(e) {
    $(e.target).css( { 'left': '' } )
      .removeClass('carousel__animated carousel__animated-out carousel__animated-in')
      .removeClass(this.core.settings.animateIn)
      .removeClass(this.core.settings.animateOut);
    this.core.onTransitionEnd();
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Animate.prototype.destroy = function() {
    var handler, property;

    for (handler in this.handlers) {
      this.core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  /**
   * Creates the autoplay plugin.
   * @class The Autoplay Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Autoplay = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * The autoplay timeout.
     * @type {Timeout}
     */
    this._timeout = null;

    /**
     * Indicates whenever the autoplay is paused.
     * @type {Boolean}
     */
    this._paused = false;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && e.property.name === 'settings') {
          if (this._core.settings.autoplay) {
            this.play();
          } else {
            this.stop();
          }
        } else if (e.namespace && e.property.name === 'position') {
          //console.log('play?', e);
          if (this._core.settings.autoplay) {
            this._setAutoPlayInterval();
          }
        }
      }, this),
      'initialized.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.autoplay) {
          this.play();
        }
      }, this),
      'play.owl.autoplay': $.proxy(function(e, t, s) {
        if (e.namespace) {
          this.play(t, s);
        }
      }, this),
      'stop.owl.autoplay': $.proxy(function(e) {
        if (e.namespace) {
          this.stop();
        }
      }, this),
      'mouseover.owl.autoplay': $.proxy(function() {
        if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
          this.pause();
        }
      }, this),
      'mouseleave.owl.autoplay': $.proxy(function() {
        if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
          this.play();
        }
      }, this),
      'touchstart.owl.core': $.proxy(function() {
        if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
          this.pause();
        }
      }, this),
      'touchend.owl.core': $.proxy(function() {
        if (this._core.settings.autoplayHoverPause) {
          this.play();
        }
      }, this)
    };

    // register event handlers
    this._core.$element.on(this._handlers);

    // set default options
    this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
  };

  /**
   * Default options.
   * @public
   */
  Autoplay.Defaults = {
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: false,
    autoplaySpeed: false
  };

  /**
   * Starts the autoplay.
   * @public
   * @param {Number} [timeout] - The interval before the next animation starts.
   * @param {Number} [speed] - The animation speed for the animations.
   */
  Autoplay.prototype.play = function(timeout, speed) {
    this._paused = false;

    if (this._core.is('rotating')) {
      return;
    }

    this._core.enter('rotating');

    this._setAutoPlayInterval();
  };

  /**
   * Gets a new timeout
   * @private
   * @param {Number} [timeout] - The interval before the next animation starts.
   * @param {Number} [speed] - The animation speed for the animations.
   * @return {Timeout}
   */
  Autoplay.prototype._getNextTimeout = function(timeout, speed) {
    if ( this._timeout ) {
      window.clearTimeout(this._timeout);
    }
    return window.setTimeout($.proxy(function() {
      if (this._paused || this._core.is('busy') || this._core.is('interacting') || document.hidden) {
        return;
      }
      this._core.next(speed || this._core.settings.autoplaySpeed);
    }, this), timeout || this._core.settings.autoplayTimeout);
  };

  /**
   * Sets autoplay in motion.
   * @private
   */
  Autoplay.prototype._setAutoPlayInterval = function() {
    this._timeout = this._getNextTimeout();
  };

  /**
   * Stops the autoplay.
   * @public
   */
  Autoplay.prototype.stop = function() {
    if (!this._core.is('rotating')) {
      return;
    }

    window.clearTimeout(this._timeout);
    this._core.leave('rotating');
  };

  /**
   * Stops the autoplay.
   * @public
   */
  Autoplay.prototype.pause = function() {
    if (!this._core.is('rotating')) {
      return;
    }

    this._paused = true;
  };

  /**
   * Destroys the plugin.
   */
  Autoplay.prototype.destroy = function() {
    var handler, property;

    this.stop();

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
  'use strict';

  /**
   * Creates the navigation plugin.
   * @class The Navigation Plugin
   * @param {Owl} carousel - The Owl Carousel.
   */
  var Navigation = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Indicates whether the plugin is initialized or not.
     * @protected
     * @type {Boolean}
     */
    this._initialized = false;

    /**
     * The current paging indexes.
     * @protected
     * @type {Array}
     */
    this._pages = [];

    /**
     * All DOM elements of the user interface.
     * @protected
     * @type {Object}
     */
    this._controls = {};

    /**
     * Markup for an indicator.
     * @protected
     * @type {Array.<String>}
     */
    this._templates = [];

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * Overridden methods of the carousel.
     * @protected
     * @type {Object}
     */
    this._overrides = {
      next: this._core.next,
      prev: this._core.prev,
      to: this._core.to
    };

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'prepared.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.push('<div class="' + this._core.settings.dotClass + '">' +
            $(e.content).find('[data-dot]').addBack('[data-dot]').attr('data-dot') + '</div>');
        }
      }, this),
      'added.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.splice(e.position, 0, this._templates.pop());
        }
      }, this),
      'remove.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.splice(e.position, 1);
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && e.property.name == 'position') {
          this.draw();
        }
      }, this),
      'initialized.owl.carousel': $.proxy(function(e) {
        if (e.namespace && !this._initialized) {
          this._core.trigger('initialize', null, 'navigation');
          this.initialize();
          this.update();
          this.draw();
          this._initialized = true;
          this._core.trigger('initialized', null, 'navigation');
        }
      }, this),
      'refreshed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._initialized) {
          this._core.trigger('refresh', null, 'navigation');
          this.update();
          this.draw();
          this._core.trigger('refreshed', null, 'navigation');
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

    // register event handlers
    this.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   * @todo Rename `slideBy` to `navBy`
   */
  Navigation.Defaults = {
    nav: false,
    navText: [ 'prev', 'next' ],
    navSpeed: false,
    navElement: 'div',
    navContainer: false,
    navContainerClass: 'carousel__nav',
    navClass: [ 'carousel__prev', 'carousel__next' ],
    slideBy: 1,
    dotClass: 'carousel__dot',
    dotsClass: 'carousel__dots',
    dots: true,
    dotsEach: false,
    dotsData: false,
    dotsSpeed: false,
    dotsContainer: false
  };

  /**
   * Initializes the layout of the plugin and extends the carousel.
   * @protected
   */
  Navigation.prototype.initialize = function() {
    var override,
      settings = this._core.settings;

    // create DOM structure for relative navigation
    this._controls.$relative = (settings.navContainer ? $(settings.navContainer)
      : $('<div>').addClass(settings.navContainerClass).appendTo(this.$element)).addClass('disabled');

    this._controls.$previous = $('<' + settings.navElement + '>')
      .addClass(settings.navClass[0])
      .html(settings.navText[0])
      .prependTo(this._controls.$relative)
      .on('click', $.proxy(function(e) {
        this.prev(settings.navSpeed);
      }, this));
    this._controls.$next = $('<' + settings.navElement + '>')
      .addClass(settings.navClass[1])
      .html(settings.navText[1])
      .appendTo(this._controls.$relative)
      .on('click', $.proxy(function(e) {
        this.next(settings.navSpeed);
      }, this));

    // create DOM structure for absolute navigation
    if (!settings.dotsData) {
      this._templates = [ $('<div>')
        .addClass(settings.dotClass)
        .append($('<span>'))
        .prop('outerHTML') ];
    }

    this._controls.$absolute = (settings.dotsContainer ? $(settings.dotsContainer)
      : $('<div>').addClass(settings.dotsClass).appendTo(this.$element)).addClass('disabled');

    this._controls.$absolute.on('click', 'div', $.proxy(function(e) {
      var index = $(e.target).parent().is(this._controls.$absolute)
        ? $(e.target).index() : $(e.target).parent().index();

      e.preventDefault();

      this.to(index, settings.dotsSpeed);
    }, this));

    // override public methods of the carousel
    for (override in this._overrides) {
      this._core[override] = $.proxy(this[override], this);
    }
  };

  /**
   * Destroys the plugin.
   * @protected
   */
  Navigation.prototype.destroy = function() {
    var handler, control, property, override;

    for (handler in this._handlers) {
      this.$element.off(handler, this._handlers[handler]);
    }
    for (control in this._controls) {
      this._controls[control].remove();
    }
    for (override in this.overides) {
      this._core[override] = this._overrides[override];
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  /**
   * Updates the internal state.
   * @protected
   */
  Navigation.prototype.update = function() {
    var i, j, k,
      lower = this._core.clones().length / 2,
      upper = lower + this._core.items().length,
      maximum = this._core.maximum(true),
      settings = this._core.settings,
      size = settings.center || settings.autoWidth || settings.dotsData
        ? 1 : settings.dotsEach || settings.items;

    if (settings.slideBy !== 'page') {
      settings.slideBy = Math.min(settings.slideBy, settings.items);
    }

    if (settings.dots || settings.slideBy == 'page') {
      this._pages = [];

      for (i = lower, j = 0, k = 0; i < upper; i++) {
        if (j >= size || j === 0) {
          this._pages.push({
            start: Math.min(maximum, i - lower),
            end: i - lower + size - 1
          });
          if (Math.min(maximum, i - lower) === maximum) {
            break;
          }
          j = 0, ++k;
        }
        j += this._core.mergers(this._core.relative(i));
      }
    }
  };

  /**
   * Draws the user interface.
   * @todo The option `dotsData` wont work.
   * @protected
   */
  Navigation.prototype.draw = function() {
    var difference,
      settings = this._core.settings,
      disabled = this._core.items().length <= settings.items,
      index = this._core.relative(this._core.current()),
      loop = settings.loop || settings.rewind;

    this._controls.$relative.toggleClass('disabled', !settings.nav || disabled);

    if (settings.nav) {
      this._controls.$previous.toggleClass('disabled', !loop && index <= this._core.minimum(true));
      this._controls.$next.toggleClass('disabled', !loop && index >= this._core.maximum(true));
    }

    this._controls.$absolute.toggleClass('disabled', !settings.dots || disabled);

    if (settings.dots) {
      difference = this._pages.length - this._controls.$absolute.children().length;

      if (settings.dotsData && difference !== 0) {
        this._controls.$absolute.html(this._templates.join(''));
      } else if (difference > 0) {
        this._controls.$absolute.append(new Array(difference + 1).join(this._templates[0]));
      } else if (difference < 0) {
        this._controls.$absolute.children().slice(difference).remove();
      }

      this._controls.$absolute.find('.active').removeClass('active');
      this._controls.$absolute.children().eq($.inArray(this.current(), this._pages)).addClass('active');
    }
  };

  /**
   * Extends event data.
   * @protected
   * @param {Event} event - The event object which gets thrown.
   */
  Navigation.prototype.onTrigger = function(event) {
    var settings = this._core.settings;

    event.page = {
      index: $.inArray(this.current(), this._pages),
      count: this._pages.length,
      size: settings && (settings.center || settings.autoWidth || settings.dotsData
        ? 1 : settings.dotsEach || settings.items)
    };
  };

  /**
   * Gets the current page position of the carousel.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.current = function() {
    var current = this._core.relative(this._core.current());
    return $.grep(this._pages, $.proxy(function(page, index) {
      return page.start <= current && page.end >= current;
    }, this)).pop();
  };

  /**
   * Gets the current succesor/predecessor position.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.getPosition = function(successor) {
    var position, length,
      settings = this._core.settings;

    if (settings.slideBy == 'page') {
      position = $.inArray(this.current(), this._pages);
      length = this._pages.length;
      successor ? ++position : --position;
      position = this._pages[((position % length) + length) % length].start;
    } else {
      position = this._core.relative(this._core.current());
      length = this._core.items().length;
      successor ? position += settings.slideBy : position -= settings.slideBy;
    }

    return position;
  };

  /**
   * Slides to the next item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.next = function(speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
  };

  /**
   * Slides to the previous item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.prev = function(speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
  };

  /**
   * Slides to the specified item or page.
   * @public
   * @param {Number} position - The position of the item or page.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
   */
  Navigation.prototype.to = function(position, speed, standard) {
    var length;

    if (!standard && this._pages.length) {
      length = this._pages.length;
      $.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
    } else {
      $.proxy(this._overrides.to, this._core)(position, speed);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
  'use strict';

  /**
   * Creates the hash plugin.
   * @class The Hash Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Hash = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Hash index for the items.
     * @protected
     * @type {Object}
     */
    this._hashes = {};

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel': $.proxy(function(e) {
        if (e.namespace && this._core.settings.startPosition === 'URLHash') {
          $(window).trigger('hashchange.owl.navigation');
        }
      }, this),
      'prepared.owl.carousel': $.proxy(function(e) {
        if (e.namespace) {
          var hash = $(e.content).find('[data-hash]').addBack('[data-hash]').attr('data-hash');

          if (!hash) {
            return;
          }

          this._hashes[hash] = e.content;
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.namespace && e.property.name === 'position') {
          var current = this._core.items(this._core.relative(this._core.current())),
            hash = $.map(this._hashes, function(item, hash) {
              return item === current ? hash : null;
            }).join();

          if (!hash || window.location.hash.slice(1) === hash) {
            return;
          }

          window.location.hash = hash;
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Hash.Defaults, this._core.options);

    // register the event handlers
    this.$element.on(this._handlers);

    // register event listener for hash navigation
    $(window).on('hashchange.owl.navigation', $.proxy(function(e) {
      var hash = window.location.hash.substring(1),
        items = this._core.$stage.children(),
        position = this._hashes[hash] && items.index(this._hashes[hash]);

      if (position === undefined || position === this._core.current()) {
        return;
      }

      this._core.to(this._core.relative(position), false, true);
    }, this));
  };

  /**
   * Default options.
   * @public
   */
  Hash.Defaults = {
    URLhashListener: false
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Hash.prototype.destroy = function() {
    var handler, property;

    $(window).off('hashchange.owl.navigation');

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.1.0
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

  var style = $('<support>').get(0).style,
    prefixes = 'Webkit Moz O ms'.split(' '),
    events = {
      transition: {
        end: {
          WebkitTransition: 'webkitTransitionEnd',
          MozTransition: 'transitionend',
          OTransition: 'oTransitionEnd',
          transition: 'transitionend'
        }
      },
      animation: {
        end: {
          WebkitAnimation: 'webkitAnimationEnd',
          MozAnimation: 'animationend',
          OAnimation: 'oAnimationEnd',
          animation: 'animationend'
        }
      }
    },
    tests = {
      csstransforms: function() {
        return !!test('transform');
      },
      csstransforms3d: function() {
        return !!test('perspective');
      },
      csstransitions: function() {
        return !!test('transition');
      },
      cssanimations: function() {
        return !!test('animation');
      }
    };

  function test(property, prefixed) {
    var result = false,
      upper = property.charAt(0).toUpperCase() + property.slice(1);

    $.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
      if (style[property] !== undefined) {
        result = prefixed ? property : true;
        return false;
      }
    });

    return result;
  }

  function prefixed(property) {
    return test(property, true);
  }

  if (tests.csstransitions()) {
    /* jshint -W053 */
    $.support.transition = new String(prefixed('transition'))
    $.support.transition.end = events.transition.end[ $.support.transition ];
  }

  if (tests.cssanimations()) {
    /* jshint -W053 */
    $.support.animation = new String(prefixed('animation'))
    $.support.animation.end = events.animation.end[ $.support.animation ];
  }

  if (tests.csstransforms()) {
    /* jshint -W053 */
    $.support.transform = new String(prefixed('transform'));
    $.support.transform3d = tests.csstransforms3d();
  }

})(window.Zepto || window.jQuery, window, document);


$(document).ready(function() {

  $('.carousel').each(function(index, el) {
    var sliderOwl = $(this),
        sliderParametrs = {},
        attrParametrs = $(this).attr('data-options');
    if (typeof attrParametrs != 'undefined'){//console.log(JSON.parse('{"autoWidth":true,"dots":false}'));
    sliderParametrs = JSON.parse(attrParametrs);}
    sliderOwl.owlCarousel(sliderParametrs);
  });
  
  $(window).on('load', function() {
    $('.spinner').hide();
  });
  
});
$(document).ready(function() {
  $(".dropdown").click(function(){
    $(this).find(".dropdown__content").slideToggle();
    $(this).find(".dropdown__title").toggleClass("dropdown__title_highlight");
    $(this).find(".icon").toggleClass("icon_chevron-down icon_chevron-up");
  });
});
$(document).ready(function() {
  
  $('.input').each(function(index, el) {
    $(this).blur(function(event) {
      if($(this).val().length){
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
  });

});
$(document).ready(function () {
  var modalWrapper = $('.modal-wrapper');
  var modal = $('.modal');
  var overlay = $('.overlay');
  var page = $('.page');

  $("*[data-link*='js-modal']").on("click", function () {
    openModal($(this).data('link'));
  });

  modal.click(function(event){
    event.preventDefault();
  })

  function closeModal(modal_id) {
    console.log('close ', modal_id);

    var modal = $('#' + modal_id);

    overlay.fadeOut(200, function () {
      modal.addClass('modal-wrapper_hidden').animate({opacity: 0}, 100);
    });

    overlay.addClass('overlay_hidden');
    page.removeClass('page_hidden');
  }

  function openModal(modal_id) {
    console.log('open ', modal_id);

    var modal = $('#' + modal_id);
    var modal_close = $('.modal__close', modal);

    overlay.fadeIn(200, function () {
      modal.removeClass('modal-wrapper_hidden').animate({opacity: 1}, 100);
    });

    overlay.removeClass('overlay_hidden');
    page.addClass('page_hidden');

    modalWrapper.unbind("click").bind("click", function (event) {
      if (!event.isDefaultPrevented())closeModal(modal_id)
    });

    modal_close.unbind("click").bind("click", function (event) {
      closeModal(modal_id)
    });

    if (!$("div").is(".overlay")) {
      console.error('Block "overlay" not found on a page.');
    }
  }

});
$(document).ready(function() {
  
  // Клик по radio кнопкам в формате button
  $('button.radio').bind('click', function(event) {
    var radioButton = $(this),
        group = radioButton.attr('name'),
        link = radioButton.attr('data-link');
    if(radioButton.hasClass('active')){
      radioButton.removeClass('active');
      $('#'+link).removeClass('tab__item_active');
    } else {
      radioButton.parent().find('.active').removeClass('active');
      radioButton.addClass('active');
      switchTabs(link);
    }
    event.preventDefault();
  });

  // Клик по radio кнопкам в формате input[type="radio"]
  $('.radio__input').change(function(event) {
    var radioInput = $(this),
        group = radioInput.attr('name'),
        link = radioInput.attr('data-link');
    if(!radioInput.prop(':checked')){
      switchTabs(link);
    }
  });

});
$(document).ready(function() {

		$('.radio-group').each(function(index, el) {
	    $(this).find('.radio').first().click();
	  });

});
$(document).ready(function() {

  if($('body').find('.range').length){

    $(window).on('load', function(event) {
    
      var valueRange = function(el){
        if(el.val() != el.attr('placeholder') && el.val().length > 0){
          el.addClass('active');
        } else {
          el.val(el.attr('placeholder'));
          el.removeClass('active');
        }
      }
      
      $('.range').each(function (index, el) {
          var range = $(this).find(".range__slider"),
              min = $(this).find('.range__min'),
              max = $(this).find('.range__max'),
              rangeRemove = $(this).find('.range__field-remove'),
              from = parseInt(min.attr('placeholder')),
              to = parseInt(max.attr('placeholder')),
              rangeVal,
              minVal,
              maxVal;

          if(min.val() > 0){
              min.addClass('active');
          }
          if(max.val() > 0){
              max.addClass('active');
          }

          if (min.val()) {
              minVal = min.val();
          } else {
              minVal = from;
          }

          if (max.val()) {
              maxVal = max.val();
          } else {
              maxVal = to;
          }

          range.slider({
              range: true,
              min: from,
              max: to,
              values: [minVal, maxVal],
              slide: function (event, ui) {
                min.val(ui.values[0]);
                max.val(ui.values[1]);    
                valueRange(min);
                valueRange(max);        
              }
          });

          min.change(function () {
              range.slider("values", 0, $(this).val());
          });

          max.change(function () {
              range.slider("values", 1, $(this).val());          
          });

          min.keyup(function(event) {
            valueRange($(this))
          });
          max.keyup(function(event) {
            valueRange($(this))
          });

          min.val(range.slider("values", 0));
          max.val(range.slider("values", 1));

          rangeRemove.click('click', function() {
              var fieldInput = $(this).parent().find('input');            
              fieldInput.removeClass('active');
              if($(this).parent().find('input').hasClass('range__min')){
                  fieldInput.val('0');
                  range.slider("values", 0, fieldInput.val());
              } else {
                  fieldInput.val(fieldInput.attr('placeholder'));
                  range.slider("values", 1, fieldInput.attr('placeholder'));
              }
              event.preventDefault();
          });

      });

    });

  }

});



/*! jQuery UI - v1.11.4 - 2017-06-26
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, slider.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){function e(e,s){var n,o,a,r=e.nodeName.toLowerCase();return"area"===r?(n=e.parentNode,o=n.name,e.href&&o&&"map"===n.nodeName.toLowerCase()?(a=t("img[usemap='#"+o+"']")[0],!!a&&i(a)):!1):(/^(input|select|textarea|button|object)$/.test(r)?!e.disabled:"a"===r?e.href||s:s)&&i(e)}function i(e){return t.expr.filters.visible(e)&&!t(e).parents().addBack().filter(function(){return"hidden"===t.css(this,"visibility")}).length}t.ui=t.ui||{},t.extend(t.ui,{version:"1.11.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),t.fn.extend({scrollParent:function(e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function(){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},uniqueId:function(){var t=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++t)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&t(this).removeAttr("id")})}}),t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])},focusable:function(i){return e(i,!isNaN(t.attr(i,"tabindex")))},tabbable:function(i){var s=t.attr(i,"tabindex"),n=isNaN(s);return(n||s>=0)&&e(i,!n)}}),t("<a>").outerWidth(1).jquery||t.each(["Width","Height"],function(e,i){function s(e,i,s,o){return t.each(n,function(){i-=parseFloat(t.css(e,"padding"+this))||0,s&&(i-=parseFloat(t.css(e,"border"+this+"Width"))||0),o&&(i-=parseFloat(t.css(e,"margin"+this))||0)}),i}var n="Width"===i?["Left","Right"]:["Top","Bottom"],o=i.toLowerCase(),a={innerWidth:t.fn.innerWidth,innerHeight:t.fn.innerHeight,outerWidth:t.fn.outerWidth,outerHeight:t.fn.outerHeight};t.fn["inner"+i]=function(e){return void 0===e?a["inner"+i].call(this):this.each(function(){t(this).css(o,s(this,e)+"px")})},t.fn["outer"+i]=function(e,n){return"number"!=typeof e?a["outer"+i].call(this,e):this.each(function(){t(this).css(o,s(this,e,!0,n)+"px")})}}),t.fn.addBack||(t.fn.addBack=function(t){return this.add(null==t?this.prevObject:this.prevObject.filter(t))}),t("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(t.fn.removeData=function(e){return function(i){return arguments.length?e.call(this,t.camelCase(i)):e.call(this)}}(t.fn.removeData)),t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),t.fn.extend({focus:function(e){return function(i,s){return"number"==typeof i?this.each(function(){var e=this;setTimeout(function(){t(e).focus(),s&&s.call(e)},i)}):e.apply(this,arguments)}}(t.fn.focus),disableSelection:function(){var t="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.bind(t+".ui-disableSelection",function(t){t.preventDefault()})}}(),enableSelection:function(){return this.unbind(".ui-disableSelection")},zIndex:function(e){if(void 0!==e)return this.css("zIndex",e);if(this.length)for(var i,s,n=t(this[0]);n.length&&n[0]!==document;){if(i=n.css("position"),("absolute"===i||"relative"===i||"fixed"===i)&&(s=parseInt(n.css("zIndex"),10),!isNaN(s)&&0!==s))return s;n=n.parent()}return 0}}),t.ui.plugin={add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i,s){var n,o=t.plugins[e];if(o&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(n=0;o.length>n;n++)t.options[o[n][0]]&&o[n][1].apply(t.element,i)}};var s=0,n=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r,l={},h=e.split(".")[0];return e=e.split(".")[1],n=h+"-"+e,s||(s=i,i=t.Widget),t.expr[":"][n.toLowerCase()]=function(e){return!!t.data(e,n)},t[h]=t[h]||{},o=t[h][e],a=t[h][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new a(t,e)},t.extend(a,o,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),r=new i,r.options=t.widget.extend({},r.options),t.each(s,function(e,s){return t.isFunction(s)?(l[e]=function(){var t=function(){return i.prototype[e].apply(this,arguments)},n=function(t){return i.prototype[e].apply(this,t)};return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(l[e]=s,void 0)}),a.prototype=t.widget.extend(r,{widgetEventPrefix:o?r.widgetEventPrefix||e:e},l,{constructor:a,namespace:h,widgetName:e,widgetFullName:n}),o?(t.each(o._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,a,i._proto)}),delete o._childConstructors):i._childConstructors.push(a),t.widget.bridge(e,a),a},t.widget.extend=function(e){for(var i,s,o=n.call(arguments,1),a=0,r=o.length;r>a;a++)for(i in o[a])s=o[a][i],o[a].hasOwnProperty(i)&&void 0!==s&&(e[i]=t.isPlainObject(s)?t.isPlainObject(e[i])?t.widget.extend({},e[i],s):t.widget.extend({},s):s);return e},t.widget.bridge=function(e,i){var s=i.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=n.call(arguments,1),l=this;return a?this.each(function(){var i,n=t.data(this,s);return"instance"===o?(l=n,!1):n?t.isFunction(n[o])&&"_"!==o.charAt(0)?(i=n[o].apply(n,r),i!==n&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,s);e?(e.option(o||{}),e._init&&e._init()):t.data(this,s,new i(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,i){i=t(i||this.defaultElement||this)[0],this.element=t(i),this.uuid=s++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),i!==this&&(t.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===i&&this.destroy()}}),this.document=t(i.style?i.ownerDocument:i.document||i),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled",!!e),e&&(this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus"))),this},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.delegate(c,h,r):i.bind(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(i).undelegate(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget;var o=!1;t(document).mouseup(function(){o=!1}),t.widget("ui.mouse",{version:"1.11.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!o){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,s=1===e.which,n="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return s&&!n&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),o=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),o=!1,!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.widget("ui.slider",t.ui.mouse,{version:"1.11.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},numPages:5,_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this._calculateNewMax(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var e,i,s=this.options,n=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),o="<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",a=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),e=n.length;i>e;e++)a.push(o);this.handles=n.add(t(a.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e)})},_createRange:function(){var e=this.options,i="";e.range?(e.range===!0&&(e.values?e.values.length&&2!==e.values.length?e.values=[e.values[0],e.values[0]]:t.isArray(e.values)&&(e.values=e.values.slice(0)):e.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=t("<div></div>").appendTo(this.element),i="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(i+("min"===e.range||"max"===e.range?" ui-slider-range-"+e.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){this._off(this.handles),this._on(this.handles,this._handleEvents),this._hoverable(this.handles),this._focusable(this.handles)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,o,a,r,l,h,c=this,u=this.options;return u.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-c.values(e));(n>i||n===i&&(e===c._lastChangedValue||c.values(e)===u.min))&&(n=i,o=t(this),a=e)}),r=this._start(e,a),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=a,o.addClass("ui-state-active").focus(),l=o.offset(),h=!t(e.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=h?{left:0,top:0}:{left:e.pageX-l.left-o.width()/2,top:e.pageY-l.top-o.height()/2-(parseInt(o.css("borderTopWidth"),10)||0)-(parseInt(o.css("borderBottomWidth"),10)||0)+(parseInt(o.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,a,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,o;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),o=this._valueMin()+s*n,this._trimAlignValue(o)},_start:function(t,e){var i={handle:this.handles[e],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("start",t,i)},_slide:function(t,e,i){var s,n,o;this.options.values&&this.options.values.length?(s=this.values(e?0:1),2===this.options.values.length&&this.options.range===!0&&(0===e&&i>s||1===e&&s>i)&&(i=s),i!==this.values(e)&&(n=this.values(),n[e]=i,o=this._trigger("slide",t,{handle:this.handles[e],value:i,values:n}),s=this.values(e?0:1),o!==!1&&this.values(e,i))):i!==this.value()&&(o=this._trigger("slide",t,{handle:this.handles[e],value:i}),o!==!1&&this.value(i))},_stop:function(t,e){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("stop",t,i)},_change:function(t,e){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._lastChangedValue=e,this._trigger("change",t,i)}},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),void 0):this._value()},values:function(e,i){var s,n,o;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),void 0;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(e):this.value();for(s=this.options.values,n=arguments[0],o=0;s.length>o;o+=1)s[o]=this._trimAlignValue(n[o]),this._change(null,o);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch("range"===e&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),t.isArray(this.options.values)&&(n=this.options.values.length),"disabled"===e&&this.element.toggleClass("ui-state-disabled",!!i),this._super(e,i),e){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue(),this.handles.css("horizontal"===i?"bottom":"left","");break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=0;n>s;s+=1)this._change(null,s);this._animateOff=!1;break;case"step":case"min":case"max":this._animateOff=!0,this._calculateNewMax(),this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);if(this.options.values&&this.options.values.length){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_calculateNewMax:function(){var t=this.options.max,e=this._valueMin(),i=this.options.step,s=Math.floor(+(t-e).toFixed(this._precision())/i)*i;t=s+e,this.max=parseFloat(t.toFixed(this._precision()))},_precision:function(){var t=this._precisionOf(this.options.step);return null!==this.options.min&&(t=Math.max(t,this._precisionOf(this.options.min))),t},_precisionOf:function(t){var e=""+t,i=e.indexOf(".");return-1===i?0:e.length-i-1},_valueMin:function(){return this.options.min},_valueMax:function(){return this.max},_refreshValue:function(){var e,i,s,n,o,a=this.options.range,r=this.options,l=this,h=this._animateOff?!1:r.animate,c={};this.options.values&&this.options.values.length?this.handles.each(function(s){i=100*((l.values(s)-l._valueMin())/(l._valueMax()-l._valueMin())),c["horizontal"===l.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[h?"animate":"css"](c,r.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===s&&l.range.stop(1,1)[h?"animate":"css"]({left:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&l.range.stop(1,1)[h?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),o=this._valueMax(),i=o!==n?100*((s-n)/(o-n)):0,c["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[h?"animate":"css"](c,r.animate),"min"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:i+"%"},r.animate),"max"===a&&"horizontal"===this.orientation&&this.range[h?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:i+"%"},r.animate),"max"===a&&"vertical"===this.orientation&&this.range[h?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))},_handleEvents:{keydown:function(e){var i,s,n,o,a=t(e.target).data("ui-slider-handle-index");switch(e.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(e.preventDefault(),!this._keySliding&&(this._keySliding=!0,t(e.target).addClass("ui-state-active"),i=this._start(e,a),i===!1))return}switch(o=this.options.step,s=n=this.options.values&&this.options.values.length?this.values(a):this.value(),e.keyCode){case t.ui.keyCode.HOME:n=this._valueMin();break;case t.ui.keyCode.END:n=this._valueMax();break;case t.ui.keyCode.PAGE_UP:n=this._trimAlignValue(s+(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.PAGE_DOWN:n=this._trimAlignValue(s-(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(s===this._valueMax())return;n=this._trimAlignValue(s+o);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(s===this._valueMin())return;n=this._trimAlignValue(s-o)}this._slide(e,a,n)},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),t(e.target).removeClass("ui-state-active"))}}})});

/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);
$(document).ready(function() {

  $("*[data-link*='js-snackbar']").on("click", function () {
     showSnackbar($(this).data('link'));
  });

  function showSnackbar(snakbar_id) {
    var snackbar = $('#' + snakbar_id);
    var timeout = snackbar.data('timeout') || 3000;

    snackbar.addClass('snackbar_open');
    setTimeout(function(){
      snackbar.removeClass('snackbar_open');
    }, timeout);
    event.preventDefault();
  }

});
var switchTabs = function(el){
  el = '#'+ el;
  $(el).parent().find('.tab__item_active').removeClass('tab__item_active');
  $(el).addClass('tab__item_active');
}
$(document).ready(function() {

  $('.header__menu').on('click', function(event) {
    event.preventDefault();
    $('.page').addClass('hidden'); 
    $('.right-sidebar').addClass('open');
    $('.holder').addClass('menu-open');
    $('#overlay').fadeIn(100).css('display', 'block').animate({opacity: 1}, 200);
  });

  $('#overlay').on('click', function(event) {
    event.preventDefault();
    $('.page').removeClass('hidden'); 
    $('.right-sidebar').removeClass('open');
    $('.holder').removeClass('menu-open');
    $('#overlay').fadeOut(100).css('display', 'none').animate({opacity: 0}, 200);
  });

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJsb2Nrcy9iYXNrZXQtaXRlbS9kZWZhdWx0LmpzIiwiYmxvY2tzL2JyZWFkY3J1bWJzL2RlZmF1bHQuanMiLCJibG9ja3MvY2F0ZWdvcnkvZGVmYXVsdC5qcyIsImJsb2Nrcy9ob21lL2RlZmF1bHQuanMiLCJibG9ja3MvcGlja3VwL2RlZmF1bHQuanMiLCJibG9ja3MvcGlja3VwLWRldGFpbC9kZWZhdWx0LmpzIiwiYmxvY2tzL3JpZ2h0LXNpZGViYXIvZGVmYXVsdC5qcyIsImJsb2Nrcy9zZWFyY2gvZGVmYXVsdC5qcyIsImJsb2Nrcy5iYXNpYy9jYXJvdXNlbC9kZWZhdWx0LmpzIiwiYmxvY2tzLmJhc2ljL2Ryb3Bkb3duL2RlZmF1bHQuanMiLCJibG9ja3MuYmFzaWMvaW5wdXQvZGVmYXVsdC5qcyIsImJsb2Nrcy5iYXNpYy9tb2RhbC9k0LVmYXVsdC5qcyIsImJsb2Nrcy5iYXNpYy9yYWRpby9kZWZhdWx0LmpzIiwiYmxvY2tzLmJhc2ljL3JhZGlvLWdyb3VwL2RlZmF1bHQuanMiLCJibG9ja3MuYmFzaWMvcmFuZ2UvZGVmYXVsdC5qcyIsImJsb2Nrcy5iYXNpYy9zbmFja2Jhci9kZWZhdWx0LmpzIiwiYmxvY2tzLmJhc2ljL3RhYnMvZGVmYXVsdC5qcyIsImJsb2Nrcy5tZXRhL2NvbW1vbi9zY3JpcHRzL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RNQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1dEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICQoJy5iYXNrZXQtaXRlbV9fY29udHJvbCcpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBlbGVtU3VtID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbignLmJhc2tldC1pdGVtX19zdW0nKTtcbiAgICB2YXIgc3VtID0gcGFyc2VJbnQoZWxlbVN1bS52YWwoKSwgMTApO1xuICAgIHZhciBpc01pbnVzID0gJCh0aGlzKS5oYXNDbGFzcygnYmFza2V0LWl0ZW1fX2NvbnRyb2xfbWludXMnKTtcbiAgICB2YXIgYnV0dG9uRGlzYWJsZWQgPSAkKHRoaXMpLnBhcmVudCgpLmNoaWxkcmVuKCcuYmFza2V0LWl0ZW1fX2NvbnRyb2xfbWludXMnKTtcblxuICAgIGlmIChpc05hTihzdW0pKSB7XG4gICAgICBzdW0gPSAxO1xuICAgIH1cblxuICAgIGlmIChpc01pbnVzKXtcbiAgICAgIC0tc3VtO1xuICAgIH0gZWxzZSB7XG4gICAgICArK3N1bTtcbiAgICB9XG5cbiAgICBpZiAoc3VtIDw9IDEpIHtcbiAgICAgIHN1bSA9IDE7XG4gICAgICBidXR0b25EaXNhYmxlZC5wcm9wKCdkaXNhYmxlZCcsdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1dHRvbkRpc2FibGVkLnByb3AoJ2Rpc2FibGVkJyxmYWxzZSk7XG4gICAgfVxuXG4gICAgZWxlbVN1bS52YWwoc3VtKTtcblxuICB9KTtcblxuICBjb250cm9sRGlzYWJsZWQoKTtcbn0pO1xuXG5mdW5jdGlvbiBjb250cm9sRGlzYWJsZWQoKSB7XG4gICQoJy5iYXNrZXQtaXRlbV9fY29udHJvbC13cmFwcGVyJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICB2YXIgZWxlbVN1bSA9ICQodGhpcykuY2hpbGRyZW4oJy5iYXNrZXQtaXRlbV9fc3VtJyk7XG4gICAgdmFyIHN1bSA9IHBhcnNlSW50KGVsZW1TdW0udmFsKCksIDEwKTtcbiAgICB2YXIgYnV0dG9uRGlzYWJsZWQgPSAkKHRoaXMpLmNoaWxkcmVuKCcuYmFza2V0LWl0ZW1fX2NvbnRyb2xfbWludXMnKTtcblxuICAgIGlmIChpc05hTihzdW0pKSB7XG4gICAgICBzdW0gPSAxO1xuICAgIH1cblxuICAgIGlmIChzdW0gPD0gMSkge1xuICAgICAgc3VtID0gMTtcbiAgICAgIGJ1dHRvbkRpc2FibGVkLnByb3AoJ2Rpc2FibGVkJyx0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnV0dG9uRGlzYWJsZWQucHJvcCgnZGlzYWJsZWQnLGZhbHNlKTtcbiAgICB9XG4gIH0pO1xufSIsIiQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgKGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgLyogZ2xvYmFsICovXG4gICAgICAgIHZhciBzbGlkZXJfbWluID0gMDtcbiAgICAgICAgdmFyIHNjcm9sbF9kaXN0YW5jZSA9IDA7XG4gICAgICAgIHZhciBzY3JvbGxfaW50ZXJ2YWxfdGltZSA9IDEwO1xuICAgICAgICB2YXIgc2Nyb2xsX3RpbWVvdXRzID0gbmV3IEFycmF5KCk7XG4gICAgICAgIHZhciBzbGlkZXJfbWF4ID0gMDtcbiAgICAgICAgdmFyIGN1cnJlbnRfc2Nyb2xsX3JhdGUgPSBuZXcgQXJyYXkoMCwgMCwgMCk7XG4gICAgICAgIHZhciBsYXN0X3RvdWNoO1xuICAgICAgICB2YXIgYWN0aXZlX2NoaWxkX29mZnNldCA9IDA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1fYXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgdmFyIGNoaWxkcmVuX29mZnNldHMgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgdmFyIHNjcm9sbF9zdGFydF9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHZhciBjdXJyZW50X3RvdWNoZXMgPSAwO1xuICAgICAgICB2YXIgc2Nyb2xsZXJfY29udGFpbmVyO1xuICAgICAgICB2YXIgc2Nyb2xsZXJfbm9kZTtcbiAgICAgICAgdmFyIHNjcm9sbGVyX2xpbmtzO1xuICAgICAgICB2YXIgaXNfbW92ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgc3RhZ2Vfd2lkdGg7XG4gICAgICAgIHZhciBzZXR0aW5ncztcblxuICAgICAgICAvKiBwcml2YXRlICovXG4gICAgICAgIGZ1bmN0aW9uIHNsb3dfc2Nyb2xsX2hvcml6b250YWxfaW50ZXJ2YWwobm9kZSwgbmV3X29mZnNldCkge1xuICAgICAgICAgICAgbmV3X29mZnNldCA9IE1hdGguZmxvb3IobmV3X29mZnNldCk7XG4gICAgICAgICAgICBzZXRfdHJhbnNmb3JtKG5ld19vZmZzZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2xvd19zY3JvbGxfaG9yaXpvbnRhbCgpIHtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZV9vZmZzZXRfYXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIHRyYW5zZm9ybV9hcnJheSA9IGdldF90cmFuc2Zvcm1fYXJyYXkoKTtcbiAgICAgICAgICAgIHZhciBub2RlX29mZnNldCA9IHBhcnNlSW50KHRyYW5zZm9ybV9hcnJheVs0XSwgMTApO1xuICAgICAgICAgICAgZnJpY3Rpb25fY29lZmZpY2llbnQgPSBzZXR0aW5ncy5mcmljdGlvbl9jb2VmZmljaWVudDtcbiAgICAgICAgICAgIGVsYXN0aWNfZnJpY3Rpb25fY29lZmZpY2llbnQgPSBzZXR0aW5ncy5lbGFzdGljX2ZyaWN0aW9uX2NvZWZmaWNpZW50O1xuICAgICAgICAgICAgc25hcF9mcmljdGlvbl9jb2VmZmljaWVudCA9IHNldHRpbmdzLnNuYXBfZnJpY3Rpb25fY29lZmZpY2llbnQ7XG4gICAgICAgICAgICBpZihzY3JvbGxfZGlzdGFuY2UgPCAtNTAwKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsX2Rpc3RhbmNlID0gLTUwMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZihzY3JvbGxfZGlzdGFuY2UgPiA1MDApIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxfZGlzdGFuY2UgPSA1MDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlKChzY3JvbGxfZGlzdGFuY2UgPiAxKSB8fCAoc2Nyb2xsX2Rpc3RhbmNlIDwgLTEpKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsX2Rpc3RhbmNlID0gc2Nyb2xsX2Rpc3RhbmNlICogZnJpY3Rpb25fY29lZmZpY2llbnQ7XG4gICAgICAgICAgICAgICAgbm9kZV9vZmZzZXQgPSBub2RlX29mZnNldCArIHNjcm9sbF9kaXN0YW5jZTtcbiAgICAgICAgICAgICAgICBpZigobm9kZV9vZmZzZXQgPiBzbGlkZXJfbWluKSB8fCAobm9kZV9vZmZzZXQgPCAoc2xpZGVyX21heCAqIC0xKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsX2Rpc3RhbmNlID0gc2Nyb2xsX2Rpc3RhbmNlICogZWxhc3RpY19mcmljdGlvbl9jb2VmZmljaWVudDtcbiAgICAgICAgICAgICAgICAgICAgbm9kZV9vZmZzZXQgPSBub2RlX29mZnNldCArIHNjcm9sbF9kaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlzdGFuY2Vfb2Zmc2V0X2FycmF5W2ldID0gbm9kZV9vZmZzZXQ7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUobm9kZV9vZmZzZXQgPiAoc2xpZGVyX21pbiArIDAuNSkpIHtcbiAgICAgICAgICAgICAgICBub2RlX29mZnNldCA9IG5vZGVfb2Zmc2V0ICogZnJpY3Rpb25fY29lZmZpY2llbnQ7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2Vfb2Zmc2V0X2FycmF5W2ldID0gbm9kZV9vZmZzZXQ7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUobm9kZV9vZmZzZXQgPCAoKHNsaWRlcl9tYXggKiAtMSkgLSAwLjUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZV9vZmZzZXQgPSAoKG5vZGVfb2Zmc2V0IC0gKHNsaWRlcl9tYXggKiAtMSkpICogZnJpY3Rpb25fY29lZmZpY2llbnQpICsgKHNsaWRlcl9tYXggKiAtMSk7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2Vfb2Zmc2V0X2FycmF5W2ldID0gbm9kZV9vZmZzZXQ7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuX29mZnNldHMubGVuZ3RoLTE7IGorKykge1xuICAgICAgICAgICAgICAgIGFjdGl2ZV9jaGlsZF9vZmZzZXQgPSBqO1xuICAgICAgICAgICAgICAgIHZhciBtaWRkbGUgPSAoY2hpbGRyZW5fb2Zmc2V0c1thY3RpdmVfY2hpbGRfb2Zmc2V0XSArIGNoaWxkcmVuX29mZnNldHNbYWN0aXZlX2NoaWxkX29mZnNldCsxXSkgKiAwLjU7XG4gICAgICAgICAgICAgICAgaWYobWlkZGxlIDwgbm9kZV9vZmZzZXQpIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGpfc3RhcnQgPSAxO1xuICAgICAgICAgICAgaWYoKGRpc3RhbmNlX29mZnNldF9hcnJheS5sZW5ndGglMikgIT0gMCkge1xuICAgICAgICAgICAgICAgIGpfc3RhcnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGxhc3RUaW1lb3V0UmVnaXN0ZXJlZCA9IDA7XG4gICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yKHZhciBqID0gal9zdGFydDsgaiA8IGRpc3RhbmNlX29mZnNldF9hcnJheS5sZW5ndGg7IGogPSBqICsgMikge1xuICAgICAgICAgICAgICAgIHNjcm9sbF90aW1lb3V0c1tqXSA9IHNldFRpbWVvdXQoc2xvd19zY3JvbGxfaG9yaXpvbnRhbF9pbnRlcnZhbCwgc2Nyb2xsX2ludGVydmFsX3RpbWUgKiBqLCBzY3JvbGxlcl9ub2RlLCBkaXN0YW5jZV9vZmZzZXRfYXJyYXlbal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0X3RyYW5zZm9ybSh2YWx1ZSl7XG4gICAgICAgICAgICBzY3JvbGxlcl9ub2RlLmNzcyh7XG4gICAgICAgICAgICAgICAgJy13ZWJraXQtdHJhbnNmb3JtJzondHJhbnNsYXRlWCgnICsgdmFsdWUgKyAncHgpJyxcbiAgICAgICAgICAgICAgICAnLW8tdHJhbnNmb3JtJzondHJhbnNsYXRlWCgnICsgdmFsdWUgKyAncHgpJyxcbiAgICAgICAgICAgICAgICAnLW1vei10cmFuc2Zvcm0nOid0cmFuc2xhdGVYKCcgKyB2YWx1ZSArICdweCknXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldF90cmFuc2Zvcm1fYXJyYXkoKSB7XG4gICAgICAgICAgICB2YXIgdHJhbmZvcm0gPSBzY3JvbGxlcl9ub2RlLmNzcygnLXdlYmtpdC10cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgIGlmICghdHJhbmZvcm0pXG4gICAgICAgICAgICAgICAgdHJhbmZvcm0gPSBzY3JvbGxlcl9ub2RlLmNzcygnLW8tdHJhbnNmb3JtJyk7XG4gICAgICAgICAgICBpZiAoIXRyYW5mb3JtKVxuICAgICAgICAgICAgICAgIHRyYW5mb3JtID0gc2Nyb2xsZXJfbm9kZS5jc3MoJy1tb3otdHJhbnNmb3JtJyk7XG4gICAgICAgICAgICByZXR1cm4gdHJhbmZvcm0uc3BsaXQoJywnKVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdG91Y2hfc3RhcnQoZXZlbnQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRfc2Nyb2xsX3JhdGUgPSBuZXcgQXJyYXkoMCwgMCwgMCk7XG4gICAgICAgICAgICBzY3JvbGxfZGlzdGFuY2UgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxfdGltZW91dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsX3RpbWVvdXRzW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyYW5zZm9ybV9hcnJheSA9IGdldF90cmFuc2Zvcm1fYXJyYXkoKTtcbiAgICAgICAgICAgIHZhciBzY3JvbGxfcG9zaXRpb24gPSBwYXJzZUludCh0cmFuc2Zvcm1fYXJyYXlbNF0sIDEwKTtcbiAgICAgICAgICAgIGlmIChzY3JvbGxfcG9zaXRpb24gPiBzbGlkZXJfbWluKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsX3Bvc2l0aW9uID0gc2xpZGVyX21pbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JvbGxfcG9zaXRpb24gPCAoc2xpZGVyX21heCAqIC0xKSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbF9wb3NpdGlvbiA9IHNsaWRlcl9tYXggKiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vc2V0X3RyYW5zZm9ybShzY3JvbGxfcG9zaXRpb24pO1xuICAgICAgICAgICAgdHJhbnNmb3JtX2FycmF5ID0gZ2V0X3RyYW5zZm9ybV9hcnJheSgpO1xuICAgICAgICAgICAgc2Nyb2xsX3N0YXJ0X3Bvc2l0aW9uID0gKHBhcnNlSW50KHRyYW5zZm9ybV9hcnJheVs0XSwgMTApIC0gZXZlbnQudG91Y2hlc1swXS5wYWdlWCkgKiAtMTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0b3VjaF9tb3ZlKGV2ZW50KXtcbiAgICAgICAgICAgIHRyYW5zZm9ybV9hcnJheSA9IGdldF90cmFuc2Zvcm1fYXJyYXkoKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50X3RvdWNoZXMgIT0gZXZlbnQudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxfc3RhcnRfcG9zaXRpb24gPSAocGFyc2VJbnQodHJhbnNmb3JtX2FycmF5WzRdLCAxMCkgKiAtMSkgKyBldmVudC50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudF90b3VjaGVzID0gZXZlbnQudG91Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZWRnZV9kZWdyYWRhdGlvbiA9IDA7XG4gICAgICAgICAgICBlbGFzdGljX3B1bGxfcmVzaXN0YW5jZSA9IHNldHRpbmdzLmVsYXN0aWNfcHVsbF9yZXNpc3RhbmNlO1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KHRyYW5zZm9ybV9hcnJheVs0XSwgMTApID49IHNsaWRlcl9taW4pIHtcbiAgICAgICAgICAgICAgICBlZGdlX2RlZ3JhZGF0aW9uID0gKHNjcm9sbF9zdGFydF9wb3NpdGlvbiAtIGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgpICogZWxhc3RpY19wdWxsX3Jlc2lzdGFuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQodHJhbnNmb3JtX2FycmF5WzRdLCAxMCkgPD0gKHNsaWRlcl9tYXggKiAtMSkpIHtcbiAgICAgICAgICAgICAgICBlZGdlX2RlZ3JhZGF0aW9uID0gKHNsaWRlcl9tYXggKyAoKHNjcm9sbF9zdGFydF9wb3NpdGlvbiAtIGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgpICogLTEpKSAqIGVsYXN0aWNfcHVsbF9yZXNpc3RhbmNlICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRfdHJhbnNmb3JtKChzY3JvbGxfc3RhcnRfcG9zaXRpb24gLSBldmVudC50b3VjaGVzWzBdLnBhZ2VYIC0gZWRnZV9kZWdyYWRhdGlvbikgKiAtMSk7XG4gICAgICAgICAgICB0cmFuc2Zvcm1fYXJyYXkgPSBnZXRfdHJhbnNmb3JtX2FycmF5KCk7XG4gICAgICAgICAgICBjdXJyZW50X3Njcm9sbF9yYXRlWzBdID0gY3VycmVudF9zY3JvbGxfcmF0ZVsxXTtcbiAgICAgICAgICAgIGN1cnJlbnRfc2Nyb2xsX3JhdGVbMV0gPSBjdXJyZW50X3Njcm9sbF9yYXRlWzJdO1xuICAgICAgICAgICAgY3VycmVudF9zY3JvbGxfcmF0ZVsyXSA9IHBhcnNlSW50KHRyYW5zZm9ybV9hcnJheVs0XSwgMTApO1xuICAgICAgICAgICAgc2Nyb2xsX2Rpc3RhbmNlID0gKChjdXJyZW50X3Njcm9sbF9yYXRlWzJdIC0gY3VycmVudF9zY3JvbGxfcmF0ZVsxXSkgKyAoY3VycmVudF9zY3JvbGxfcmF0ZVsxXSAtIGN1cnJlbnRfc2Nyb2xsX3JhdGVbMF0pKSAvIDI7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdF90b3VjaCA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgICAgICBpc19tb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRvdWNoX2VuZChldmVudCl7XG4gICAgICAgICAgICBpZiAoIWlzX21vdmUpXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICBpc19tb3ZlID0gZmFsc2U7XG4gICAgICAgICAgICBzbG93X3Njcm9sbF9ob3Jpem9udGFsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0X3NsaWRlcigpe1xuICAgICAgICAgICAgc3RhZ2Vfd2lkdGggPSBzY3JvbGxlcl9jb250YWluZXIud2lkdGgoKTtcbiAgICAgICAgICAgIHNjcm9sbGVyX2xpbmtzLnVuYmluZCgndG91Y2hzdGFydCcpO1xuICAgICAgICAgICAgc2Nyb2xsZXJfbGlua3MudW5iaW5kKCd0b3VjaG1vdmUnKTtcbiAgICAgICAgICAgIHNjcm9sbGVyX2xpbmtzLnVuYmluZCgndG91Y2hlbmQnKTtcbiAgICAgICAgICAgIHNsaWRlcl9tYXggPSAwO1xuICAgICAgICAgICAgJChzY3JvbGxlcl9ub2RlKS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKGopIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbl9vZmZzZXRzW2pdID0gc2xpZGVyX21heCAqIC0xO1xuICAgICAgICAgICAgICAgIC8vIGFsZXJ0KCQodGhpcykud2lkdGgoKSk7XG4gICAgICAgICAgICAgICAgc2xpZGVyX21heCA9IHNsaWRlcl9tYXggKyAkKHRoaXMpLndpZHRoKCkgKyBwYXJzZUludCgkKHRoaXMpLmNzcygncGFkZGluZ0xlZnQnKSwgMTApICsgcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ3BhZGRpbmdSaWdodCcpLCAxMCkgKyBwYXJzZUludCgkKHRoaXMpLmNzcygnbWFyZ2luTGVmdCcpLCAxMCkgKyBwYXJzZUludCgkKHRoaXMpLmNzcygnbWFyZ2luUmlnaHQnKSwgMTApICsgcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2JvcmRlckxlZnRXaWR0aCcpLCAxMCkgKyBwYXJzZUludCgkKHRoaXMpLmNzcygnYm9yZGVyUmlnaHRXaWR0aCcpLCAxMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoc2Nyb2xsZXJfbm9kZSkuY3NzKCd3aWR0aCcsIHNsaWRlcl9tYXggKyAncHgnKTtcbiAgICAgICAgICAgIGNoaWxkcmVuX29mZnNldHNbY2hpbGRyZW5fb2Zmc2V0cy5sZW5ndGhdID0gc2xpZGVyX21heCAqIC0xO1xuICAgICAgICAgICAgc2xpZGVyX21heCA9IHNsaWRlcl9tYXggLSBzdGFnZV93aWR0aDtcbiAgICAgICAgICAgIGlmIChzbGlkZXJfbWF4ID4gMCkge1xuICAgICAgICAgICAgICAgIHNjcm9sbGVyX2xpbmtzLmJpbmQoe1xuICAgICAgICAgICAgICAgICAgICAndG91Y2hzdGFydCc6ZnVuY3Rpb24oKXt0b3VjaF9zdGFydChldmVudCl9LFxuICAgICAgICAgICAgICAgICAgICAndG91Y2htb3ZlJzpmdW5jdGlvbigpe3RvdWNoX21vdmUoZXZlbnQpfSxcbiAgICAgICAgICAgICAgICAgICAgJ3RvdWNoZW5kJzpmdW5jdGlvbigpe3RvdWNoX2VuZChldmVudCl9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0X3RyYW5zZm9ybShzbGlkZXJfbWF4ICogLTEpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldF90cmFuc2Zvcm0oMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBwdWJsaWMgKi9cbiAgICAgICAgJC5mbi50aGVybW9TbGlkZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICBzZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoe30sIGpRdWVyeS5mbi50aGVybW9TbGlkZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgc2Nyb2xsZXJfY29udGFpbmVyID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHNjcm9sbGVyX25vZGUgPSBzY3JvbGxlcl9jb250YWluZXIuY2hpbGRyZW4oJzpmaXJzdC1jaGlsZCcpO1xuICAgICAgICAgICAgc2Nyb2xsZXJfbGlua3MgPSBzY3JvbGxlcl9ub2RlLmNoaWxkcmVuKCdhJyk7XG4gICAgICAgICAgICBpbml0X3NsaWRlcigpO1xuICAgICAgICAgICAgdmFyIGNoYW5nZV9vcmllbnRhdGlvbiA9IFwib25vcmllbnRhdGlvbmNoYW5nZVwiIGluIHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBjaGFuZ2Vfb3JpZW50YXRpb24gPyBcIm9yaWVudGF0aW9uY2hhbmdlXCIgOiBcInJlc2l6ZVwiO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGluaXRfc2xpZGVyLCAyMDApO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGpRdWVyeS5mbi50aGVybW9TbGlkZXIuZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAnZWxhc3RpY19wdWxsX3Jlc2lzdGFuY2UnOiAwLjYsXG4gICAgICAgICAgICAnZnJpY3Rpb25fY29lZmZpY2llbnQnOiAwLjkyLFxuICAgICAgICAgICAgJ2VsYXN0aWNfZnJpY3Rpb25fY29lZmZpY2llbnQnOiAwLjgsXG4gICAgICAgICAgICAnc25hcF9mcmljdGlvbl9jb2VmZmljaWVudCc6IDAuOTJcbiAgICAgICAgfTtcbiAgICB9KSAoalF1ZXJ5KTtcblxuICAgICQoJy5icmVhZGNydW1icycpLnRoZXJtb1NsaWRlcigpO1xuXG59KTsiLCIkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLmNhdGVnb3J5LWdvb2RfX2l0ZW0tYnV0dG9uLCAuY2F0ZWdvcnktZ29vZF9fc2VsZWN0LWJ1dHRvblwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZhbHNlXG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcblxuICAkKCcucmFkaW8tZ3JvdXBfaG9tZSAucmFkaW9fX2lucHV0JykuY2hhbmdlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICBcbiAgICQoJy5jYXJvdXNlbCcpLnRyaWdnZXIoJ2Rlc3Ryb3kub3dsLmNhcm91c2VsJyk7XG4gICAgXG4gICAgJCgnLmNhcm91c2VsJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICB2YXIgc2xpZGVyT3dsID0gJCh0aGlzKSxcbiAgICAgICAgICBzbGlkZXJQYXJhbWV0cnMgPSB7fSxcbiAgICAgICAgICBhdHRyUGFyYW1ldHJzID0gJCh0aGlzKS5hdHRyKCdkYXRhLW9wdGlvbnMnKTtcbiAgICAgIGlmICh0eXBlb2YgYXR0clBhcmFtZXRycyAhPSAndW5kZWZpbmVkJylcbiAgICAgICAgc2xpZGVyUGFyYW1ldHJzID0gSlNPTi5wYXJzZShhdHRyUGFyYW1ldHJzKTtcbiAgICAgIHNsaWRlck93bC5vd2xDYXJvdXNlbChzbGlkZXJQYXJhbWV0cnMpO1xuICAgIH0pO1xuXG4gICB9KTtcblxuIH0pO1xuXG59KTsiLCJ2YXIgbWFya2VyTGlzdCA9IFtdO1xuXG4kKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbihldmVudCkge1xuXG4gIGlmKCQoJ2JvZHknKS5maW5kKCcucGlja3VwX19pdGVtJykubGVuZ3RoKXtcbiAgICAkKCcucGlja3VwX19pdGVtJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICB2YXIgcGlja3VwTGluayA9ICQodGhpcykuZmluZCgnYScpLFxuICAgICAgICBtYXJrZXJBZGRyZXNzID0gcGlja3VwTGluay5maW5kKCdiJykudGV4dCgpLFxuICAgICAgICBtYXJrZXJMaW5rID0gcGlja3VwTGluay5hdHRyKCdocmVmJyksXG4gICAgICAgIG1hcmtlclRpbWUgPSBwaWNrdXBMaW5rLmZpbmQoJ3NwYW4nKS50ZXh0KCksXG4gICAgICAgIG1hcmtlckxhdCA9IHBpY2t1cExpbmsuYXR0cignZGF0YS1sYXQnKSxcbiAgICAgICAgbWFya2VyTG5nID0gcGlja3VwTGluay5hdHRyKCdkYXRhLWxuZycpO1xuICAgICAgICBtYXJrZXJMaXN0LnB1c2goe1xuICAgICAgICAgIGxhdDogTnVtYmVyKG1hcmtlckxhdCksXG4gICAgICAgICAgbG5nOiBOdW1iZXIobWFya2VyTG5nKSxcbiAgICAgICAgICBzaG9ydEFkZHJlczogbWFya2VyQWRkcmVzcyxcbiAgICAgICAgICBzaG9ydFRpbWU6IG1hcmtlclRpbWUsXG4gICAgICAgICAgbGluazogbWFya2VyTGlua1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59KTtcblxudmFyIGluZm9XaW5kb3dzID0gW107XG5cbmZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cbiAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpY2t1cF9fbWFwJyksIHtcbiAgICB6b29tOiAxMCxcbiAgICBjZW50ZXI6IHtsYXQ6IDU1Ljc1NTgxNCwgbG5nOiAzNy42MTc2MzV9LFxuICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWVcbiAgfSk7XG5cbiAgdmFyIG1hcmtlcnMgPSBbXTtcbiAgbWFya2VyTGlzdC5tYXAoZnVuY3Rpb24obG9jYXRpb24sIGkpIHtcblxuICBcdHZhciBjb250ZW50U3RyaW5nID0gJzxhIGhyZWY9XCInK2xvY2F0aW9uLmxpbmsrJ1wiIGNsYXNzPVwibWFwX19saW5rXCI+J1xuXHQgIFx0KyAnPGI+JyArIGxvY2F0aW9uLnNob3J0QWRkcmVzKyc8L2I+J1xuXHQgIFx0KyAnPGJyLz4nXG5cdCAgXHQrICc8c3Bhbj4nICsgbG9jYXRpb24uc2hvcnRUaW1lICsgJzwvc3Bhbj4nXG5cdCAgXHQrICc8L2E+JyxcbiAgXHRpbmZvd2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xuICAgIFx0Y29udGVudDogY29udGVudFN0cmluZyxcbiAgICBcdHBpeGVsT2Zmc2V0OiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSgtMSwxNSlcbiAgICB9KSxcbiAgICBpY29uID0ge1xuICAgICAgdXJsOiAnc3RhdGljL3N2Zy9tYXJrZXIuc3ZnJyxcbiAgICAgIHNjYWxlZFNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDIzLCAzMilcbiAgICB9LFxuXHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgcG9zaXRpb246IHtsYXQ6IGxvY2F0aW9uLmxhdCwgbG5nOiBsb2NhdGlvbi5sbmd9LFxuICAgICAgaWNvbjogaWNvblxuICAgIH0pO1xuICAgIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIGluZm9XaW5kb3dzLnB1c2goaW5mb3dpbmRvdyk7XG4gICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgY2xvc2VBbGxJbmZvV2luZG93cygpO1xuICAgIFx0c2hvcnRJbmZvKG1hcmtlciwgaW5mb3dpbmRvdyk7XG5cdCAgfSk7XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2xvc2VBbGxJbmZvV2luZG93cygpIHtcbiAgICBmb3IgKHZhciBpPTA7aTxpbmZvV2luZG93cy5sZW5ndGg7aSsrKSB7XG4gICAgICAgaW5mb1dpbmRvd3NbaV0uY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbWFya2VyQ2x1c3RlciA9IG5ldyBNYXJrZXJDbHVzdGVyZXIobWFwLCBtYXJrZXJzLCB7XG4gIFx0Ly8gaW1hZ2VQYXRoOiAnaW1nL20nLFxuICAgIHN0eWxlczogW3tcbiAgICAgIHdpZHRoOiA1MyxcbiAgICAgIGhlaWdodDogNTIsXG4gICAgICB1cmw6ICdzdGF0aWMvaW1nL20xLnBuZycsXG4gICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICB0ZXh0U2l6ZTogMTJcbiAgICB9XVxuICB9KTtcblxuICBmdW5jdGlvbiBzaG9ydEluZm8obWFya2VyLCBpbmZvd2luZG93KSB7XG4gICAgaW5mb3dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcblx0fVxuXG59XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXHQkKCcucGlja3VwIC5yYWRpb19faW5wdXQnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoJCh0aGlzKS5hdHRyKCdkYXRhLWxpbmsnKSA9PSAnanMtbWFwcycpe1xuXHRcdFx0aWYoISQoJ2JvZHknKS5oYXNDbGFzcygnaW5pdC1tYXAnKSl7XG4gICAgICAgIGlmKCQoJ2JvZHknKS5maW5kKCcucGlja3VwX19pdGVtJykubGVuZ3RoKXtcblx0XHRcdFx0ICBpbml0TWFwKCk7XG4gICAgICAgIH1cblx0XHRcdFx0JCgnYm9keScpLmFkZENsYXNzKCdpbml0LW1hcCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cbn0pOyIsIiQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmKCQoJ2JvZHknKS5maW5kKCcucGlja3VwLWRldGFpbF9fbWFwJykubGVuZ3RoKXtcbiAgICAgIHZhciBwaWNrdXBNYXAgPSAkKCcucGlja3VwLWRldGFpbF9fbWFwJyksXG4gICAgICAgICAgcGlja3VwTWFwTGF0ID0gcGlja3VwTWFwLmF0dHIoJ2RhdGEtbGF0JyksXG4gICAgICAgICAgbWFya2VyTGF0ID0gTnVtYmVyKHBpY2t1cE1hcExhdCksXG4gICAgICAgICAgcGlja3VwTWFwTG5nID0gcGlja3VwTWFwLmF0dHIoJ2RhdGEtbG5nJyksXG4gICAgICAgICAgbWFya2VyTG5nID0gTnVtYmVyKHBpY2t1cE1hcExuZyk7XG4gICAgICAgICAgaW5pdE1hcERldGFpbChtYXJrZXJMYXQsbWFya2VyTG5nKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGluaXRNYXBEZXRhaWwobGF0LGxuZykge1xuXG4gIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcy1waWNrdXAtZGV0YWlsLW1hcCcpLCB7XG4gICAgem9vbTogMTAsXG4gICAgY2VudGVyOiB7bGF0OiBsYXQsIGxuZzogbG5nfSxcbiAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxuICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcbiAgICBzY2FsZUNvbnRyb2w6IGZhbHNlXG4gIH0pO1xuXG4gIHZhciBpY29uRGV0YWlsID0ge1xuICAgIHVybDogJ3N0YXRpYy9zdmcvbWFya2VyLnN2ZycsXG4gICAgc2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoMjMsIDMyKVxuICB9LFxuICBtYXJrZXJEZXRhaWwgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICBwb3NpdGlvbjoge2xhdDogbGF0LCBsbmc6IGxuZ30sXG4gICAgaWNvbjogaWNvbkRldGFpbCxcbiAgICBtYXA6IG1hcFxuICB9KTtcblxufSIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdCQoJy5oZWFkZXJfX21lbnUnKS5jbGljayhmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnb3BlbicpKXtcblx0XHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuXHRcdFx0JCgnYm9keScpLmNzcygnb3ZlcmZsb3cnLCAndmlzaWJsZScpO1xuXHRcdFx0JCgnaHRtbCcpLmNzcygnb3ZlcmZsb3cnLCAndmlzaWJsZScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ29wZW4nKTtcblx0XHRcdCQoJ2JvZHknKS5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuXHRcdFx0JCgnaHRtbCcpLmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XG5cdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0pO1xuXG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXHR2YXIgc2VhcmNoID0gJCgnLnNlYXJjaCcpO1xuXG5cdCQoJ2FbZGF0YS10eXBlPVwib3Blbi1zZWFyY2hcIl0nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoc2VhcmNoLmhhc0NsYXNzKCdzaG93Jykpe1xuXHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRzZWFyY2gucmVtb3ZlQ2xhc3MoJ3Nob3cgb3Blbl9zdWdnZXN0Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdFx0c2VhcmNoLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0fVxuXHR9KTtcblxuXHQkKCcuc2VhcmNoX19pbnB1dCAuaW5wdXQnKS5rZXl1cChmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCQodGhpcykudmFsKCkubGVuZ3RoID4gMCl7XG5cdFx0XHRzZWFyY2guYWRkQ2xhc3MoJ29wZW5fc3VnZ2VzdCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWFyY2gucmVtb3ZlQ2xhc3MoJ29wZW5fc3VnZ2VzdCcpO1xuXHRcdH1cblx0fSk7XG5cblx0JCgnYVtkYXRhLXR5cGU9XCJzZWFyY2gtY2xlYXJcIl0nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0c2VhcmNoLnJlbW92ZUNsYXNzKCdvcGVuX3N1Z2dlc3QnKTtcblx0XHQkKCcuc2VhcmNoX19pbnB1dCAuaW5wdXQnKS52YWwoJycpLmZvY3VzKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSk7XG5cbn0pOyIsIi8qKlxuICogT3dsIENhcm91c2VsIHYyLjIuMVxuICogQ29weXJpZ2h0IDIwMTMtMjAxNyBEYXZpZCBEZXV0c2NoXG4gKiBMaWNlbnNlZCB1bmRlciAgKClcbiAqL1xuLyoqXG4gKiBPd2wgY2Fyb3VzZWxcbiAqIEB2ZXJzaW9uIDIuMS42XG4gKiBAYXV0aG9yIEJhcnRvc3ogV29qY2llY2hvd3NraVxuICogQGF1dGhvciBEYXZpZCBEZXV0c2NoXG4gKiBAbGljZW5zZSBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqIEB0b2RvIExhenkgTG9hZCBJY29uXG4gKiBAdG9kbyBwcmV2ZW50IGFuaW1hdGlvbmVuZCBidWJsaW5nXG4gKiBAdG9kbyBpdGVtc1NjYWxlVXBcbiAqIEB0b2RvIFRlc3QgWmVwdG9cbiAqIEB0b2RvIHN0YWdlUGFkZGluZyBjYWxjdWxhdGUgd3JvbmcgYWN0aXZlIGNsYXNzZXNcbiAqL1xuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNhcm91c2VsLlxuICAgKiBAY2xhc3MgVGhlIE93bCBDYXJvdXNlbC5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGNyZWF0ZSB0aGUgY2Fyb3VzZWwgZm9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gVGhlIG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIE93bChlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHNldHRpbmdzIGZvciB0aGUgY2Fyb3VzZWwuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHRoaXMuc2V0dGluZ3MgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQ3VycmVudCBvcHRpb25zIHNldCBieSB0aGUgY2FsbGVyIGluY2x1ZGluZyBkZWZhdWx0cy5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE93bC5EZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBQbHVnaW4gZWxlbWVudC5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAvKipcbiAgICAgKiBQcm94aWVkIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9oYW5kbGVycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogUmVmZXJlbmNlcyB0byB0aGUgcnVubmluZyBwbHVnaW5zIG9mIHRoaXMgY2Fyb3VzZWwuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX3BsdWdpbnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEN1cnJlbnRseSBzdXBwcmVzc2VkIGV2ZW50cyB0byBwcmV2ZW50IHRoZW0gZnJvbSBiZWVpbmcgcmV0cmlnZ2VyZWQuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX3N1cHJlc3MgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQW5pbWF0aW9uIHNwZWVkIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgdGhpcy5fc3BlZWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQ29vcmRpbmF0ZXMgb2YgYWxsIGl0ZW1zIGluIHBpeGVsLlxuICAgICAqIEB0b2RvIFRoZSBuYW1lIG9mIHRoaXMgbWVtYmVyIGlzIG1pc3NsZWFkaW5nLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9jb29yZGluYXRlcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQ3VycmVudCBicmVha3BvaW50LlxuICAgICAqIEB0b2RvIFJlYWwgbWVkaWEgcXVlcmllcyB3b3VsZCBiZSBuaWNlLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9icmVha3BvaW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEN1cnJlbnQgd2lkdGggb2YgdGhlIHBsdWdpbiBlbGVtZW50LlxuICAgICAqL1xuICAgIHRoaXMuX3dpZHRoID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFsbCByZWFsIGl0ZW1zLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9pdGVtcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQWxsIGNsb25lZCBpdGVtcy5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgdGhpcy5fY2xvbmVzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBNZXJnZSB2YWx1ZXMgb2YgYWxsIGl0ZW1zLlxuICAgICAqIEB0b2RvIE1heWJlIHRoaXMgY291bGQgYmUgcGFydCBvZiBhIHBsdWdpbi5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgdGhpcy5fbWVyZ2VycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogV2lkdGhzIG9mIGFsbCBpdGVtcy5cbiAgICAgKi9cbiAgICB0aGlzLl93aWR0aHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEludmFsaWRhdGVkIHBhcnRzIHdpdGhpbiB0aGUgdXBkYXRlIHByb2Nlc3MuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX2ludmFsaWRhdGVkID0ge307XG5cbiAgICAvKipcbiAgICAgKiBPcmRlcmVkIGxpc3Qgb2Ygd29ya2VycyBmb3IgdGhlIHVwZGF0ZSBwcm9jZXNzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9waXBlID0gW107XG5cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0YXRlIGluZm9ybWF0aW9uIGZvciB0aGUgZHJhZyBvcGVyYXRpb24uXG4gICAgICogQHRvZG8gIzI2MVxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9kcmFnID0ge1xuICAgICAgdGltZTogbnVsbCxcbiAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgIHBvaW50ZXI6IG51bGwsXG4gICAgICBzdGFnZToge1xuICAgICAgICBzdGFydDogbnVsbCxcbiAgICAgICAgY3VycmVudDogbnVsbFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGlvbjogbnVsbFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0YXRlIGluZm9ybWF0aW9uIGFuZCB0aGVpciB0YWdzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX3N0YXRlcyA9IHtcbiAgICAgIGN1cnJlbnQ6IHt9LFxuICAgICAgdGFnczoge1xuICAgICAgICAnaW5pdGlhbGl6aW5nJzogWyAnYnVzeScgXSxcbiAgICAgICAgJ2FuaW1hdGluZyc6IFsgJ2J1c3knIF0sXG4gICAgICAgICdkcmFnZ2luZyc6IFsgJ2ludGVyYWN0aW5nJyBdXG4gICAgICB9XG4gICAgfTtcblxuICAgICQuZWFjaChbICdvblJlc2l6ZScsICdvblRocm90dGxlZFJlc2l6ZScgXSwgJC5wcm94eShmdW5jdGlvbihpLCBoYW5kbGVyKSB7XG4gICAgICB0aGlzLl9oYW5kbGVyc1toYW5kbGVyXSA9ICQucHJveHkodGhpc1toYW5kbGVyXSwgdGhpcyk7XG4gICAgfSwgdGhpcykpO1xuXG4gICAgJC5lYWNoKE93bC5QbHVnaW5zLCAkLnByb3h5KGZ1bmN0aW9uKGtleSwgcGx1Z2luKSB7XG4gICAgICB0aGlzLl9wbHVnaW5zW2tleS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIGtleS5zbGljZSgxKV1cbiAgICAgICAgPSBuZXcgcGx1Z2luKHRoaXMpO1xuICAgIH0sIHRoaXMpKTtcblxuICAgICQuZWFjaChPd2wuV29ya2VycywgJC5wcm94eShmdW5jdGlvbihwcmlvcml0eSwgd29ya2VyKSB7XG4gICAgICB0aGlzLl9waXBlLnB1c2goe1xuICAgICAgICAnZmlsdGVyJzogd29ya2VyLmZpbHRlcixcbiAgICAgICAgJ3J1bic6ICQucHJveHkod29ya2VyLnJ1biwgdGhpcylcbiAgICAgIH0pO1xuICAgIH0sIHRoaXMpKTtcblxuICAgIHRoaXMuc2V0dXAoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBjYXJvdXNlbC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgT3dsLkRlZmF1bHRzID0ge1xuICAgIGl0ZW1zOiAzLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIGNlbnRlcjogZmFsc2UsXG4gICAgcmV3aW5kOiBmYWxzZSxcblxuICAgIG1vdXNlRHJhZzogdHJ1ZSxcbiAgICB0b3VjaERyYWc6IHRydWUsXG4gICAgcHVsbERyYWc6IHRydWUsXG4gICAgZnJlZURyYWc6IGZhbHNlLFxuXG4gICAgbWFyZ2luOiAwLFxuICAgIHN0YWdlUGFkZGluZzogMCxcblxuICAgIG1lcmdlOiBmYWxzZSxcbiAgICBtZXJnZUZpdDogdHJ1ZSxcbiAgICBhdXRvV2lkdGg6IGZhbHNlLFxuXG4gICAgc3RhcnRQb3NpdGlvbjogMCxcbiAgICBydGw6IGZhbHNlLFxuXG4gICAgc21hcnRTcGVlZDogMjUwLFxuICAgIGZsdWlkU3BlZWQ6IGZhbHNlLFxuICAgIGRyYWdFbmRTcGVlZDogZmFsc2UsXG5cbiAgICByZXNwb25zaXZlOiB7fSxcbiAgICByZXNwb25zaXZlUmVmcmVzaFJhdGU6IDIwMCxcbiAgICByZXNwb25zaXZlQmFzZUVsZW1lbnQ6IHdpbmRvdyxcblxuICAgIGZhbGxiYWNrRWFzaW5nOiAnc3dpbmcnLFxuXG4gICAgaW5mbzogZmFsc2UsXG5cbiAgICBuZXN0ZWRJdGVtU2VsZWN0b3I6IGZhbHNlLFxuICAgIGl0ZW1FbGVtZW50OiAnZGl2JyxcbiAgICBzdGFnZUVsZW1lbnQ6ICdkaXYnLFxuXG4gICAgcmVmcmVzaENsYXNzOiAnY2Fyb3VzZWwtcmVmcmVzaCcsXG4gICAgbG9hZGVkQ2xhc3M6ICdjYXJvdXNlbC1sb2FkZWQnLFxuICAgIGxvYWRpbmdDbGFzczogJ2Nhcm91c2VsLWxvYWRpbmcnLFxuICAgIHJ0bENsYXNzOiAnY2Fyb3VzZWwtcnRsJyxcbiAgICByZXNwb25zaXZlQ2xhc3M6ICdjYXJvdXNlbF9fcmVzcG9uc2l2ZScsXG4gICAgZHJhZ0NsYXNzOiAnY2Fyb3VzZWwtZHJhZycsXG4gICAgaXRlbUNsYXNzOiAnY2Fyb3VzZWxfX2l0ZW0nLFxuICAgIHN0YWdlQ2xhc3M6ICdjYXJvdXNlbF9fc3RhZ2UnLFxuICAgIHN0YWdlT3V0ZXJDbGFzczogJ2Nhcm91c2VsX19zdGFnZS1vdXRlcicsXG4gICAgZ3JhYkNsYXNzOiAnY2Fyb3VzZWwtZ3JhYidcbiAgfTtcblxuICAvKipcbiAgICogRW51bWVyYXRpb24gZm9yIHdpZHRoLlxuICAgKiBAcHVibGljXG4gICAqIEByZWFkb25seVxuICAgKiBAZW51bSB7U3RyaW5nfVxuICAgKi9cbiAgT3dsLldpZHRoID0ge1xuICAgIERlZmF1bHQ6ICdkZWZhdWx0JyxcbiAgICBJbm5lcjogJ2lubmVyJyxcbiAgICBPdXRlcjogJ291dGVyJ1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbnVtZXJhdGlvbiBmb3IgdHlwZXMuXG4gICAqIEBwdWJsaWNcbiAgICogQHJlYWRvbmx5XG4gICAqIEBlbnVtIHtTdHJpbmd9XG4gICAqL1xuICBPd2wuVHlwZSA9IHtcbiAgICBFdmVudDogJ2V2ZW50JyxcbiAgICBTdGF0ZTogJ3N0YXRlJ1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb250YWlucyBhbGwgcmVnaXN0ZXJlZCBwbHVnaW5zLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBPd2wuUGx1Z2lucyA9IHt9O1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIHdvcmtlcnMgaW52b2x2ZWQgaW4gdGhlIHVwZGF0ZSBwcm9jZXNzLlxuICAgKi9cbiAgT3dsLldvcmtlcnMgPSBbIHtcbiAgICBmaWx0ZXI6IFsgJ3dpZHRoJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl93aWR0aCA9IHRoaXMuJGVsZW1lbnQud2lkdGgoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ3dpZHRoJywgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgIGNhY2hlLmN1cnJlbnQgPSB0aGlzLl9pdGVtcyAmJiB0aGlzLl9pdGVtc1t0aGlzLnJlbGF0aXZlKHRoaXMuX2N1cnJlbnQpXTtcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGFnZS5jaGlsZHJlbignLmNsb25lZCcpLnJlbW92ZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAnd2lkdGgnLCAnaXRlbXMnLCAnc2V0dGluZ3MnIF0sXG4gICAgcnVuOiBmdW5jdGlvbihjYWNoZSkge1xuICAgICAgdmFyIG1hcmdpbiA9IHRoaXMuc2V0dGluZ3MubWFyZ2luIHx8ICcnLFxuICAgICAgICBncmlkID0gIXRoaXMuc2V0dGluZ3MuYXV0b1dpZHRoLFxuICAgICAgICBydGwgPSB0aGlzLnNldHRpbmdzLnJ0bCxcbiAgICAgICAgY3NzID0ge1xuICAgICAgICAgICd3aWR0aCc6ICdhdXRvJyxcbiAgICAgICAgICAnbWFyZ2luLWxlZnQnOiBydGwgPyBtYXJnaW4gOiAnJyxcbiAgICAgICAgICAnbWFyZ2luLXJpZ2h0JzogcnRsID8gJycgOiBtYXJnaW5cbiAgICAgICAgfTtcblxuICAgICAgIWdyaWQgJiYgdGhpcy4kc3RhZ2UuY2hpbGRyZW4oKS5jc3MoY3NzKTtcblxuICAgICAgY2FjaGUuY3NzID0gY3NzO1xuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAnd2lkdGgnLCAnaXRlbXMnLCAnc2V0dGluZ3MnIF0sXG4gICAgcnVuOiBmdW5jdGlvbihjYWNoZSkge1xuICAgICAgdmFyIHdpZHRoID0gKHRoaXMud2lkdGgoKSAvIHRoaXMuc2V0dGluZ3MuaXRlbXMpLnRvRml4ZWQoMykgLSB0aGlzLnNldHRpbmdzLm1hcmdpbixcbiAgICAgICAgbWVyZ2UgPSBudWxsLFxuICAgICAgICBpdGVyYXRvciA9IHRoaXMuX2l0ZW1zLmxlbmd0aCxcbiAgICAgICAgZ3JpZCA9ICF0aGlzLnNldHRpbmdzLmF1dG9XaWR0aCxcbiAgICAgICAgd2lkdGhzID0gW107XG5cbiAgICAgIGNhY2hlLml0ZW1zID0ge1xuICAgICAgICBtZXJnZTogZmFsc2UsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgfTtcblxuICAgICAgd2hpbGUgKGl0ZXJhdG9yLS0pIHtcbiAgICAgICAgbWVyZ2UgPSB0aGlzLl9tZXJnZXJzW2l0ZXJhdG9yXTtcbiAgICAgICAgbWVyZ2UgPSB0aGlzLnNldHRpbmdzLm1lcmdlRml0ICYmIE1hdGgubWluKG1lcmdlLCB0aGlzLnNldHRpbmdzLml0ZW1zKSB8fCBtZXJnZTtcblxuICAgICAgICBjYWNoZS5pdGVtcy5tZXJnZSA9IG1lcmdlID4gMSB8fCBjYWNoZS5pdGVtcy5tZXJnZTtcblxuICAgICAgICB3aWR0aHNbaXRlcmF0b3JdID0gIWdyaWQgPyB0aGlzLl9pdGVtc1tpdGVyYXRvcl0ud2lkdGgoKSA6IHdpZHRoICogbWVyZ2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3dpZHRocyA9IHdpZHRocztcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xvbmVzID0gW10sXG4gICAgICAgIGl0ZW1zID0gdGhpcy5faXRlbXMsXG4gICAgICAgIHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncyxcbiAgICAgICAgLy8gVE9ETzogU2hvdWxkIGJlIGNvbXB1dGVkIGZyb20gbnVtYmVyIG9mIG1pbiB3aWR0aCBpdGVtcyBpbiBzdGFnZVxuICAgICAgICB2aWV3ID0gTWF0aC5tYXgoc2V0dGluZ3MuaXRlbXMgKiAyLCA0KSxcbiAgICAgICAgc2l6ZSA9IE1hdGguY2VpbChpdGVtcy5sZW5ndGggLyAyKSAqIDIsXG4gICAgICAgIHJlcGVhdCA9IHNldHRpbmdzLmxvb3AgJiYgaXRlbXMubGVuZ3RoID8gc2V0dGluZ3MucmV3aW5kID8gdmlldyA6IE1hdGgubWF4KHZpZXcsIHNpemUpIDogMCxcbiAgICAgICAgYXBwZW5kID0gJycsXG4gICAgICAgIHByZXBlbmQgPSAnJztcblxuICAgICAgcmVwZWF0IC89IDI7XG5cbiAgICAgIHdoaWxlIChyZXBlYXQtLSkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gb25seSB1c2luZyBhcHBlbmRlZCBjbG9uZXNcbiAgICAgICAgY2xvbmVzLnB1c2godGhpcy5ub3JtYWxpemUoY2xvbmVzLmxlbmd0aCAvIDIsIHRydWUpKTtcbiAgICAgICAgYXBwZW5kID0gYXBwZW5kICsgaXRlbXNbY2xvbmVzW2Nsb25lcy5sZW5ndGggLSAxXV1bMF0ub3V0ZXJIVE1MO1xuICAgICAgICBjbG9uZXMucHVzaCh0aGlzLm5vcm1hbGl6ZShpdGVtcy5sZW5ndGggLSAxIC0gKGNsb25lcy5sZW5ndGggLSAxKSAvIDIsIHRydWUpKTtcbiAgICAgICAgcHJlcGVuZCA9IGl0ZW1zW2Nsb25lc1tjbG9uZXMubGVuZ3RoIC0gMV1dWzBdLm91dGVySFRNTCArIHByZXBlbmQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Nsb25lcyA9IGNsb25lcztcblxuICAgICAgJChhcHBlbmQpLmFkZENsYXNzKCdjbG9uZWQnKS5hcHBlbmRUbyh0aGlzLiRzdGFnZSk7XG4gICAgICAkKHByZXBlbmQpLmFkZENsYXNzKCdjbG9uZWQnKS5wcmVwZW5kVG8odGhpcy4kc3RhZ2UpO1xuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAnd2lkdGgnLCAnaXRlbXMnLCAnc2V0dGluZ3MnIF0sXG4gICAgcnVuOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBydGwgPSB0aGlzLnNldHRpbmdzLnJ0bCA/IDEgOiAtMSxcbiAgICAgICAgc2l6ZSA9IHRoaXMuX2Nsb25lcy5sZW5ndGggKyB0aGlzLl9pdGVtcy5sZW5ndGgsXG4gICAgICAgIGl0ZXJhdG9yID0gLTEsXG4gICAgICAgIHByZXZpb3VzID0gMCxcbiAgICAgICAgY3VycmVudCA9IDAsXG4gICAgICAgIGNvb3JkaW5hdGVzID0gW107XG5cbiAgICAgIHdoaWxlICgrK2l0ZXJhdG9yIDwgc2l6ZSkge1xuICAgICAgICBwcmV2aW91cyA9IGNvb3JkaW5hdGVzW2l0ZXJhdG9yIC0gMV0gfHwgMDtcbiAgICAgICAgY3VycmVudCA9IHRoaXMuX3dpZHRoc1t0aGlzLnJlbGF0aXZlKGl0ZXJhdG9yKV0gKyB0aGlzLnNldHRpbmdzLm1hcmdpbjtcbiAgICAgICAgY29vcmRpbmF0ZXMucHVzaChwcmV2aW91cyArIGN1cnJlbnQgKiBydGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb29yZGluYXRlcyA9IGNvb3JkaW5hdGVzO1xuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAnd2lkdGgnLCAnaXRlbXMnLCAnc2V0dGluZ3MnIF0sXG4gICAgcnVuOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYWRkaW5nID0gdGhpcy5zZXR0aW5ncy5zdGFnZVBhZGRpbmcsXG4gICAgICAgIGNvb3JkaW5hdGVzID0gdGhpcy5fY29vcmRpbmF0ZXMsXG4gICAgICAgIGNzcyA9IHtcbiAgICAgICAgICAnd2lkdGgnOiBNYXRoLmNlaWwoTWF0aC5hYnMoY29vcmRpbmF0ZXNbY29vcmRpbmF0ZXMubGVuZ3RoIC0gMV0pKSArIHBhZGRpbmcgKiAyLFxuICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiBwYWRkaW5nIHx8ICcnLFxuICAgICAgICAgICdwYWRkaW5nLXJpZ2h0JzogcGFkZGluZyB8fCAnJ1xuICAgICAgICB9O1xuXG4gICAgICB0aGlzLiRzdGFnZS5jc3MoY3NzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ3dpZHRoJywgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2Nvb3JkaW5hdGVzLmxlbmd0aCxcbiAgICAgICAgZ3JpZCA9ICF0aGlzLnNldHRpbmdzLmF1dG9XaWR0aCxcbiAgICAgICAgaXRlbXMgPSB0aGlzLiRzdGFnZS5jaGlsZHJlbigpO1xuXG4gICAgICBpZiAoZ3JpZCAmJiBjYWNoZS5pdGVtcy5tZXJnZSkge1xuICAgICAgICB3aGlsZSAoaXRlcmF0b3ItLSkge1xuICAgICAgICAgIGNhY2hlLmNzcy53aWR0aCA9IHRoaXMuX3dpZHRoc1t0aGlzLnJlbGF0aXZlKGl0ZXJhdG9yKV07XG4gICAgICAgICAgaXRlbXMuZXEoaXRlcmF0b3IpLmNzcyhjYWNoZS5jc3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGdyaWQpIHtcbiAgICAgICAgY2FjaGUuY3NzLndpZHRoID0gY2FjaGUuaXRlbXMud2lkdGg7XG4gICAgICAgIGl0ZW1zLmNzcyhjYWNoZS5jc3MpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAnaXRlbXMnIF0sXG4gICAgcnVuOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2Nvb3JkaW5hdGVzLmxlbmd0aCA8IDEgJiYgdGhpcy4kc3RhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ3dpZHRoJywgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgIGNhY2hlLmN1cnJlbnQgPSBjYWNoZS5jdXJyZW50ID8gdGhpcy4kc3RhZ2UuY2hpbGRyZW4oKS5pbmRleChjYWNoZS5jdXJyZW50KSA6IDA7XG4gICAgICBjYWNoZS5jdXJyZW50ID0gTWF0aC5tYXgodGhpcy5taW5pbXVtKCksIE1hdGgubWluKHRoaXMubWF4aW11bSgpLCBjYWNoZS5jdXJyZW50KSk7XG4gICAgICB0aGlzLnJlc2V0KGNhY2hlLmN1cnJlbnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGZpbHRlcjogWyAncG9zaXRpb24nIF0sXG4gICAgcnVuOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmNvb3JkaW5hdGVzKHRoaXMuX2N1cnJlbnQpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBmaWx0ZXI6IFsgJ3dpZHRoJywgJ3Bvc2l0aW9uJywgJ2l0ZW1zJywgJ3NldHRpbmdzJyBdLFxuICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcnRsID0gdGhpcy5zZXR0aW5ncy5ydGwgPyAxIDogLTEsXG4gICAgICAgIHBhZGRpbmcgPSB0aGlzLnNldHRpbmdzLnN0YWdlUGFkZGluZyAqIDIsXG4gICAgICAgIGJlZ2luID0gdGhpcy5jb29yZGluYXRlcyh0aGlzLmN1cnJlbnQoKSkgKyBwYWRkaW5nLFxuICAgICAgICBlbmQgPSBiZWdpbiArIHRoaXMud2lkdGgoKSAqIHJ0bCxcbiAgICAgICAgaW5uZXIsIG91dGVyLCBtYXRjaGVzID0gW10sIGksIG47XG5cbiAgICAgIGZvciAoaSA9IDAsIG4gPSB0aGlzLl9jb29yZGluYXRlcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaW5uZXIgPSB0aGlzLl9jb29yZGluYXRlc1tpIC0gMV0gfHwgMDtcbiAgICAgICAgb3V0ZXIgPSBNYXRoLmFicyh0aGlzLl9jb29yZGluYXRlc1tpXSkgKyBwYWRkaW5nICogcnRsO1xuXG4gICAgICAgIGlmICgodGhpcy5vcChpbm5lciwgJzw9JywgYmVnaW4pICYmICh0aGlzLm9wKGlubmVyLCAnPicsIGVuZCkpKVxuICAgICAgICAgIHx8ICh0aGlzLm9wKG91dGVyLCAnPCcsIGJlZ2luKSAmJiB0aGlzLm9wKG91dGVyLCAnPicsIGVuZCkpKSB7XG4gICAgICAgICAgbWF0Y2hlcy5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHN0YWdlLmNoaWxkcmVuKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgdGhpcy4kc3RhZ2UuY2hpbGRyZW4oJzplcSgnICsgbWF0Y2hlcy5qb2luKCcpLCA6ZXEoJykgKyAnKScpLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuY2VudGVyKSB7XG4gICAgICAgIHRoaXMuJHN0YWdlLmNoaWxkcmVuKCcuY2VudGVyJykucmVtb3ZlQ2xhc3MoJ2NlbnRlcicpO1xuICAgICAgICB0aGlzLiRzdGFnZS5jaGlsZHJlbigpLmVxKHRoaXMuY3VycmVudCgpKS5hZGRDbGFzcygnY2VudGVyJyk7XG4gICAgICB9XG4gICAgfVxuICB9IF07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBjYXJvdXNlbC5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbnRlcignaW5pdGlhbGl6aW5nJyk7XG4gICAgdGhpcy50cmlnZ2VyKCdpbml0aWFsaXplJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMuc2V0dGluZ3MucnRsQ2xhc3MsIHRoaXMuc2V0dGluZ3MucnRsKTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG9XaWR0aCAmJiAhdGhpcy5pcygncHJlLWxvYWRpbmcnKSkge1xuICAgICAgdmFyIGltZ3MsIG5lc3RlZFNlbGVjdG9yLCB3aWR0aDtcbiAgICAgIGltZ3MgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpO1xuICAgICAgbmVzdGVkU2VsZWN0b3IgPSB0aGlzLnNldHRpbmdzLm5lc3RlZEl0ZW1TZWxlY3RvciA/ICcuJyArIHRoaXMuc2V0dGluZ3MubmVzdGVkSXRlbVNlbGVjdG9yIDogdW5kZWZpbmVkO1xuICAgICAgd2lkdGggPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKG5lc3RlZFNlbGVjdG9yKS53aWR0aCgpO1xuXG4gICAgICBpZiAoaW1ncy5sZW5ndGggJiYgd2lkdGggPD0gMCkge1xuICAgICAgICB0aGlzLnByZWxvYWRBdXRvV2lkdGhJbWFnZXMoaW1ncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMubG9hZGluZ0NsYXNzKTtcblxuICAgIC8vIGNyZWF0ZSBzdGFnZVxuICAgIHRoaXMuJHN0YWdlID0gJCgnPCcgKyB0aGlzLnNldHRpbmdzLnN0YWdlRWxlbWVudCArICcgY2xhc3M9XCInICsgdGhpcy5zZXR0aW5ncy5zdGFnZUNsYXNzICsgJ1wiLz4nKVxuICAgICAgLndyYXAoJzxkaXYgY2xhc3M9XCInICsgdGhpcy5zZXR0aW5ncy5zdGFnZU91dGVyQ2xhc3MgKyAnXCIvPicpO1xuXG4gICAgLy8gYXBwZW5kIHN0YWdlXG4gICAgdGhpcy4kZWxlbWVudC5hcHBlbmQodGhpcy4kc3RhZ2UucGFyZW50KCkpO1xuXG4gICAgLy8gYXBwZW5kIGNvbnRlbnRcbiAgICB0aGlzLnJlcGxhY2UodGhpcy4kZWxlbWVudC5jaGlsZHJlbigpLm5vdCh0aGlzLiRzdGFnZS5wYXJlbnQoKSkpO1xuXG4gICAgLy8gY2hlY2sgdmlzaWJpbGl0eVxuICAgIGlmICh0aGlzLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAvLyB1cGRhdGUgdmlld1xuICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGludmFsaWRhdGUgd2lkdGhcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgnd2lkdGgnKTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmxvYWRpbmdDbGFzcylcbiAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMubG9hZGVkQ2xhc3MpO1xuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuXG4gICAgdGhpcy5sZWF2ZSgnaW5pdGlhbGl6aW5nJyk7XG4gICAgdGhpcy50cmlnZ2VyKCdpbml0aWFsaXplZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXR1cHMgdGhlIGN1cnJlbnQgc2V0dGluZ3MuXG4gICAqIEB0b2RvIFJlbW92ZSByZXNwb25zaXZlIGNsYXNzZXMuIFdoeSBzaG91bGQgYWRhcHRpdmUgZGVzaWducyBiZSBicm91Z2h0IGludG8gSUU4P1xuICAgKiBAdG9kbyBTdXBwb3J0IGZvciBtZWRpYSBxdWVyaWVzIGJ5IHVzaW5nIGBtYXRjaE1lZGlhYCB3b3VsZCBiZSBuaWNlLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZpZXdwb3J0ID0gdGhpcy52aWV3cG9ydCgpLFxuICAgICAgb3ZlcndyaXRlcyA9IHRoaXMub3B0aW9ucy5yZXNwb25zaXZlLFxuICAgICAgbWF0Y2ggPSAtMSxcbiAgICAgIHNldHRpbmdzID0gbnVsbDtcblxuICAgIGlmICghb3ZlcndyaXRlcykge1xuICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJC5lYWNoKG92ZXJ3cml0ZXMsIGZ1bmN0aW9uKGJyZWFrcG9pbnQpIHtcbiAgICAgICAgaWYgKGJyZWFrcG9pbnQgPD0gdmlld3BvcnQgJiYgYnJlYWtwb2ludCA+IG1hdGNoKSB7XG4gICAgICAgICAgbWF0Y2ggPSBOdW1iZXIoYnJlYWtwb2ludCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG92ZXJ3cml0ZXNbbWF0Y2hdKTtcbiAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Muc3RhZ2VQYWRkaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNldHRpbmdzLnN0YWdlUGFkZGluZyA9IHNldHRpbmdzLnN0YWdlUGFkZGluZygpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHNldHRpbmdzLnJlc3BvbnNpdmU7XG5cbiAgICAgIC8vIHJlc3BvbnNpdmUgY2xhc3NcbiAgICAgIGlmIChzZXR0aW5ncy5yZXNwb25zaXZlQ2xhc3MpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdjbGFzcycsXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdjbGFzcycpLnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyB0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZUNsYXNzICsgJy0pXFxcXFMrXFxcXHMnLCAnZycpLCAnJDEnICsgbWF0Y2gpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnLCB7IHByb3BlcnR5OiB7IG5hbWU6ICdzZXR0aW5ncycsIHZhbHVlOiBzZXR0aW5ncyB9IH0pO1xuICAgIHRoaXMuX2JyZWFrcG9pbnQgPSBtYXRjaDtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5pbnZhbGlkYXRlKCdzZXR0aW5ncycpO1xuICAgIHRoaXMudHJpZ2dlcignY2hhbmdlZCcsIHsgcHJvcGVydHk6IHsgbmFtZTogJ3NldHRpbmdzJywgdmFsdWU6IHRoaXMuc2V0dGluZ3MgfSB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVXBkYXRlcyBvcHRpb24gbG9naWMgaWYgbmVjZXNzZXJ5LlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm9wdGlvbnNMb2dpYyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG9XaWR0aCkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zdGFnZVBhZGRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0dGluZ3MubWVyZ2UgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZXBhcmVzIGFuIGl0ZW0gYmVmb3JlIGFkZC5cbiAgICogQHRvZG8gUmVuYW1lIGV2ZW50IHBhcmFtZXRlciBgY29udGVudGAgdG8gYGl0ZW1gLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9IC0gVGhlIGl0ZW0gY29udGFpbmVyLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBldmVudCA9IHRoaXMudHJpZ2dlcigncHJlcGFyZScsIHsgY29udGVudDogaXRlbSB9KTtcblxuICAgIGlmICghZXZlbnQuZGF0YSkge1xuICAgICAgZXZlbnQuZGF0YSA9ICQoJzwnICsgdGhpcy5zZXR0aW5ncy5pdGVtRWxlbWVudCArICcvPicpXG4gICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuaXRlbUNsYXNzKS5hcHBlbmQoaXRlbSlcbiAgICB9XG5cbiAgICB0aGlzLnRyaWdnZXIoJ3ByZXBhcmVkJywgeyBjb250ZW50OiBldmVudC5kYXRhIH0pO1xuXG4gICAgcmV0dXJuIGV2ZW50LmRhdGE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZpZXcuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIE93bC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgbiA9IHRoaXMuX3BpcGUubGVuZ3RoLFxuICAgICAgZmlsdGVyID0gJC5wcm94eShmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzW3BdIH0sIHRoaXMuX2ludmFsaWRhdGVkKSxcbiAgICAgIGNhY2hlID0ge307XG5cbiAgICB3aGlsZSAoaSA8IG4pIHtcbiAgICAgIGlmICh0aGlzLl9pbnZhbGlkYXRlZC5hbGwgfHwgJC5ncmVwKHRoaXMuX3BpcGVbaV0uZmlsdGVyLCBmaWx0ZXIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fcGlwZVtpXS5ydW4oY2FjaGUpO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIHRoaXMuX2ludmFsaWRhdGVkID0ge307XG5cbiAgICAhdGhpcy5pcygndmFsaWQnKSAmJiB0aGlzLmVudGVyKCd2YWxpZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB3aWR0aCBvZiB0aGUgdmlldy5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge093bC5XaWR0aH0gW2RpbWVuc2lvbj1Pd2wuV2lkdGguRGVmYXVsdF0gLSBUaGUgZGltZW5zaW9uIHRvIHJldHVybi5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaGUgd2lkdGggb2YgdGhlIHZpZXcgaW4gcGl4ZWwuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLndpZHRoID0gZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgZGltZW5zaW9uID0gZGltZW5zaW9uIHx8IE93bC5XaWR0aC5EZWZhdWx0O1xuICAgIHN3aXRjaCAoZGltZW5zaW9uKSB7XG4gICAgICBjYXNlIE93bC5XaWR0aC5Jbm5lcjpcbiAgICAgIGNhc2UgT3dsLldpZHRoLk91dGVyOlxuICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGggLSB0aGlzLnNldHRpbmdzLnN0YWdlUGFkZGluZyAqIDIgKyB0aGlzLnNldHRpbmdzLm1hcmdpbjtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZnJlc2hlcyB0aGUgY2Fyb3VzZWwgcHJpbWFyaWx5IGZvciBhZGFwdGl2ZSBwdXJwb3Nlcy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbnRlcigncmVmcmVzaGluZycpO1xuICAgIHRoaXMudHJpZ2dlcigncmVmcmVzaCcpO1xuXG4gICAgdGhpcy5zZXR1cCgpO1xuXG4gICAgdGhpcy5vcHRpb25zTG9naWMoKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnJlZnJlc2hDbGFzcyk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMucmVmcmVzaENsYXNzKTtcblxuICAgIHRoaXMubGVhdmUoJ3JlZnJlc2hpbmcnKTtcbiAgICB0aGlzLnRyaWdnZXIoJ3JlZnJlc2hlZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2luZG93IGByZXNpemVgIGV2ZW50LlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm9uVGhyb3R0bGVkUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVyKTtcbiAgICB0aGlzLnJlc2l6ZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5faGFuZGxlcnMub25SZXNpemUsIHRoaXMuc2V0dGluZ3MucmVzcG9uc2l2ZVJlZnJlc2hSYXRlKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIHdpbmRvdyBgcmVzaXplYCBldmVudC5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5vblJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3dpZHRoID09PSB0aGlzLiRlbGVtZW50LndpZHRoKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmVudGVyKCdyZXNpemluZycpO1xuXG4gICAgaWYgKHRoaXMudHJpZ2dlcigncmVzaXplJykuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgIHRoaXMubGVhdmUoJ3Jlc2l6aW5nJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5pbnZhbGlkYXRlKCd3aWR0aCcpO1xuXG4gICAgdGhpcy5yZWZyZXNoKCk7XG5cbiAgICB0aGlzLmxlYXZlKCdyZXNpemluZycpO1xuICAgIHRoaXMudHJpZ2dlcigncmVzaXplZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgZXZlbnQgaGFuZGxlcnMuXG4gICAqIEB0b2RvIENoZWNrIGBtc1BvaW50ZXJFbmFibGVkYFxuICAgKiBAdG9kbyAjMjYxXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIE93bC5wcm90b3R5cGUucmVnaXN0ZXJFdmVudEhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQuc3VwcG9ydC50cmFuc2l0aW9uKSB7XG4gICAgICB0aGlzLiRzdGFnZS5vbigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQgKyAnLm93bC5jb3JlJywgJC5wcm94eSh0aGlzLm9uVHJhbnNpdGlvbkVuZCwgdGhpcykpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnJlc3BvbnNpdmUgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLm9uKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZXJzLm9uVGhyb3R0bGVkUmVzaXplKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5tb3VzZURyYWcpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmRyYWdDbGFzcyk7XG4gICAgICB0aGlzLiRzdGFnZS5vbignbW91c2Vkb3duLm93bC5jb3JlJywgJC5wcm94eSh0aGlzLm9uRHJhZ1N0YXJ0LCB0aGlzKSk7XG4gICAgICB0aGlzLiRzdGFnZS5vbignZHJhZ3N0YXJ0Lm93bC5jb3JlIHNlbGVjdHN0YXJ0Lm93bC5jb3JlJywgZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy50b3VjaERyYWcpe1xuICAgICAgdGhpcy4kc3RhZ2Uub24oJ3RvdWNoc3RhcnQub3dsLmNvcmUnLCAkLnByb3h5KHRoaXMub25EcmFnU3RhcnQsIHRoaXMpKTtcbiAgICAgIHRoaXMuJHN0YWdlLm9uKCd0b3VjaGNhbmNlbC5vd2wuY29yZScsICQucHJveHkodGhpcy5vbkRyYWdFbmQsIHRoaXMpKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYHRvdWNoc3RhcnRgIGFuZCBgbW91c2Vkb3duYCBldmVudHMuXG4gICAqIEB0b2RvIEhvcml6b250YWwgc3dpcGUgdGhyZXNob2xkIGFzIG9wdGlvblxuICAgKiBAdG9kbyAjMjYxXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgYXJndW1lbnRzLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5vbkRyYWdTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHN0YWdlID0gbnVsbDtcblxuICAgIGlmIChldmVudC53aGljaCA9PT0gMykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkLnN1cHBvcnQudHJhbnNmb3JtKSB7XG4gICAgICBzdGFnZSA9IHRoaXMuJHN0YWdlLmNzcygndHJhbnNmb3JtJykucmVwbGFjZSgvLipcXCh8XFwpfCAvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgICBzdGFnZSA9IHtcbiAgICAgICAgeDogc3RhZ2Vbc3RhZ2UubGVuZ3RoID09PSAxNiA/IDEyIDogNF0sXG4gICAgICAgIHk6IHN0YWdlW3N0YWdlLmxlbmd0aCA9PT0gMTYgPyAxMyA6IDVdXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFnZSA9IHRoaXMuJHN0YWdlLnBvc2l0aW9uKCk7XG4gICAgICBzdGFnZSA9IHtcbiAgICAgICAgeDogdGhpcy5zZXR0aW5ncy5ydGwgP1xuICAgICAgICAgIHN0YWdlLmxlZnQgKyB0aGlzLiRzdGFnZS53aWR0aCgpIC0gdGhpcy53aWR0aCgpICsgdGhpcy5zZXR0aW5ncy5tYXJnaW4gOlxuICAgICAgICAgIHN0YWdlLmxlZnQsXG4gICAgICAgIHk6IHN0YWdlLnRvcFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pcygnYW5pbWF0aW5nJykpIHtcbiAgICAgICQuc3VwcG9ydC50cmFuc2Zvcm0gPyB0aGlzLmFuaW1hdGUoc3RhZ2UueCkgOiB0aGlzLiRzdGFnZS5zdG9wKClcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgncG9zaXRpb24nKTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMub3B0aW9ucy5ncmFiQ2xhc3MsIGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKTtcblxuICAgIHRoaXMuc3BlZWQoMCk7XG5cbiAgICB0aGlzLl9kcmFnLnRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLl9kcmFnLnRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICB0aGlzLl9kcmFnLnN0YWdlLnN0YXJ0ID0gc3RhZ2U7XG4gICAgdGhpcy5fZHJhZy5zdGFnZS5jdXJyZW50ID0gc3RhZ2U7XG4gICAgdGhpcy5fZHJhZy5wb2ludGVyID0gdGhpcy5wb2ludGVyKGV2ZW50KTtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwLm93bC5jb3JlIHRvdWNoZW5kLm93bC5jb3JlJywgJC5wcm94eSh0aGlzLm9uRHJhZ0VuZCwgdGhpcykpO1xuXG4gICAgJChkb2N1bWVudCkub25lKCdtb3VzZW1vdmUub3dsLmNvcmUgdG91Y2htb3ZlLm93bC5jb3JlJywgJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGRlbHRhID0gdGhpcy5kaWZmZXJlbmNlKHRoaXMuX2RyYWcucG9pbnRlciwgdGhpcy5wb2ludGVyKGV2ZW50KSk7XG5cbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUub3dsLmNvcmUgdG91Y2htb3ZlLm93bC5jb3JlJywgJC5wcm94eSh0aGlzLm9uRHJhZ01vdmUsIHRoaXMpKTtcblxuICAgICAgaWYgKE1hdGguYWJzKGRlbHRhLngpIDwgTWF0aC5hYnMoZGVsdGEueSkgJiYgdGhpcy5pcygndmFsaWQnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuZW50ZXIoJ2RyYWdnaW5nJyk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2RyYWcnKTtcbiAgICB9LCB0aGlzKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGB0b3VjaG1vdmVgIGFuZCBgbW91c2Vtb3ZlYCBldmVudHMuXG4gICAqIEB0b2RvICMyNjFcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIFRoZSBldmVudCBhcmd1bWVudHMuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm9uRHJhZ01vdmUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBtaW5pbXVtID0gbnVsbCxcbiAgICAgIG1heGltdW0gPSBudWxsLFxuICAgICAgcHVsbCA9IG51bGwsXG4gICAgICBkZWx0YSA9IHRoaXMuZGlmZmVyZW5jZSh0aGlzLl9kcmFnLnBvaW50ZXIsIHRoaXMucG9pbnRlcihldmVudCkpLFxuICAgICAgc3RhZ2UgPSB0aGlzLmRpZmZlcmVuY2UodGhpcy5fZHJhZy5zdGFnZS5zdGFydCwgZGVsdGEpO1xuXG4gICAgaWYgKCF0aGlzLmlzKCdkcmFnZ2luZycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmxvb3ApIHtcbiAgICAgIG1pbmltdW0gPSB0aGlzLmNvb3JkaW5hdGVzKHRoaXMubWluaW11bSgpKTtcbiAgICAgIG1heGltdW0gPSB0aGlzLmNvb3JkaW5hdGVzKHRoaXMubWF4aW11bSgpICsgMSkgLSBtaW5pbXVtO1xuICAgICAgc3RhZ2UueCA9ICgoKHN0YWdlLnggLSBtaW5pbXVtKSAlIG1heGltdW0gKyBtYXhpbXVtKSAlIG1heGltdW0pICsgbWluaW11bTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWluaW11bSA9IHRoaXMuc2V0dGluZ3MucnRsID8gdGhpcy5jb29yZGluYXRlcyh0aGlzLm1heGltdW0oKSkgOiB0aGlzLmNvb3JkaW5hdGVzKHRoaXMubWluaW11bSgpKTtcbiAgICAgIG1heGltdW0gPSB0aGlzLnNldHRpbmdzLnJ0bCA/IHRoaXMuY29vcmRpbmF0ZXModGhpcy5taW5pbXVtKCkpIDogdGhpcy5jb29yZGluYXRlcyh0aGlzLm1heGltdW0oKSk7XG4gICAgICBwdWxsID0gdGhpcy5zZXR0aW5ncy5wdWxsRHJhZyA/IC0xICogZGVsdGEueCAvIDUgOiAwO1xuICAgICAgc3RhZ2UueCA9IE1hdGgubWF4KE1hdGgubWluKHN0YWdlLngsIG1pbmltdW0gKyBwdWxsKSwgbWF4aW11bSArIHB1bGwpO1xuICAgIH1cblxuICAgIHRoaXMuX2RyYWcuc3RhZ2UuY3VycmVudCA9IHN0YWdlO1xuXG4gICAgdGhpcy5hbmltYXRlKHN0YWdlLngpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBgdG91Y2hlbmRgIGFuZCBgbW91c2V1cGAgZXZlbnRzLlxuICAgKiBAdG9kbyAjMjYxXG4gICAqIEB0b2RvIFRocmVzaG9sZCBmb3IgY2xpY2sgZXZlbnRcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIFRoZSBldmVudCBhcmd1bWVudHMuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm9uRHJhZ0VuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGRlbHRhID0gdGhpcy5kaWZmZXJlbmNlKHRoaXMuX2RyYWcucG9pbnRlciwgdGhpcy5wb2ludGVyKGV2ZW50KSksXG4gICAgICBzdGFnZSA9IHRoaXMuX2RyYWcuc3RhZ2UuY3VycmVudCxcbiAgICAgIGRpcmVjdGlvbiA9IGRlbHRhLnggPiAwIF4gdGhpcy5zZXR0aW5ncy5ydGwgPyAnbGVmdCcgOiAncmlnaHQnO1xuXG4gICAgJChkb2N1bWVudCkub2ZmKCcub3dsLmNvcmUnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmdyYWJDbGFzcyk7XG5cbiAgICBpZiAoZGVsdGEueCAhPT0gMCAmJiB0aGlzLmlzKCdkcmFnZ2luZycpIHx8ICF0aGlzLmlzKCd2YWxpZCcpKSB7XG4gICAgICB0aGlzLnNwZWVkKHRoaXMuc2V0dGluZ3MuZHJhZ0VuZFNwZWVkIHx8IHRoaXMuc2V0dGluZ3Muc21hcnRTcGVlZCk7XG4gICAgICB0aGlzLmN1cnJlbnQodGhpcy5jbG9zZXN0KHN0YWdlLngsIGRlbHRhLnggIT09IDAgPyBkaXJlY3Rpb24gOiB0aGlzLl9kcmFnLmRpcmVjdGlvbikpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCdwb3NpdGlvbicpO1xuICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgICAgdGhpcy5fZHJhZy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cbiAgICAgIGlmIChNYXRoLmFicyhkZWx0YS54KSA+IDMgfHwgbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLl9kcmFnLnRpbWUgPiAzMDApIHtcbiAgICAgICAgdGhpcy5fZHJhZy50YXJnZXQub25lKCdjbGljay5vd2wuY29yZScsIGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5pcygnZHJhZ2dpbmcnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubGVhdmUoJ2RyYWdnaW5nJyk7XG4gICAgdGhpcy50cmlnZ2VyKCdkcmFnZ2VkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIGNsb3Nlc3QgaXRlbSBmb3IgYSBjb29yZGluYXRlLlxuICAgKiBAdG9kbyBTZXR0aW5nIGBmcmVlRHJhZ2AgbWFrZXMgYGNsb3Nlc3RgIG5vdCByZXVzYWJsZS4gU2VlICMxNjUuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvb3JkaW5hdGUgLSBUaGUgY29vcmRpbmF0ZSBpbiBwaXhlbC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiAtIFRoZSBkaXJlY3Rpb24gdG8gY2hlY2sgZm9yIHRoZSBjbG9zZXN0IGl0ZW0uIEV0aGVyIGBsZWZ0YCBvciBgcmlnaHRgLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSBjbG9zZXN0IGl0ZW0uXG4gICAqL1xuICBPd2wucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihjb29yZGluYXRlLCBkaXJlY3Rpb24pIHtcbiAgICB2YXIgcG9zaXRpb24gPSAtMSxcbiAgICAgIHB1bGwgPSAzMCxcbiAgICAgIHdpZHRoID0gdGhpcy53aWR0aCgpLFxuICAgICAgY29vcmRpbmF0ZXMgPSB0aGlzLmNvb3JkaW5hdGVzKCk7XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZnJlZURyYWcpIHtcbiAgICAgIC8vIGNoZWNrIGNsb3Nlc3QgaXRlbVxuICAgICAgJC5lYWNoKGNvb3JkaW5hdGVzLCAkLnByb3h5KGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICAvLyBvbiBhIGxlZnQgcHVsbCwgY2hlY2sgb24gY3VycmVudCBpbmRleFxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcgJiYgY29vcmRpbmF0ZSA+IHZhbHVlIC0gcHVsbCAmJiBjb29yZGluYXRlIDwgdmFsdWUgKyBwdWxsKSB7XG4gICAgICAgICAgcG9zaXRpb24gPSBpbmRleDtcbiAgICAgICAgLy8gb24gYSByaWdodCBwdWxsLCBjaGVjayBvbiBwcmV2aW91cyBpbmRleFxuICAgICAgICAvLyB0byBkbyBzbywgc3VidHJhY3Qgd2lkdGggZnJvbSB2YWx1ZSBhbmQgc2V0IHBvc2l0aW9uID0gaW5kZXggKyAxXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnICYmIGNvb3JkaW5hdGUgPiB2YWx1ZSAtIHdpZHRoIC0gcHVsbCAmJiBjb29yZGluYXRlIDwgdmFsdWUgLSB3aWR0aCArIHB1bGwpIHtcbiAgICAgICAgICBwb3NpdGlvbiA9IGluZGV4ICsgMTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wKGNvb3JkaW5hdGUsICc8JywgdmFsdWUpXG4gICAgICAgICAgJiYgdGhpcy5vcChjb29yZGluYXRlLCAnPicsIGNvb3JkaW5hdGVzW2luZGV4ICsgMV0gfHwgdmFsdWUgLSB3aWR0aCkpIHtcbiAgICAgICAgICBwb3NpdGlvbiA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gaW5kZXggKyAxIDogaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uID09PSAtMTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MubG9vcCkge1xuICAgICAgLy8gbm9uIGxvb3AgYm91bmRyaWVzXG4gICAgICBpZiAodGhpcy5vcChjb29yZGluYXRlLCAnPicsIGNvb3JkaW5hdGVzW3RoaXMubWluaW11bSgpXSkpIHtcbiAgICAgICAgcG9zaXRpb24gPSBjb29yZGluYXRlID0gdGhpcy5taW5pbXVtKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3AoY29vcmRpbmF0ZSwgJzwnLCBjb29yZGluYXRlc1t0aGlzLm1heGltdW0oKV0pKSB7XG4gICAgICAgIHBvc2l0aW9uID0gY29vcmRpbmF0ZSA9IHRoaXMubWF4aW11bSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfTtcblxuICAvKipcbiAgICogQW5pbWF0ZXMgdGhlIHN0YWdlLlxuICAgKiBAdG9kbyAjMjcwXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvb3JkaW5hdGUgLSBUaGUgY29vcmRpbmF0ZSBpbiBwaXhlbHMuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbihjb29yZGluYXRlKSB7XG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLnNwZWVkKCkgPiAwO1xuXG4gICAgdGhpcy5pcygnYW5pbWF0aW5nJykgJiYgdGhpcy5vblRyYW5zaXRpb25FbmQoKTtcblxuICAgIGlmIChhbmltYXRlKSB7XG4gICAgICB0aGlzLmVudGVyKCdhbmltYXRpbmcnKTtcbiAgICAgIHRoaXMudHJpZ2dlcigndHJhbnNsYXRlJyk7XG4gICAgfVxuXG4gICAgaWYgKCQuc3VwcG9ydC50cmFuc2Zvcm0zZCAmJiAkLnN1cHBvcnQudHJhbnNpdGlvbikge1xuICAgICAgdGhpcy4kc3RhZ2UuY3NzKHtcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoJyArIGNvb3JkaW5hdGUgKyAncHgsMHB4LDBweCknLFxuICAgICAgICB0cmFuc2l0aW9uOiAodGhpcy5zcGVlZCgpIC8gMTAwMCkgKyAncydcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoYW5pbWF0ZSkge1xuICAgICAgdGhpcy4kc3RhZ2UuYW5pbWF0ZSh7XG4gICAgICAgIGxlZnQ6IGNvb3JkaW5hdGUgKyAncHgnXG4gICAgICB9LCB0aGlzLnNwZWVkKCksIHRoaXMuc2V0dGluZ3MuZmFsbGJhY2tFYXNpbmcsICQucHJveHkodGhpcy5vblRyYW5zaXRpb25FbmQsIHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kc3RhZ2UuY3NzKHtcbiAgICAgICAgbGVmdDogY29vcmRpbmF0ZSArICdweCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGNhcm91c2VsIGlzIGluIGEgc3BlY2lmaWMgc3RhdGUgb3Igbm90LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdGUgLSBUaGUgc3RhdGUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIFRoZSBmbGFnIHdoaWNoIGluZGljYXRlcyBpZiB0aGUgY2Fyb3VzZWwgaXMgYnVzeS5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZXMuY3VycmVudFtzdGF0ZV0gJiYgdGhpcy5fc3RhdGVzLmN1cnJlbnRbc3RhdGVdID4gMDtcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3Bvc2l0aW9uXSAtIFRoZSBuZXcgYWJzb2x1dGUgcG9zaXRpb24gb3Igbm90aGluZyB0byBsZWF2ZSBpdCB1bmNoYW5nZWQuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IGl0ZW0uXG4gICAqL1xuICBPd2wucHJvdG90eXBlLmN1cnJlbnQgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gdGhpcy5ub3JtYWxpemUocG9zaXRpb24pO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnQgIT09IHBvc2l0aW9uKSB7XG4gICAgICB2YXIgZXZlbnQgPSB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHsgcHJvcGVydHk6IHsgbmFtZTogJ3Bvc2l0aW9uJywgdmFsdWU6IHBvc2l0aW9uIH0gfSk7XG5cbiAgICAgIGlmIChldmVudC5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLm5vcm1hbGl6ZShldmVudC5kYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY3VycmVudCA9IHBvc2l0aW9uO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGUoJ3Bvc2l0aW9uJyk7XG5cbiAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlZCcsIHsgcHJvcGVydHk6IHsgbmFtZTogJ3Bvc2l0aW9uJywgdmFsdWU6IHRoaXMuX2N1cnJlbnQgfSB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudDtcbiAgfTtcblxuICAvKipcbiAgICogSW52YWxpZGF0ZXMgdGhlIGdpdmVuIHBhcnQgb2YgdGhlIHVwZGF0ZSByb3V0aW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3BhcnRdIC0gVGhlIHBhcnQgdG8gaW52YWxpZGF0ZS5cbiAgICogQHJldHVybnMge0FycmF5LjxTdHJpbmc+fSAtIFRoZSBpbnZhbGlkYXRlZCBwYXJ0cy5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuaW52YWxpZGF0ZSA9IGZ1bmN0aW9uKHBhcnQpIHtcbiAgICBpZiAoJC50eXBlKHBhcnQpID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZWRbcGFydF0gPSB0cnVlO1xuICAgICAgdGhpcy5pcygndmFsaWQnKSAmJiB0aGlzLmxlYXZlKCd2YWxpZCcpO1xuICAgIH1cbiAgICByZXR1cm4gJC5tYXAodGhpcy5faW52YWxpZGF0ZWQsIGZ1bmN0aW9uKHYsIGkpIHsgcmV0dXJuIGkgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBUaGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIG5ldyBpdGVtLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLm5vcm1hbGl6ZShwb3NpdGlvbik7XG5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NwZWVkID0gMDtcbiAgICB0aGlzLl9jdXJyZW50ID0gcG9zaXRpb247XG5cbiAgICB0aGlzLnN1cHByZXNzKFsgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGVkJyBdKTtcblxuICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmNvb3JkaW5hdGVzKHBvc2l0aW9uKSk7XG5cbiAgICB0aGlzLnJlbGVhc2UoWyAndHJhbnNsYXRlJywgJ3RyYW5zbGF0ZWQnIF0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIGFic29sdXRlIG9yIGEgcmVsYXRpdmUgcG9zaXRpb24gb2YgYW4gaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBUaGUgYWJzb2x1dGUgb3IgcmVsYXRpdmUgcG9zaXRpb24gdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZT1mYWxzZV0gLSBXaGV0aGVyIHRoZSBnaXZlbiBwb3NpdGlvbiBpcyByZWxhdGl2ZSBvciBub3QuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGhlIG5vcm1hbGl6ZWQgcG9zaXRpb24uXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBvc2l0aW9uLCByZWxhdGl2ZSkge1xuICAgIHZhciBuID0gdGhpcy5faXRlbXMubGVuZ3RoLFxuICAgICAgbSA9IHJlbGF0aXZlID8gMCA6IHRoaXMuX2Nsb25lcy5sZW5ndGg7XG5cbiAgICBpZiAoIXRoaXMuaXNOdW1lcmljKHBvc2l0aW9uKSB8fCBuIDwgMSkge1xuICAgICAgcG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbiArIG0pIHtcbiAgICAgIHBvc2l0aW9uID0gKChwb3NpdGlvbiAtIG0gLyAyKSAlIG4gKyBuKSAlIG4gKyBtIC8gMjtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFuIGFic29sdXRlIHBvc2l0aW9uIG9mIGFuIGl0ZW0gaW50byBhIHJlbGF0aXZlIG9uZS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBUaGUgYWJzb2x1dGUgcG9zaXRpb24gdG8gY29udmVydC5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaGUgY29udmVydGVkIHBvc2l0aW9uLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5yZWxhdGl2ZSA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgcG9zaXRpb24gLT0gdGhpcy5fY2xvbmVzLmxlbmd0aCAvIDI7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHBvc2l0aW9uLCB0cnVlKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWF4aW11bSBwb3NpdGlvbiBmb3IgdGhlIGN1cnJlbnQgaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZT1mYWxzZV0gLSBXaGV0aGVyIHRvIHJldHVybiBhbiBhYnNvbHV0ZSBwb3NpdGlvbiBvciBhIHJlbGF0aXZlIHBvc2l0aW9uLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5tYXhpbXVtID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLnNldHRpbmdzLFxuICAgICAgbWF4aW11bSA9IHRoaXMuX2Nvb3JkaW5hdGVzLmxlbmd0aCxcbiAgICAgIGl0ZXJhdG9yLFxuICAgICAgcmVjaXByb2NhbEl0ZW1zV2lkdGgsXG4gICAgICBlbGVtZW50V2lkdGg7XG5cbiAgICBpZiAoc2V0dGluZ3MubG9vcCkge1xuICAgICAgbWF4aW11bSA9IHRoaXMuX2Nsb25lcy5sZW5ndGggLyAyICsgdGhpcy5faXRlbXMubGVuZ3RoIC0gMTtcbiAgICB9IGVsc2UgaWYgKHNldHRpbmdzLmF1dG9XaWR0aCB8fCBzZXR0aW5ncy5tZXJnZSkge1xuICAgICAgaXRlcmF0b3IgPSB0aGlzLl9pdGVtcy5sZW5ndGg7XG4gICAgICByZWNpcHJvY2FsSXRlbXNXaWR0aCA9IHRoaXMuX2l0ZW1zWy0taXRlcmF0b3JdLndpZHRoKCk7XG4gICAgICBlbGVtZW50V2lkdGggPSB0aGlzLiRlbGVtZW50LndpZHRoKCk7XG4gICAgICB3aGlsZSAoaXRlcmF0b3ItLSkge1xuICAgICAgICByZWNpcHJvY2FsSXRlbXNXaWR0aCArPSB0aGlzLl9pdGVtc1tpdGVyYXRvcl0ud2lkdGgoKSArIHRoaXMuc2V0dGluZ3MubWFyZ2luO1xuICAgICAgICBpZiAocmVjaXByb2NhbEl0ZW1zV2lkdGggPiBlbGVtZW50V2lkdGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbWF4aW11bSA9IGl0ZXJhdG9yICsgMTtcbiAgICB9IGVsc2UgaWYgKHNldHRpbmdzLmNlbnRlcikge1xuICAgICAgbWF4aW11bSA9IHRoaXMuX2l0ZW1zLmxlbmd0aCAtIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1heGltdW0gPSB0aGlzLl9pdGVtcy5sZW5ndGggLSBzZXR0aW5ncy5pdGVtcztcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgIG1heGltdW0gLT0gdGhpcy5fY2xvbmVzLmxlbmd0aCAvIDI7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgubWF4KG1heGltdW0sIDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtaW5pbXVtIHBvc2l0aW9uIGZvciB0aGUgY3VycmVudCBpdGVtLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlbGF0aXZlPWZhbHNlXSAtIFdoZXRoZXIgdG8gcmV0dXJuIGFuIGFic29sdXRlIHBvc2l0aW9uIG9yIGEgcmVsYXRpdmUgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBPd2wucHJvdG90eXBlLm1pbmltdW0gPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICAgIHJldHVybiByZWxhdGl2ZSA/IDAgOiB0aGlzLl9jbG9uZXMubGVuZ3RoIC8gMjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyBhbiBpdGVtIGF0IHRoZSBzcGVjaWZpZWQgcmVsYXRpdmUgcG9zaXRpb24uXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwb3NpdGlvbl0gLSBUaGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIGl0ZW0uXG4gICAqIEByZXR1cm4ge2pRdWVyeXxBcnJheS48alF1ZXJ5Pn0gLSBUaGUgaXRlbSBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gb3IgYWxsIGl0ZW1zIGlmIG5vIHBvc2l0aW9uIHdhcyBnaXZlbi5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuaXRlbXMgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlbXMuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IHRoaXMubm9ybWFsaXplKHBvc2l0aW9uLCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcy5faXRlbXNbcG9zaXRpb25dO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIGFuIGl0ZW0gYXQgdGhlIHNwZWNpZmllZCByZWxhdGl2ZSBwb3NpdGlvbi5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3Bvc2l0aW9uXSAtIFRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgaXRlbS5cbiAgICogQHJldHVybiB7alF1ZXJ5fEFycmF5LjxqUXVlcnk+fSAtIFRoZSBpdGVtIGF0IHRoZSBnaXZlbiBwb3NpdGlvbiBvciBhbGwgaXRlbXMgaWYgbm8gcG9zaXRpb24gd2FzIGdpdmVuLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5tZXJnZXJzID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21lcmdlcnMuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IHRoaXMubm9ybWFsaXplKHBvc2l0aW9uLCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Vyc1twb3NpdGlvbl07XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGFic29sdXRlIHBvc2l0aW9ucyBvZiBjbG9uZXMgZm9yIGFuIGl0ZW0uXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwb3NpdGlvbl0gLSBUaGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIGl0ZW0uXG4gICAqIEByZXR1cm5zIHtBcnJheS48TnVtYmVyPn0gLSBUaGUgYWJzb2x1dGUgcG9zaXRpb25zIG9mIGNsb25lcyBmb3IgdGhlIGl0ZW0gb3IgYWxsIGlmIG5vIHBvc2l0aW9uIHdhcyBnaXZlbi5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuY2xvbmVzID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICB2YXIgb2RkID0gdGhpcy5fY2xvbmVzLmxlbmd0aCAvIDIsXG4gICAgICBldmVuID0gb2RkICsgdGhpcy5faXRlbXMubGVuZ3RoLFxuICAgICAgbWFwID0gZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGluZGV4ICUgMiA9PT0gMCA/IGV2ZW4gKyBpbmRleCAvIDIgOiBvZGQgLSAoaW5kZXggKyAxKSAvIDIgfTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJC5tYXAodGhpcy5fY2xvbmVzLCBmdW5jdGlvbih2LCBpKSB7IHJldHVybiBtYXAoaSkgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICQubWFwKHRoaXMuX2Nsb25lcywgZnVuY3Rpb24odiwgaSkgeyByZXR1cm4gdiA9PT0gcG9zaXRpb24gPyBtYXAoaSkgOiBudWxsIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IGFuaW1hdGlvbiBzcGVlZC5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3NwZWVkXSAtIFRoZSBhbmltYXRpb24gc3BlZWQgaW4gbWlsbGlzZWNvbmRzIG9yIG5vdGhpbmcgdG8gbGVhdmUgaXQgdW5jaGFuZ2VkLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSAtIFRoZSBjdXJyZW50IGFuaW1hdGlvbiBzcGVlZCBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnNwZWVkID0gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fc3BlZWQgPSBzcGVlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3BlZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNvb3JkaW5hdGUgb2YgYW4gaXRlbS5cbiAgICogQHRvZG8gVGhlIG5hbWUgb2YgdGhpcyBtZXRob2QgaXMgbWlzc2xlYW5kaW5nLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiAtIFRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSB3aXRoaW4gYG1pbmltdW0oKWAgYW5kIGBtYXhpbXVtKClgLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfEFycmF5LjxOdW1iZXI+fSAtIFRoZSBjb29yZGluYXRlIG9mIHRoZSBpdGVtIGluIHBpeGVsIG9yIGFsbCBjb29yZGluYXRlcy5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuY29vcmRpbmF0ZXMgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgIHZhciBtdWx0aXBsaWVyID0gMSxcbiAgICAgIG5ld1Bvc2l0aW9uID0gcG9zaXRpb24gLSAxLFxuICAgICAgY29vcmRpbmF0ZTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJC5tYXAodGhpcy5fY29vcmRpbmF0ZXMsICQucHJveHkoZnVuY3Rpb24oY29vcmRpbmF0ZSwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29vcmRpbmF0ZXMoaW5kZXgpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNlbnRlcikge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucnRsKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAtMTtcbiAgICAgICAgbmV3UG9zaXRpb24gPSBwb3NpdGlvbiArIDE7XG4gICAgICB9XG5cbiAgICAgIGNvb3JkaW5hdGUgPSB0aGlzLl9jb29yZGluYXRlc1twb3NpdGlvbl07XG4gICAgICBjb29yZGluYXRlICs9ICh0aGlzLndpZHRoKCkgLSBjb29yZGluYXRlICsgKHRoaXMuX2Nvb3JkaW5hdGVzW25ld1Bvc2l0aW9uXSB8fCAwKSkgLyAyICogbXVsdGlwbGllcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29vcmRpbmF0ZSA9IHRoaXMuX2Nvb3JkaW5hdGVzW25ld1Bvc2l0aW9uXSB8fCAwO1xuICAgIH1cblxuICAgIGNvb3JkaW5hdGUgPSBNYXRoLmNlaWwoY29vcmRpbmF0ZSk7XG5cbiAgICByZXR1cm4gY29vcmRpbmF0ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyB0aGUgc3BlZWQgZm9yIGEgdHJhbnNsYXRpb24uXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGZyb20gLSBUaGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHN0YXJ0IGl0ZW0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0byAtIFRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgdGFyZ2V0IGl0ZW0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbZmFjdG9yPXVuZGVmaW5lZF0gLSBUaGUgdGltZSBmYWN0b3IgaW4gbWlsbGlzZWNvbmRzLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSAtIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zbGF0aW9uLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKGZyb20sIHRvLCBmYWN0b3IpIHtcbiAgICBpZiAoZmFjdG9yID09PSAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgoTWF0aC5hYnModG8gLSBmcm9tKSwgMSksIDYpICogTWF0aC5hYnMoKGZhY3RvciB8fCB0aGlzLnNldHRpbmdzLnNtYXJ0U3BlZWQpKTtcbiAgfTtcblxuICAvKipcbiAgICogU2xpZGVzIHRvIHRoZSBzcGVjaWZpZWQgaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBUaGUgcG9zaXRpb24gb2YgdGhlIGl0ZW0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbc3BlZWRdIC0gVGhlIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGZvciB0aGUgdHJhbnNpdGlvbi5cbiAgICovXG4gIE93bC5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgY3VycmVudCA9IHRoaXMuY3VycmVudCgpLFxuICAgICAgcmV2ZXJ0ID0gbnVsbCxcbiAgICAgIGRpc3RhbmNlID0gcG9zaXRpb24gLSB0aGlzLnJlbGF0aXZlKGN1cnJlbnQpLFxuICAgICAgZGlyZWN0aW9uID0gKGRpc3RhbmNlID4gMCkgLSAoZGlzdGFuY2UgPCAwKSxcbiAgICAgIGl0ZW1zID0gdGhpcy5faXRlbXMubGVuZ3RoLFxuICAgICAgbWluaW11bSA9IHRoaXMubWluaW11bSgpLFxuICAgICAgbWF4aW11bSA9IHRoaXMubWF4aW11bSgpO1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MubG9vcCkge1xuICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLnJld2luZCAmJiBNYXRoLmFicyhkaXN0YW5jZSkgPiBpdGVtcyAvIDIpIHtcbiAgICAgICAgZGlzdGFuY2UgKz0gZGlyZWN0aW9uICogLTEgKiBpdGVtcztcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb24gPSBjdXJyZW50ICsgZGlzdGFuY2U7XG4gICAgICByZXZlcnQgPSAoKHBvc2l0aW9uIC0gbWluaW11bSkgJSBpdGVtcyArIGl0ZW1zKSAlIGl0ZW1zICsgbWluaW11bTtcblxuICAgICAgaWYgKHJldmVydCAhPT0gcG9zaXRpb24gJiYgcmV2ZXJ0IC0gZGlzdGFuY2UgPD0gbWF4aW11bSAmJiByZXZlcnQgLSBkaXN0YW5jZSA+IDApIHtcbiAgICAgICAgY3VycmVudCA9IHJldmVydCAtIGRpc3RhbmNlO1xuICAgICAgICBwb3NpdGlvbiA9IHJldmVydDtcbiAgICAgICAgdGhpcy5yZXNldChjdXJyZW50KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuc2V0dGluZ3MucmV3aW5kKSB7XG4gICAgICBtYXhpbXVtICs9IDE7XG4gICAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiAlIG1heGltdW0gKyBtYXhpbXVtKSAlIG1heGltdW07XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5tYXgobWluaW11bSwgTWF0aC5taW4obWF4aW11bSwgcG9zaXRpb24pKTtcbiAgICB9XG5cbiAgICB0aGlzLnNwZWVkKHRoaXMuZHVyYXRpb24oY3VycmVudCwgcG9zaXRpb24sIHNwZWVkKSk7XG4gICAgdGhpcy5jdXJyZW50KHBvc2l0aW9uKTtcblxuICAgIGlmICh0aGlzLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2xpZGVzIHRvIHRoZSBuZXh0IGl0ZW0uXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtzcGVlZF0gLSBUaGUgdGltZSBpbiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0cmFuc2l0aW9uLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICBzcGVlZCA9IHNwZWVkIHx8IGZhbHNlO1xuICAgIHRoaXMudG8odGhpcy5yZWxhdGl2ZSh0aGlzLmN1cnJlbnQoKSkgKyAxLCBzcGVlZCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNsaWRlcyB0byB0aGUgcHJldmlvdXMgaXRlbS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3NwZWVkXSAtIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zaXRpb24uXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbihzcGVlZCkge1xuICAgIHNwZWVkID0gc3BlZWQgfHwgZmFsc2U7XG4gICAgdGhpcy50byh0aGlzLnJlbGF0aXZlKHRoaXMuY3VycmVudCgpKSAtIDEsIHNwZWVkKTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZW5kIG9mIGFuIGFuaW1hdGlvbi5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIFRoZSBldmVudCBhcmd1bWVudHMuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLm9uVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAvLyBpZiBjc3MyIGFuaW1hdGlvbiB0aGVuIGV2ZW50IG9iamVjdCBpcyB1bmRlZmluZWRcbiAgICBpZiAoZXZlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIC8vIENhdGNoIG9ubHkgb3dsLXN0YWdlIHRyYW5zaXRpb25FbmQgZXZlbnRcbiAgICAgIGlmICgoZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQgfHwgZXZlbnQub3JpZ2luYWxUYXJnZXQpICE9PSB0aGlzLiRzdGFnZS5nZXQoMCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGVhdmUoJ2FuaW1hdGluZycpO1xuICAgIHRoaXMudHJpZ2dlcigndHJhbnNsYXRlZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHZpZXdwb3J0IHdpZHRoLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaGUgd2lkdGggaW4gcGl4ZWwuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnZpZXdwb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHdpZHRoO1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZUJhc2VFbGVtZW50ICE9PSB3aW5kb3cpIHtcbiAgICAgIHdpZHRoID0gJCh0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZUJhc2VFbGVtZW50KS53aWR0aCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSB7XG4gICAgICB3aWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdDYW4gbm90IGRldGVjdCB2aWV3cG9ydCB3aWR0aC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpZHRoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgY3VycmVudCBjb250ZW50LlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fFN0cmluZ30gY29udGVudCAtIFRoZSBuZXcgY29udGVudC5cbiAgICovXG4gIE93bC5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgICB0aGlzLiRzdGFnZS5lbXB0eSgpO1xuICAgIHRoaXMuX2l0ZW1zID0gW107XG5cbiAgICBpZiAoY29udGVudCkge1xuICAgICAgY29udGVudCA9IChjb250ZW50IGluc3RhbmNlb2YgalF1ZXJ5KSA/IGNvbnRlbnQgOiAkKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLm5lc3RlZEl0ZW1TZWxlY3Rvcikge1xuICAgICAgY29udGVudCA9IGNvbnRlbnQuZmluZCgnLicgKyB0aGlzLnNldHRpbmdzLm5lc3RlZEl0ZW1TZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgY29udGVudC5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZSA9PT0gMTtcbiAgICB9KS5lYWNoKCQucHJveHkoZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgIGl0ZW0gPSB0aGlzLnByZXBhcmUoaXRlbSk7XG4gICAgICB0aGlzLiRzdGFnZS5hcHBlbmQoaXRlbSk7XG4gICAgICB0aGlzLl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgdGhpcy5fbWVyZ2Vycy5wdXNoKGl0ZW0uZmluZCgnW2RhdGEtbWVyZ2VdJykuYWRkQmFjaygnW2RhdGEtbWVyZ2VdJykuYXR0cignZGF0YS1tZXJnZScpICogMSB8fCAxKTtcbiAgICB9LCB0aGlzKSk7XG5cbiAgICB0aGlzLnJlc2V0KHRoaXMuaXNOdW1lcmljKHRoaXMuc2V0dGluZ3Muc3RhcnRQb3NpdGlvbikgPyB0aGlzLnNldHRpbmdzLnN0YXJ0UG9zaXRpb24gOiAwKTtcblxuICAgIHRoaXMuaW52YWxpZGF0ZSgnaXRlbXMnKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBhbiBpdGVtLlxuICAgKiBAdG9kbyBVc2UgYGl0ZW1gIGluc3RlYWQgb2YgYGNvbnRlbnRgIGZvciB0aGUgZXZlbnQgYXJndW1lbnRzLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fFN0cmluZ30gY29udGVudCAtIFRoZSBpdGVtIGNvbnRlbnQgdG8gYWRkLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW3Bvc2l0aW9uXSAtIFRoZSByZWxhdGl2ZSBwb3NpdGlvbiBhdCB3aGljaCB0byBpbnNlcnQgdGhlIGl0ZW0gb3RoZXJ3aXNlIHRoZSBpdGVtIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZC5cbiAgICovXG4gIE93bC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oY29udGVudCwgcG9zaXRpb24pIHtcbiAgICB2YXIgY3VycmVudCA9IHRoaXMucmVsYXRpdmUodGhpcy5fY3VycmVudCk7XG5cbiAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSB1bmRlZmluZWQgPyB0aGlzLl9pdGVtcy5sZW5ndGggOiB0aGlzLm5vcm1hbGl6ZShwb3NpdGlvbiwgdHJ1ZSk7XG4gICAgY29udGVudCA9IGNvbnRlbnQgaW5zdGFuY2VvZiBqUXVlcnkgPyBjb250ZW50IDogJChjb250ZW50KTtcblxuICAgIHRoaXMudHJpZ2dlcignYWRkJywgeyBjb250ZW50OiBjb250ZW50LCBwb3NpdGlvbjogcG9zaXRpb24gfSk7XG5cbiAgICBjb250ZW50ID0gdGhpcy5wcmVwYXJlKGNvbnRlbnQpO1xuXG4gICAgaWYgKHRoaXMuX2l0ZW1zLmxlbmd0aCA9PT0gMCB8fCBwb3NpdGlvbiA9PT0gdGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9pdGVtcy5sZW5ndGggPT09IDAgJiYgdGhpcy4kc3RhZ2UuYXBwZW5kKGNvbnRlbnQpO1xuICAgICAgdGhpcy5faXRlbXMubGVuZ3RoICE9PSAwICYmIHRoaXMuX2l0ZW1zW3Bvc2l0aW9uIC0gMV0uYWZ0ZXIoY29udGVudCk7XG4gICAgICB0aGlzLl9pdGVtcy5wdXNoKGNvbnRlbnQpO1xuICAgICAgdGhpcy5fbWVyZ2Vycy5wdXNoKGNvbnRlbnQuZmluZCgnW2RhdGEtbWVyZ2VdJykuYWRkQmFjaygnW2RhdGEtbWVyZ2VdJykuYXR0cignZGF0YS1tZXJnZScpICogMSB8fCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faXRlbXNbcG9zaXRpb25dLmJlZm9yZShjb250ZW50KTtcbiAgICAgIHRoaXMuX2l0ZW1zLnNwbGljZShwb3NpdGlvbiwgMCwgY29udGVudCk7XG4gICAgICB0aGlzLl9tZXJnZXJzLnNwbGljZShwb3NpdGlvbiwgMCwgY29udGVudC5maW5kKCdbZGF0YS1tZXJnZV0nKS5hZGRCYWNrKCdbZGF0YS1tZXJnZV0nKS5hdHRyKCdkYXRhLW1lcmdlJykgKiAxIHx8IDEpO1xuICAgIH1cblxuICAgIHRoaXMuX2l0ZW1zW2N1cnJlbnRdICYmIHRoaXMucmVzZXQodGhpcy5faXRlbXNbY3VycmVudF0uaW5kZXgoKSk7XG5cbiAgICB0aGlzLmludmFsaWRhdGUoJ2l0ZW1zJyk7XG5cbiAgICB0aGlzLnRyaWdnZXIoJ2FkZGVkJywgeyBjb250ZW50OiBjb250ZW50LCBwb3NpdGlvbjogcG9zaXRpb24gfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gaXRlbSBieSBpdHMgcG9zaXRpb24uXG4gICAqIEB0b2RvIFVzZSBgaXRlbWAgaW5zdGVhZCBvZiBgY29udGVudGAgZm9yIHRoZSBldmVudCBhcmd1bWVudHMuXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIC0gVGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSBpdGVtIHRvIHJlbW92ZS5cbiAgICovXG4gIE93bC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMubm9ybWFsaXplKHBvc2l0aW9uLCB0cnVlKTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyKCdyZW1vdmUnLCB7IGNvbnRlbnQ6IHRoaXMuX2l0ZW1zW3Bvc2l0aW9uXSwgcG9zaXRpb246IHBvc2l0aW9uIH0pO1xuXG4gICAgdGhpcy5faXRlbXNbcG9zaXRpb25dLnJlbW92ZSgpO1xuICAgIHRoaXMuX2l0ZW1zLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgdGhpcy5fbWVyZ2Vycy5zcGxpY2UocG9zaXRpb24sIDEpO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlKCdpdGVtcycpO1xuXG4gICAgdGhpcy50cmlnZ2VyKCdyZW1vdmVkJywgeyBjb250ZW50OiBudWxsLCBwb3NpdGlvbjogcG9zaXRpb24gfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZWxvYWRzIGltYWdlcyB3aXRoIGF1dG8gd2lkdGguXG4gICAqIEB0b2RvIFJlcGxhY2UgYnkgYSBtb3JlIGdlbmVyaWMgYXBwcm9hY2hcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5wcmVsb2FkQXV0b1dpZHRoSW1hZ2VzID0gZnVuY3Rpb24oaW1hZ2VzKSB7XG4gICAgaW1hZ2VzLmVhY2goJC5wcm94eShmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICB0aGlzLmVudGVyKCdwcmUtbG9hZGluZycpO1xuICAgICAgZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAkKG5ldyBJbWFnZSgpKS5vbmUoJ2xvYWQnLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZWxlbWVudC5hdHRyKCdzcmMnLCBlLnRhcmdldC5zcmMpO1xuICAgICAgICBlbGVtZW50LmNzcygnb3BhY2l0eScsIDEpO1xuICAgICAgICB0aGlzLmxlYXZlKCdwcmUtbG9hZGluZycpO1xuICAgICAgICAhdGhpcy5pcygncHJlLWxvYWRpbmcnKSAmJiAhdGhpcy5pcygnaW5pdGlhbGl6aW5nJykgJiYgdGhpcy5yZWZyZXNoKCk7XG4gICAgICB9LCB0aGlzKSkuYXR0cignc3JjJywgZWxlbWVudC5hdHRyKCdzcmMnKSB8fCBlbGVtZW50LmF0dHIoJ2RhdGEtc3JjJykgfHwgZWxlbWVudC5hdHRyKCdkYXRhLXNyYy1yZXRpbmEnKSk7XG4gICAgfSwgdGhpcykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgY2Fyb3VzZWwuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIE93bC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy5vd2wuY29yZScpO1xuICAgIHRoaXMuJHN0YWdlLm9mZignLm93bC5jb3JlJyk7XG4gICAgJChkb2N1bWVudCkub2ZmKCcub3dsLmNvcmUnKTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnJlc3BvbnNpdmUgIT09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZXIpO1xuICAgICAgdGhpcy5vZmYod2luZG93LCAncmVzaXplJywgdGhpcy5faGFuZGxlcnMub25UaHJvdHRsZWRSZXNpemUpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fcGx1Z2lucykge1xuICAgICAgdGhpcy5fcGx1Z2luc1tpXS5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy4kc3RhZ2UuY2hpbGRyZW4oJy5jbG9uZWQnKS5yZW1vdmUoKTtcblxuICAgIHRoaXMuJHN0YWdlLnVud3JhcCgpO1xuICAgIHRoaXMuJHN0YWdlLmNoaWxkcmVuKCkuY29udGVudHMoKS51bndyYXAoKTtcbiAgICB0aGlzLiRzdGFnZS5jaGlsZHJlbigpLnVud3JhcCgpO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5yZWZyZXNoQ2xhc3MpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmxvYWRpbmdDbGFzcylcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubG9hZGVkQ2xhc3MpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLnJ0bENsYXNzKVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmdyYWJDbGFzcylcbiAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMuJGVsZW1lbnQuYXR0cignY2xhc3MnKS5yZXBsYWNlKG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJlc3BvbnNpdmVDbGFzcyArICctXFxcXFMrXFxcXHMnLCAnZycpLCAnJykpXG4gICAgICAucmVtb3ZlRGF0YSgnb3dsLmNhcm91c2VsJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE9wZXJhdG9ycyB0byBjYWxjdWxhdGUgcmlnaHQtdG8tbGVmdCBhbmQgbGVmdC10by1yaWdodC5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gW2FdIC0gVGhlIGxlZnQgc2lkZSBvcGVyYW5kLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29dIC0gVGhlIG9wZXJhdG9yLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW2JdIC0gVGhlIHJpZ2h0IHNpZGUgb3BlcmFuZC5cbiAgICovXG4gIE93bC5wcm90b3R5cGUub3AgPSBmdW5jdGlvbihhLCBvLCBiKSB7XG4gICAgdmFyIHJ0bCA9IHRoaXMuc2V0dGluZ3MucnRsO1xuICAgIHN3aXRjaCAobykge1xuICAgICAgY2FzZSAnPCc6XG4gICAgICAgIHJldHVybiBydGwgPyBhID4gYiA6IGEgPCBiO1xuICAgICAgY2FzZSAnPic6XG4gICAgICAgIHJldHVybiBydGwgPyBhIDwgYiA6IGEgPiBiO1xuICAgICAgY2FzZSAnPj0nOlxuICAgICAgICByZXR1cm4gcnRsID8gYSA8PSBiIDogYSA+PSBiO1xuICAgICAgY2FzZSAnPD0nOlxuICAgICAgICByZXR1cm4gcnRsID8gYSA+PSBiIDogYSA8PSBiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0byBhbiBpbnRlcm5hbCBldmVudC5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gVGhlIGV2ZW50IHNvdXJjZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIC0gVGhlIGV2ZW50IGhhbmRsZXIgdG8gYXR0YWNoLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmUgLSBXZXRoZXIgdGhlIGV2ZW50IHNob3VsZCBiZSBoYW5kbGVkIGF0IHRoZSBjYXB0dXJpbmcgcGhhc2Ugb3Igbm90LlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50LCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIGZyb20gYW4gaW50ZXJuYWwgZXZlbnQuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFRoZSBldmVudCBzb3VyY2UuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIFRoZSBhdHRhY2hlZCBldmVudCBoYW5kbGVyIHRvIGRldGFjaC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlIC0gV2V0aGVyIHRoZSBhdHRhY2hlZCBldmVudCBoYW5kbGVyIHdhcyByZWdpc3RlcmVkIGFzIGEgY2FwdHVyaW5nIGxpc3RlbmVyIG9yIG5vdC5cbiAgICovXG4gIE93bC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgaWYgKGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LmRldGFjaEV2ZW50KSB7XG4gICAgICBlbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudCwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSBwdWJsaWMgZXZlbnQuXG4gICAqIEB0b2RvIFJlbW92ZSBgc3RhdHVzYCwgYHJlbGF0ZWRUYXJnZXRgIHNob3VsZCBiZSB1c2VkIGluc3RlYWQuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgZXZlbnQgbmFtZS5cbiAgICogQHBhcmFtIHsqfSBbZGF0YT1udWxsXSAtIFRoZSBldmVudCBkYXRhLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW25hbWVzcGFjZT1jYXJvdXNlbF0gLSBUaGUgZXZlbnQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3N0YXRlXSAtIFRoZSBzdGF0ZSB3aGljaCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGV2ZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtlbnRlcj1mYWxzZV0gLSBJbmRpY2F0ZXMgaWYgdGhlIGNhbGwgZW50ZXJzIHRoZSBzcGVjaWZpZWQgc3RhdGUgb3Igbm90LlxuICAgKiBAcmV0dXJucyB7RXZlbnR9IC0gVGhlIGV2ZW50IGFyZ3VtZW50cy5cbiAgICovXG4gIE93bC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG5hbWVzcGFjZSwgc3RhdGUsIGVudGVyKSB7XG4gICAgdmFyIHN0YXR1cyA9IHtcbiAgICAgIGl0ZW06IHsgY291bnQ6IHRoaXMuX2l0ZW1zLmxlbmd0aCwgaW5kZXg6IHRoaXMuY3VycmVudCgpIH1cbiAgICB9LCBoYW5kbGVyID0gJC5jYW1lbENhc2UoXG4gICAgICAkLmdyZXAoWyAnb24nLCBuYW1lLCBuYW1lc3BhY2UgXSwgZnVuY3Rpb24odikgeyByZXR1cm4gdiB9KVxuICAgICAgICAuam9pbignLScpLnRvTG93ZXJDYXNlKClcbiAgICApLCBldmVudCA9ICQuRXZlbnQoXG4gICAgICBbIG5hbWUsICdvd2wnLCBuYW1lc3BhY2UgfHwgJ2Nhcm91c2VsJyBdLmpvaW4oJy4nKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgJC5leHRlbmQoeyByZWxhdGVkVGFyZ2V0OiB0aGlzIH0sIHN0YXR1cywgZGF0YSlcbiAgICApO1xuXG4gICAgaWYgKCF0aGlzLl9zdXByZXNzW25hbWVdKSB7XG4gICAgICAkLmVhY2godGhpcy5fcGx1Z2lucywgZnVuY3Rpb24obmFtZSwgcGx1Z2luKSB7XG4gICAgICAgIGlmIChwbHVnaW4ub25UcmlnZ2VyKSB7XG4gICAgICAgICAgcGx1Z2luLm9uVHJpZ2dlcihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnJlZ2lzdGVyKHsgdHlwZTogT3dsLlR5cGUuRXZlbnQsIG5hbWU6IG5hbWUgfSk7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZXZlbnQpO1xuXG4gICAgICBpZiAodGhpcy5zZXR0aW5ncyAmJiB0eXBlb2YgdGhpcy5zZXR0aW5nc1toYW5kbGVyXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzW2hhbmRsZXJdLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudDtcbiAgfTtcblxuICAvKipcbiAgICogRW50ZXJzIGEgc3RhdGUuXG4gICAqIEBwYXJhbSBuYW1lIC0gVGhlIHN0YXRlIG5hbWUuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgICQuZWFjaChbIG5hbWUgXS5jb25jYXQodGhpcy5fc3RhdGVzLnRhZ3NbbmFtZV0gfHwgW10pLCAkLnByb3h5KGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZXMuY3VycmVudFtuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlcy5jdXJyZW50W25hbWVdID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc3RhdGVzLmN1cnJlbnRbbmFtZV0rKztcbiAgICB9LCB0aGlzKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExlYXZlcyBhIHN0YXRlLlxuICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBzdGF0ZSBuYW1lLlxuICAgKi9cbiAgT3dsLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAkLmVhY2goWyBuYW1lIF0uY29uY2F0KHRoaXMuX3N0YXRlcy50YWdzW25hbWVdIHx8IFtdKSwgJC5wcm94eShmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICB0aGlzLl9zdGF0ZXMuY3VycmVudFtuYW1lXS0tO1xuICAgIH0sIHRoaXMpKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IG9yIHN0YXRlLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgZXZlbnQgb3Igc3RhdGUgdG8gcmVnaXN0ZXIuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdC50eXBlID09PSBPd2wuVHlwZS5FdmVudCkge1xuICAgICAgaWYgKCEkLmV2ZW50LnNwZWNpYWxbb2JqZWN0Lm5hbWVdKSB7XG4gICAgICAgICQuZXZlbnQuc3BlY2lhbFtvYmplY3QubmFtZV0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEkLmV2ZW50LnNwZWNpYWxbb2JqZWN0Lm5hbWVdLm93bCkge1xuICAgICAgICB2YXIgX2RlZmF1bHQgPSAkLmV2ZW50LnNwZWNpYWxbb2JqZWN0Lm5hbWVdLl9kZWZhdWx0O1xuICAgICAgICAkLmV2ZW50LnNwZWNpYWxbb2JqZWN0Lm5hbWVdLl9kZWZhdWx0ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChfZGVmYXVsdCAmJiBfZGVmYXVsdC5hcHBseSAmJiAoIWUubmFtZXNwYWNlIHx8IGUubmFtZXNwYWNlLmluZGV4T2YoJ293bCcpID09PSAtMSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfZGVmYXVsdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZS5uYW1lc3BhY2UgJiYgZS5uYW1lc3BhY2UuaW5kZXhPZignb3dsJykgPiAtMTtcbiAgICAgICAgfTtcbiAgICAgICAgJC5ldmVudC5zcGVjaWFsW29iamVjdC5uYW1lXS5vd2wgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2JqZWN0LnR5cGUgPT09IE93bC5UeXBlLlN0YXRlKSB7XG4gICAgICBpZiAoIXRoaXMuX3N0YXRlcy50YWdzW29iamVjdC5uYW1lXSkge1xuICAgICAgICB0aGlzLl9zdGF0ZXMudGFnc1tvYmplY3QubmFtZV0gPSBvYmplY3QudGFncztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3N0YXRlcy50YWdzW29iamVjdC5uYW1lXSA9IHRoaXMuX3N0YXRlcy50YWdzW29iamVjdC5uYW1lXS5jb25jYXQob2JqZWN0LnRhZ3MpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdGF0ZXMudGFnc1tvYmplY3QubmFtZV0gPSAkLmdyZXAodGhpcy5fc3RhdGVzLnRhZ3Nbb2JqZWN0Lm5hbWVdLCAkLnByb3h5KGZ1bmN0aW9uKHRhZywgaSkge1xuICAgICAgICByZXR1cm4gJC5pbkFycmF5KHRhZywgdGhpcy5fc3RhdGVzLnRhZ3Nbb2JqZWN0Lm5hbWVdKSA9PT0gaTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFN1cHByZXNzZXMgZXZlbnRzLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7QXJyYXkuPFN0cmluZz59IGV2ZW50cyAtIFRoZSBldmVudHMgdG8gc3VwcHJlc3MuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLnN1cHByZXNzID0gZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgJC5lYWNoKGV2ZW50cywgJC5wcm94eShmdW5jdGlvbihpbmRleCwgZXZlbnQpIHtcbiAgICAgIHRoaXMuX3N1cHJlc3NbZXZlbnRdID0gdHJ1ZTtcbiAgICB9LCB0aGlzKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHN1cHByZXNzZWQgZXZlbnRzLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7QXJyYXkuPFN0cmluZz59IGV2ZW50cyAtIFRoZSBldmVudHMgdG8gcmVsZWFzZS5cbiAgICovXG4gIE93bC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICQuZWFjaChldmVudHMsICQucHJveHkoZnVuY3Rpb24oaW5kZXgsIGV2ZW50KSB7XG4gICAgICBkZWxldGUgdGhpcy5fc3VwcmVzc1tldmVudF07XG4gICAgfSwgdGhpcykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHVuaWZpZWQgcG9pbnRlciBjb29yZGluYXRlcyBmcm9tIGV2ZW50LlxuICAgKiBAdG9kbyAjMjYxXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtFdmVudH0gLSBUaGUgYG1vdXNlZG93bmAgb3IgYHRvdWNoc3RhcnRgIGV2ZW50LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIENvbnRhaW5zIGB4YCBhbmQgYHlgIGNvb3JkaW5hdGVzIG9mIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbi5cbiAgICovXG4gIE93bC5wcm90b3R5cGUucG9pbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHJlc3VsdCA9IHsgeDogbnVsbCwgeTogbnVsbCB9O1xuXG4gICAgZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcblxuICAgIGV2ZW50ID0gZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA/XG4gICAgICBldmVudC50b3VjaGVzWzBdIDogZXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID9cbiAgICAgICAgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0gOiBldmVudDtcblxuICAgIGlmIChldmVudC5wYWdlWCkge1xuICAgICAgcmVzdWx0LnggPSBldmVudC5wYWdlWDtcbiAgICAgIHJlc3VsdC55ID0gZXZlbnQucGFnZVk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC54ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgIHJlc3VsdC55ID0gZXZlbnQuY2xpZW50WTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBpbnB1dCBpcyBhIE51bWJlciBvciBzb21ldGhpbmcgdGhhdCBjYW4gYmUgY29lcmNlZCB0byBhIE51bWJlclxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ3xPYmplY3R8QXJyYXl8Qm9vbGVhbnxSZWdFeHB8RnVuY3Rpb258U3ltYm9sfSAtIFRoZSBpbnB1dCB0byBiZSB0ZXN0ZWRcbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gQW4gaW5kaWNhdGlvbiBpZiB0aGUgaW5wdXQgaXMgYSBOdW1iZXIgb3IgY2FuIGJlIGNvZXJjZWQgdG8gYSBOdW1iZXJcbiAgICovXG4gIE93bC5wcm90b3R5cGUuaXNOdW1lcmljID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG51bWJlcikpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkaWZmZXJlbmNlIG9mIHR3byB2ZWN0b3JzLlxuICAgKiBAdG9kbyAjMjYxXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IC0gVGhlIGZpcnN0IHZlY3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IC0gVGhlIHNlY29uZCB2ZWN0b3IuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IC0gVGhlIGRpZmZlcmVuY2UuXG4gICAqL1xuICBPd2wucHJvdG90eXBlLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihmaXJzdCwgc2Vjb25kKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IGZpcnN0LnggLSBzZWNvbmQueCxcbiAgICAgIHk6IGZpcnN0LnkgLSBzZWNvbmQueVxuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBqUXVlcnkgUGx1Z2luIGZvciB0aGUgT3dsIENhcm91c2VsXG4gICAqIEB0b2RvIE5hdmlnYXRpb24gcGx1Z2luIGBuZXh0YCBhbmQgYHByZXZgXG4gICAqIEBwdWJsaWNcbiAgICovXG4gICQuZm4ub3dsQ2Fyb3VzZWwgPSBmdW5jdGlvbihvcHRpb24pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgZGF0YSA9ICR0aGlzLmRhdGEoJ293bC5jYXJvdXNlbCcpO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgZGF0YSA9IG5ldyBPd2wodGhpcywgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pO1xuICAgICAgICAkdGhpcy5kYXRhKCdvd2wuY2Fyb3VzZWwnLCBkYXRhKTtcblxuICAgICAgICAkLmVhY2goW1xuICAgICAgICAgICduZXh0JywgJ3ByZXYnLCAndG8nLCAnZGVzdHJveScsICdyZWZyZXNoJywgJ3JlcGxhY2UnLCAnYWRkJywgJ3JlbW92ZSdcbiAgICAgICAgXSwgZnVuY3Rpb24oaSwgZXZlbnQpIHtcbiAgICAgICAgICBkYXRhLnJlZ2lzdGVyKHsgdHlwZTogT3dsLlR5cGUuRXZlbnQsIG5hbWU6IGV2ZW50IH0pO1xuICAgICAgICAgIGRhdGEuJGVsZW1lbnQub24oZXZlbnQgKyAnLm93bC5jYXJvdXNlbC5jb3JlJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgZS5yZWxhdGVkVGFyZ2V0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3VwcHJlc3MoWyBldmVudCBdKTtcbiAgICAgICAgICAgICAgZGF0YVtldmVudF0uYXBwbHkodGhpcywgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgICAgICAgdGhpcy5yZWxlYXNlKFsgZXZlbnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZGF0YSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycgJiYgb3B0aW9uLmNoYXJBdCgwKSAhPT0gJ18nKSB7XG4gICAgICAgIGRhdGFbb3B0aW9uXS5hcHBseShkYXRhLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgalF1ZXJ5IFBsdWdpblxuICAgKiBAcHVibGljXG4gICAqL1xuICAkLmZuLm93bENhcm91c2VsLkNvbnN0cnVjdG9yID0gT3dsO1xuXG59KSh3aW5kb3cuWmVwdG8gfHwgd2luZG93LmpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbi8qKlxuICogQXV0b1JlZnJlc2ggUGx1Z2luXG4gKiBAdmVyc2lvbiAyLjEuMFxuICogQGF1dGhvciBBcnR1cyBLb2xhbm93c2tpXG4gKiBAYXV0aG9yIERhdmlkIERldXRzY2hcbiAqIEBsaWNlbnNlIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG47KGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBhdXRvIHJlZnJlc2ggcGx1Z2luLlxuICAgKiBAY2xhc3MgVGhlIEF1dG8gUmVmcmVzaCBQbHVnaW5cbiAgICogQHBhcmFtIHtPd2x9IGNhcm91c2VsIC0gVGhlIE93bCBDYXJvdXNlbFxuICAgKi9cbiAgdmFyIEF1dG9SZWZyZXNoID0gZnVuY3Rpb24oY2Fyb3VzZWwpIHtcbiAgICAvKipcbiAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGNvcmUuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPd2x9XG4gICAgICovXG4gICAgdGhpcy5fY29yZSA9IGNhcm91c2VsO1xuXG4gICAgLyoqXG4gICAgICogUmVmcmVzaCBpbnRlcnZhbC5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLl9pbnRlcnZhbCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9yIG5vdC5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fdmlzaWJsZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBBbGwgZXZlbnQgaGFuZGxlcnMuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5faGFuZGxlcnMgPSB7XG4gICAgICAnaW5pdGlhbGl6ZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiB0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9SZWZyZXNoKSB7XG4gICAgICAgICAgdGhpcy53YXRjaCgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKVxuICAgIH07XG5cbiAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgdGhpcy5fY29yZS5vcHRpb25zID0gJC5leHRlbmQoe30sIEF1dG9SZWZyZXNoLkRlZmF1bHRzLCB0aGlzLl9jb3JlLm9wdGlvbnMpO1xuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9uKHRoaXMuX2hhbmRsZXJzKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBBdXRvUmVmcmVzaC5EZWZhdWx0cyA9IHtcbiAgICBhdXRvUmVmcmVzaDogdHJ1ZSxcbiAgICBhdXRvUmVmcmVzaEludGVydmFsOiA1MDBcbiAgfTtcblxuICAvKipcbiAgICogV2F0Y2hlcyB0aGUgZWxlbWVudC5cbiAgICovXG4gIEF1dG9SZWZyZXNoLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9pbnRlcnZhbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Zpc2libGUgPSB0aGlzLl9jb3JlLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpO1xuICAgIHRoaXMuX2ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKCQucHJveHkodGhpcy5yZWZyZXNoLCB0aGlzKSwgdGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvUmVmcmVzaEludGVydmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVmcmVzaGVzIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgQXV0b1JlZnJlc2gucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY29yZS4kZWxlbWVudC5pcygnOnZpc2libGUnKSA9PT0gdGhpcy5fdmlzaWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Zpc2libGUgPSAhdGhpcy5fdmlzaWJsZTtcblxuICAgIHRoaXMuX2NvcmUuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2Nhcm91c2VsLWhpZGRlbicsICF0aGlzLl92aXNpYmxlKTtcblxuICAgIHRoaXMuX3Zpc2libGUgJiYgKHRoaXMuX2NvcmUuaW52YWxpZGF0ZSgnd2lkdGgnKSAmJiB0aGlzLl9jb3JlLnJlZnJlc2goKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAqL1xuICBBdXRvUmVmcmVzaC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYW5kbGVyLCBwcm9wZXJ0eTtcblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsKTtcblxuICAgIGZvciAoaGFuZGxlciBpbiB0aGlzLl9oYW5kbGVycykge1xuICAgICAgdGhpcy5fY29yZS4kZWxlbWVudC5vZmYoaGFuZGxlciwgdGhpcy5faGFuZGxlcnNbaGFuZGxlcl0pO1xuICAgIH1cbiAgICBmb3IgKHByb3BlcnR5IGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICB0eXBlb2YgdGhpc1twcm9wZXJ0eV0gIT0gJ2Z1bmN0aW9uJyAmJiAodGhpc1twcm9wZXJ0eV0gPSBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5vd2xDYXJvdXNlbC5Db25zdHJ1Y3Rvci5QbHVnaW5zLkF1dG9SZWZyZXNoID0gQXV0b1JlZnJlc2g7XG5cbn0pKHdpbmRvdy5aZXB0byB8fCB3aW5kb3cualF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuLyoqXG4gKiBMYXp5IFBsdWdpblxuICogQHZlcnNpb24gMi4xLjBcbiAqIEBhdXRob3IgQmFydG9zeiBXb2pjaWVjaG93c2tpXG4gKiBAYXV0aG9yIERhdmlkIERldXRzY2hcbiAqIEBsaWNlbnNlIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG47KGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBsYXp5IHBsdWdpbi5cbiAgICogQGNsYXNzIFRoZSBMYXp5IFBsdWdpblxuICAgKiBAcGFyYW0ge093bH0gY2Fyb3VzZWwgLSBUaGUgT3dsIENhcm91c2VsXG4gICAqL1xuICB2YXIgTGF6eSA9IGZ1bmN0aW9uKGNhcm91c2VsKSB7XG5cbiAgICAvKipcbiAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGNvcmUuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPd2x9XG4gICAgICovXG4gICAgdGhpcy5fY29yZSA9IGNhcm91c2VsO1xuXG4gICAgLyoqXG4gICAgICogQWxyZWFkeSBsb2FkZWQgaXRlbXMuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtBcnJheS48alF1ZXJ5Pn1cbiAgICAgKi9cbiAgICB0aGlzLl9sb2FkZWQgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge1xuICAgICAgJ2luaXRpYWxpemVkLm93bC5jYXJvdXNlbCBjaGFuZ2Uub3dsLmNhcm91c2VsIHJlc2l6ZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghZS5uYW1lc3BhY2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2NvcmUuc2V0dGluZ3MgfHwgIXRoaXMuX2NvcmUuc2V0dGluZ3MubGF6eUxvYWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGUucHJvcGVydHkgJiYgZS5wcm9wZXJ0eS5uYW1lID09ICdwb3NpdGlvbicpIHx8IGUudHlwZSA9PSAnaW5pdGlhbGl6ZWQnKSB7XG4gICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fY29yZS5zZXR0aW5ncyxcbiAgICAgICAgICAgIG4gPSAoc2V0dGluZ3MuY2VudGVyICYmIE1hdGguY2VpbChzZXR0aW5ncy5pdGVtcyAvIDIpIHx8IHNldHRpbmdzLml0ZW1zKSxcbiAgICAgICAgICAgIGkgPSAoKHNldHRpbmdzLmNlbnRlciAmJiBuICogLTEpIHx8IDApLFxuICAgICAgICAgICAgcG9zaXRpb24gPSAoZS5wcm9wZXJ0eSAmJiBlLnByb3BlcnR5LnZhbHVlICE9PSB1bmRlZmluZWQgPyBlLnByb3BlcnR5LnZhbHVlIDogdGhpcy5fY29yZS5jdXJyZW50KCkpICsgaSxcbiAgICAgICAgICAgIGNsb25lcyA9IHRoaXMuX2NvcmUuY2xvbmVzKCkubGVuZ3RoLFxuICAgICAgICAgICAgbG9hZCA9ICQucHJveHkoZnVuY3Rpb24oaSwgdikgeyB0aGlzLmxvYWQodikgfSwgdGhpcyk7XG5cbiAgICAgICAgICB3aGlsZSAoaSsrIDwgbikge1xuICAgICAgICAgICAgdGhpcy5sb2FkKGNsb25lcyAvIDIgKyB0aGlzLl9jb3JlLnJlbGF0aXZlKHBvc2l0aW9uKSk7XG4gICAgICAgICAgICBjbG9uZXMgJiYgJC5lYWNoKHRoaXMuX2NvcmUuY2xvbmVzKHRoaXMuX2NvcmUucmVsYXRpdmUocG9zaXRpb24pKSwgbG9hZCk7XG4gICAgICAgICAgICBwb3NpdGlvbisrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgdGhpcylcbiAgICB9O1xuXG4gICAgLy8gc2V0IHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAgICB0aGlzLl9jb3JlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF6eS5EZWZhdWx0cywgdGhpcy5fY29yZS5vcHRpb25zKTtcblxuICAgIC8vIHJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJcbiAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9uKHRoaXMuX2hhbmRsZXJzKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBMYXp5LkRlZmF1bHRzID0ge1xuICAgIGxhenlMb2FkOiBmYWxzZVxuICB9O1xuXG4gIC8qKlxuICAgKiBMb2FkcyBhbGwgcmVzb3VyY2VzIG9mIGFuIGl0ZW0gYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIC0gVGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSBpdGVtLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBMYXp5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICB2YXIgJGl0ZW0gPSB0aGlzLl9jb3JlLiRzdGFnZS5jaGlsZHJlbigpLmVxKHBvc2l0aW9uKSxcbiAgICAgICRlbGVtZW50cyA9ICRpdGVtICYmICRpdGVtLmZpbmQoJy5jYXJvdXNlbF9fbGF6eScpO1xuXG4gICAgaWYgKCEkZWxlbWVudHMgfHwgJC5pbkFycmF5KCRpdGVtLmdldCgwKSwgdGhpcy5fbG9hZGVkKSA+IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJGVsZW1lbnRzLmVhY2goJC5wcm94eShmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KSwgaW1hZ2UsXG4gICAgICAgIHVybCA9ICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+IDEgJiYgJGVsZW1lbnQuYXR0cignZGF0YS1zcmMtcmV0aW5hJykpIHx8ICRlbGVtZW50LmF0dHIoJ2RhdGEtc3JjJyk7XG5cbiAgICAgIHRoaXMuX2NvcmUudHJpZ2dlcignbG9hZCcsIHsgZWxlbWVudDogJGVsZW1lbnQsIHVybDogdXJsIH0sICdsYXp5Jyk7XG5cbiAgICAgIGlmICgkZWxlbWVudC5pcygnaW1nJykpIHtcbiAgICAgICAgJGVsZW1lbnQub25lKCdsb2FkLm93bC5sYXp5JywgJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ29wYWNpdHknLCAxKTtcbiAgICAgICAgICB0aGlzLl9jb3JlLnRyaWdnZXIoJ2xvYWRlZCcsIHsgZWxlbWVudDogJGVsZW1lbnQsIHVybDogdXJsIH0sICdsYXp5Jyk7XG4gICAgICAgIH0sIHRoaXMpKS5hdHRyKCdzcmMnLCB1cmwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2Uub25sb2FkID0gJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3Moe1xuICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKFwiJyArIHVybCArICdcIiknLFxuICAgICAgICAgICAgJ29wYWNpdHknOiAnMSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl9jb3JlLnRyaWdnZXIoJ2xvYWRlZCcsIHsgZWxlbWVudDogJGVsZW1lbnQsIHVybDogdXJsIH0sICdsYXp5Jyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB1cmw7XG4gICAgICB9XG4gICAgfSwgdGhpcykpO1xuXG4gICAgdGhpcy5fbG9hZGVkLnB1c2goJGl0ZW0uZ2V0KDApKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgTGF6eS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYW5kbGVyLCBwcm9wZXJ0eTtcblxuICAgIGZvciAoaGFuZGxlciBpbiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9mZihoYW5kbGVyLCB0aGlzLmhhbmRsZXJzW2hhbmRsZXJdKTtcbiAgICB9XG4gICAgZm9yIChwcm9wZXJ0eSBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgdHlwZW9mIHRoaXNbcHJvcGVydHldICE9ICdmdW5jdGlvbicgJiYgKHRoaXNbcHJvcGVydHldID0gbnVsbCk7XG4gICAgfVxuICB9O1xuXG4gICQuZm4ub3dsQ2Fyb3VzZWwuQ29uc3RydWN0b3IuUGx1Z2lucy5MYXp5ID0gTGF6eTtcblxufSkod2luZG93LlplcHRvIHx8IHdpbmRvdy5qUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4vKipcbiAqIEF1dG9IZWlnaHQgUGx1Z2luXG4gKiBAdmVyc2lvbiAyLjEuMFxuICogQGF1dGhvciBCYXJ0b3N6IFdvamNpZWNob3dza2lcbiAqIEBhdXRob3IgRGF2aWQgRGV1dHNjaFxuICogQGxpY2Vuc2UgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKi9cbjsoZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGF1dG8gaGVpZ2h0IHBsdWdpbi5cbiAgICogQGNsYXNzIFRoZSBBdXRvIEhlaWdodCBQbHVnaW5cbiAgICogQHBhcmFtIHtPd2x9IGNhcm91c2VsIC0gVGhlIE93bCBDYXJvdXNlbFxuICAgKi9cbiAgdmFyIEF1dG9IZWlnaHQgPSBmdW5jdGlvbihjYXJvdXNlbCkge1xuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgY29yZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge093bH1cbiAgICAgKi9cbiAgICB0aGlzLl9jb3JlID0gY2Fyb3VzZWw7XG5cbiAgICAvKipcbiAgICAgKiBBbGwgZXZlbnQgaGFuZGxlcnMuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5faGFuZGxlcnMgPSB7XG4gICAgICAnaW5pdGlhbGl6ZWQub3dsLmNhcm91c2VsIHJlZnJlc2hlZC5vd2wuY2Fyb3VzZWwnOiAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlICYmIHRoaXMuX2NvcmUuc2V0dGluZ3MuYXV0b0hlaWdodCkge1xuICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpLFxuICAgICAgJ2NoYW5nZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiB0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9IZWlnaHQgJiYgZS5wcm9wZXJ0eS5uYW1lID09ICdwb3NpdGlvbicpe1xuICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpLFxuICAgICAgJ2xvYWRlZC5vd2wubGF6eSc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgdGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvSGVpZ2h0XG4gICAgICAgICAgJiYgZS5lbGVtZW50LmNsb3Nlc3QoJy4nICsgdGhpcy5fY29yZS5zZXR0aW5ncy5pdGVtQ2xhc3MpLmluZGV4KCkgPT09IHRoaXMuX2NvcmUuY3VycmVudCgpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcylcbiAgICB9O1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIHRoaXMuX2NvcmUub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBdXRvSGVpZ2h0LkRlZmF1bHRzLCB0aGlzLl9jb3JlLm9wdGlvbnMpO1xuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9uKHRoaXMuX2hhbmRsZXJzKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBBdXRvSGVpZ2h0LkRlZmF1bHRzID0ge1xuICAgIGF1dG9IZWlnaHQ6IGZhbHNlLFxuICAgIGF1dG9IZWlnaHRDbGFzczogJ2Nhcm91c2VsX19oZWlnaHQnXG4gIH07XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZpZXcuXG4gICAqL1xuICBBdXRvSGVpZ2h0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLl9jb3JlLl9jdXJyZW50LFxuICAgICAgZW5kID0gc3RhcnQgKyB0aGlzLl9jb3JlLnNldHRpbmdzLml0ZW1zLFxuICAgICAgdmlzaWJsZSA9IHRoaXMuX2NvcmUuJHN0YWdlLmNoaWxkcmVuKCkudG9BcnJheSgpLnNsaWNlKHN0YXJ0LCBlbmQpLFxuICAgICAgaGVpZ2h0cyA9IFtdLFxuICAgICAgbWF4aGVpZ2h0ID0gMDtcblxuICAgICQuZWFjaCh2aXNpYmxlLCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgaGVpZ2h0cy5wdXNoKCQoaXRlbSkuaGVpZ2h0KCkpO1xuICAgIH0pO1xuXG4gICAgbWF4aGVpZ2h0ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgaGVpZ2h0cyk7XG5cbiAgICB0aGlzLl9jb3JlLiRzdGFnZS5wYXJlbnQoKVxuICAgICAgLmhlaWdodChtYXhoZWlnaHQpXG4gICAgICAuYWRkQ2xhc3ModGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvSGVpZ2h0Q2xhc3MpO1xuICB9O1xuXG4gIEF1dG9IZWlnaHQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFuZGxlciwgcHJvcGVydHk7XG5cbiAgICBmb3IgKGhhbmRsZXIgaW4gdGhpcy5faGFuZGxlcnMpIHtcbiAgICAgIHRoaXMuX2NvcmUuJGVsZW1lbnQub2ZmKGhhbmRsZXIsIHRoaXMuX2hhbmRsZXJzW2hhbmRsZXJdKTtcbiAgICB9XG4gICAgZm9yIChwcm9wZXJ0eSBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgdHlwZW9mIHRoaXNbcHJvcGVydHldICE9ICdmdW5jdGlvbicgJiYgKHRoaXNbcHJvcGVydHldID0gbnVsbCk7XG4gICAgfVxuICB9O1xuXG4gICQuZm4ub3dsQ2Fyb3VzZWwuQ29uc3RydWN0b3IuUGx1Z2lucy5BdXRvSGVpZ2h0ID0gQXV0b0hlaWdodDtcblxufSkod2luZG93LlplcHRvIHx8IHdpbmRvdy5qUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4vKipcbiAqIFZpZGVvIFBsdWdpblxuICogQHZlcnNpb24gMi4xLjBcbiAqIEBhdXRob3IgQmFydG9zeiBXb2pjaWVjaG93c2tpXG4gKiBAYXV0aG9yIERhdmlkIERldXRzY2hcbiAqIEBsaWNlbnNlIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG47KGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSB2aWRlbyBwbHVnaW4uXG4gICAqIEBjbGFzcyBUaGUgVmlkZW8gUGx1Z2luXG4gICAqIEBwYXJhbSB7T3dsfSBjYXJvdXNlbCAtIFRoZSBPd2wgQ2Fyb3VzZWxcbiAgICovXG4gIHZhciBWaWRlbyA9IGZ1bmN0aW9uKGNhcm91c2VsKSB7XG4gICAgLyoqXG4gICAgICogUmVmZXJlbmNlIHRvIHRoZSBjb3JlLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T3dsfVxuICAgICAqL1xuICAgIHRoaXMuX2NvcmUgPSBjYXJvdXNlbDtcblxuICAgIC8qKlxuICAgICAqIENhY2hlIGFsbCB2aWRlbyBVUkxzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX3ZpZGVvcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQ3VycmVudCBwbGF5aW5nIGl0ZW0uXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgdGhpcy5fcGxheWluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBBbGwgZXZlbnQgaGFuZGxlcnMuXG4gICAgICogQHRvZG8gVGhlIGNsb25lZCBjb250ZW50IHJlbW92YWxlIGlzIHRvbyBsYXRlXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5faGFuZGxlcnMgPSB7XG4gICAgICAnaW5pdGlhbGl6ZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSkge1xuICAgICAgICAgIHRoaXMuX2NvcmUucmVnaXN0ZXIoeyB0eXBlOiAnc3RhdGUnLCBuYW1lOiAncGxheWluZycsIHRhZ3M6IFsgJ2ludGVyYWN0aW5nJyBdIH0pO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdyZXNpemUub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiB0aGlzLl9jb3JlLnNldHRpbmdzLnZpZGVvICYmIHRoaXMuaXNJbkZ1bGxTY3JlZW4oKSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAncmVmcmVzaGVkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgdGhpcy5fY29yZS5pcygncmVzaXppbmcnKSkge1xuICAgICAgICAgIHRoaXMuX2NvcmUuJHN0YWdlLmZpbmQoJy5jbG9uZWQgLmNhcm91c2VsX192aWRlby1mcmFtZScpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdjaGFuZ2VkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgZS5wcm9wZXJ0eS5uYW1lID09PSAncG9zaXRpb24nICYmIHRoaXMuX3BsYXlpbmcpIHtcbiAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAncHJlcGFyZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghZS5uYW1lc3BhY2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGUuY29udGVudCkuZmluZCgnLm93bC12aWRlbycpO1xuXG4gICAgICAgIGlmICgkZWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAgIHRoaXMuZmV0Y2goJGVsZW1lbnQsICQoZS5jb250ZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpXG4gICAgfTtcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICB0aGlzLl9jb3JlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVmlkZW8uRGVmYXVsdHMsIHRoaXMuX2NvcmUub3B0aW9ucyk7XG5cbiAgICAvLyByZWdpc3RlciBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuX2NvcmUuJGVsZW1lbnQub24odGhpcy5faGFuZGxlcnMpO1xuXG4gICAgdGhpcy5fY29yZS4kZWxlbWVudC5vbignY2xpY2sub3dsLnZpZGVvJywgJy5jYXJvdXNlbF9fdmlkZW8tcGxheS1pY29uJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnBsYXkoZSk7XG4gICAgfSwgdGhpcykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIFZpZGVvLkRlZmF1bHRzID0ge1xuICAgIHZpZGVvOiBmYWxzZSxcbiAgICB2aWRlb0hlaWdodDogZmFsc2UsXG4gICAgdmlkZW9XaWR0aDogZmFsc2VcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgdmlkZW8gSUQgYW5kIHRoZSB0eXBlIChZb3VUdWJlL1ZpbWVvL3Z6YWFyIG9ubHkpLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0YXJnZXQgLSBUaGUgdGFyZ2V0IGNvbnRhaW5pbmcgdGhlIHZpZGVvIGRhdGEuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBpdGVtIC0gVGhlIGl0ZW0gY29udGFpbmluZyB0aGUgdmlkZW8uXG4gICAqL1xuICBWaWRlby5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbih0YXJnZXQsIGl0ZW0pIHtcbiAgICAgIHZhciB0eXBlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh0YXJnZXQuYXR0cignZGF0YS12aW1lby1pZCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZpbWVvJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5hdHRyKCdkYXRhLXZ6YWFyLWlkJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndnphYXInXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAneW91dHViZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9KSgpLFxuICAgICAgICBpZCA9IHRhcmdldC5hdHRyKCdkYXRhLXZpbWVvLWlkJykgfHwgdGFyZ2V0LmF0dHIoJ2RhdGEteW91dHViZS1pZCcpIHx8IHRhcmdldC5hdHRyKCdkYXRhLXZ6YWFyLWlkJyksXG4gICAgICAgIHdpZHRoID0gdGFyZ2V0LmF0dHIoJ2RhdGEtd2lkdGgnKSB8fCB0aGlzLl9jb3JlLnNldHRpbmdzLnZpZGVvV2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRhcmdldC5hdHRyKCdkYXRhLWhlaWdodCcpIHx8IHRoaXMuX2NvcmUuc2V0dGluZ3MudmlkZW9IZWlnaHQsXG4gICAgICAgIHVybCA9IHRhcmdldC5hdHRyKCdocmVmJyk7XG5cbiAgICBpZiAodXJsKSB7XG5cbiAgICAgIC8qXG4gICAgICAgICAgUGFyc2VzIHRoZSBpZCdzIG91dCBvZiB0aGUgZm9sbG93aW5nIHVybHMgKGFuZCBwcm9iYWJseSBtb3JlKTpcbiAgICAgICAgICBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PTppZFxuICAgICAgICAgIGh0dHBzOi8veW91dHUuYmUvOmlkXG4gICAgICAgICAgaHR0cHM6Ly92aW1lby5jb20vOmlkXG4gICAgICAgICAgaHR0cHM6Ly92aW1lby5jb20vY2hhbm5lbHMvOmNoYW5uZWwvOmlkXG4gICAgICAgICAgaHR0cHM6Ly92aW1lby5jb20vZ3JvdXBzLzpncm91cC92aWRlb3MvOmlkXG4gICAgICAgICAgaHR0cHM6Ly9hcHAudnphYXIuY29tL3ZpZGVvcy86aWRcblxuICAgICAgICAgIFZpc3VhbCBleGFtcGxlOiBodHRwczovL3JlZ2V4cGVyLmNvbS8jKGh0dHAlM0ElN0NodHRwcyUzQSU3QyklNUMlMkYlNUMlMkYocGxheWVyLiU3Q3d3dy4lN0NhcHAuKSUzRih2aW1lbyU1Qy5jb20lN0N5b3V0dShiZSU1Qy5jb20lN0MlNUMuYmUlN0NiZSU1Qy5nb29nbGVhcGlzJTVDLmNvbSklN0N2emFhciU1Qy5jb20pJTVDJTJGKHZpZGVvJTVDJTJGJTdDdmlkZW9zJTVDJTJGJTdDZW1iZWQlNUMlMkYlN0NjaGFubmVscyU1QyUyRi4lMkIlNUMlMkYlN0Nncm91cHMlNUMlMkYuJTJCJTVDJTJGJTdDd2F0Y2glNUMlM0Z2JTNEJTdDdiU1QyUyRiklM0YoJTVCQS1aYS16MC05Ll8lMjUtJTVEKikoJTVDJTI2JTVDUyUyQiklM0ZcbiAgICAgICovXG5cbiAgICAgIGlkID0gdXJsLm1hdGNoKC8oaHR0cDp8aHR0cHM6fClcXC9cXC8ocGxheWVyLnx3d3cufGFwcC4pPyh2aW1lb1xcLmNvbXx5b3V0dShiZVxcLmNvbXxcXC5iZXxiZVxcLmdvb2dsZWFwaXNcXC5jb20pfHZ6YWFyXFwuY29tKVxcLyh2aWRlb1xcL3x2aWRlb3NcXC98ZW1iZWRcXC98Y2hhbm5lbHNcXC8uK1xcL3xncm91cHNcXC8uK1xcL3x3YXRjaFxcP3Y9fHZcXC8pPyhbQS1aYS16MC05Ll8lLV0qKShcXCZcXFMrKT8vKTtcblxuICAgICAgaWYgKGlkWzNdLmluZGV4T2YoJ3lvdXR1JykgPiAtMSkge1xuICAgICAgICB0eXBlID0gJ3lvdXR1YmUnO1xuICAgICAgfSBlbHNlIGlmIChpZFszXS5pbmRleE9mKCd2aW1lbycpID4gLTEpIHtcbiAgICAgICAgdHlwZSA9ICd2aW1lbyc7XG4gICAgICB9IGVsc2UgaWYgKGlkWzNdLmluZGV4T2YoJ3Z6YWFyJykgPiAtMSkge1xuICAgICAgICB0eXBlID0gJ3Z6YWFyJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmlkZW8gVVJMIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICB9XG4gICAgICBpZCA9IGlkWzZdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmlkZW8gVVJMLicpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZpZGVvc1t1cmxdID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlkOiBpZCxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfTtcblxuICAgIGl0ZW0uYXR0cignZGF0YS12aWRlbycsIHVybCk7XG5cbiAgICB0aGlzLnRodW1ibmFpbCh0YXJnZXQsIHRoaXMuX3ZpZGVvc1t1cmxdKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyB2aWRlbyB0aHVtYm5haWwuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtqUXVlcnl9IHRhcmdldCAtIFRoZSB0YXJnZXQgY29udGFpbmluZyB0aGUgdmlkZW8gZGF0YS5cbiAgICogQHBhcmFtIHtPYmplY3R9IGluZm8gLSBUaGUgdmlkZW8gaW5mbyBvYmplY3QuXG4gICAqIEBzZWUgYGZldGNoYFxuICAgKi9cbiAgVmlkZW8ucHJvdG90eXBlLnRodW1ibmFpbCA9IGZ1bmN0aW9uKHRhcmdldCwgdmlkZW8pIHtcbiAgICB2YXIgdG5MaW5rLFxuICAgICAgaWNvbixcbiAgICAgIHBhdGgsXG4gICAgICBkaW1lbnNpb25zID0gdmlkZW8ud2lkdGggJiYgdmlkZW8uaGVpZ2h0ID8gJ3N0eWxlPVwid2lkdGg6JyArIHZpZGVvLndpZHRoICsgJ3B4O2hlaWdodDonICsgdmlkZW8uaGVpZ2h0ICsgJ3B4O1wiJyA6ICcnLFxuICAgICAgY3VzdG9tVG4gPSB0YXJnZXQuZmluZCgnaW1nJyksXG4gICAgICBzcmNUeXBlID0gJ3NyYycsXG4gICAgICBsYXp5Q2xhc3MgPSAnJyxcbiAgICAgIHNldHRpbmdzID0gdGhpcy5fY29yZS5zZXR0aW5ncyxcbiAgICAgIGNyZWF0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgaWNvbiA9ICc8ZGl2IGNsYXNzPVwiY2Fyb3VzZWxfX3ZpZGVvLXBsYXktaWNvblwiPjwvZGl2Pic7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmxhenlMb2FkKSB7XG4gICAgICAgICAgdG5MaW5rID0gJzxkaXYgY2xhc3M9XCJjYXJvdXNlbF9fdmlkZW8tdG4gJyArIGxhenlDbGFzcyArICdcIiAnICsgc3JjVHlwZSArICc9XCInICsgcGF0aCArICdcIj48L2Rpdj4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRuTGluayA9ICc8ZGl2IGNsYXNzPVwiY2Fyb3VzZWxfX3ZpZGVvLXRuXCIgc3R5bGU9XCJvcGFjaXR5OjE7YmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHBhdGggKyAnKVwiPjwvZGl2Pic7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0LmFmdGVyKHRuTGluayk7XG4gICAgICAgIHRhcmdldC5hZnRlcihpY29uKTtcbiAgICAgIH07XG5cbiAgICAvLyB3cmFwIHZpZGVvIGNvbnRlbnQgaW50byBjYXJvdXNlbF9fdmlkZW8td3JhcHBlciBkaXZcbiAgICB0YXJnZXQud3JhcCgnPGRpdiBjbGFzcz1cImNhcm91c2VsX192aWRlby13cmFwcGVyXCInICsgZGltZW5zaW9ucyArICc+PC9kaXY+Jyk7XG5cbiAgICBpZiAodGhpcy5fY29yZS5zZXR0aW5ncy5sYXp5TG9hZCkge1xuICAgICAgc3JjVHlwZSA9ICdkYXRhLXNyYyc7XG4gICAgICBsYXp5Q2xhc3MgPSAnY2Fyb3VzZWxfX2xhenknO1xuICAgIH1cblxuICAgIC8vIGN1c3RvbSB0aHVtYm5haWxcbiAgICBpZiAoY3VzdG9tVG4ubGVuZ3RoKSB7XG4gICAgICBjcmVhdGUoY3VzdG9tVG4uYXR0cihzcmNUeXBlKSk7XG4gICAgICBjdXN0b21Ubi5yZW1vdmUoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodmlkZW8udHlwZSA9PT0gJ3lvdXR1YmUnKSB7XG4gICAgICBwYXRoID0gXCIvL2ltZy55b3V0dWJlLmNvbS92aS9cIiArIHZpZGVvLmlkICsgXCIvaHFkZWZhdWx0LmpwZ1wiO1xuICAgICAgY3JlYXRlKHBhdGgpO1xuICAgIH0gZWxzZSBpZiAodmlkZW8udHlwZSA9PT0gJ3ZpbWVvJykge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgIHVybDogJy8vdmltZW8uY29tL2FwaS92Mi92aWRlby8nICsgdmlkZW8uaWQgKyAnLmpzb24nLFxuICAgICAgICBqc29ucDogJ2NhbGxiYWNrJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBwYXRoID0gZGF0YVswXS50aHVtYm5haWxfbGFyZ2U7XG4gICAgICAgICAgY3JlYXRlKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHZpZGVvLnR5cGUgPT09ICd2emFhcicpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICB1cmw6ICcvL3Z6YWFyLmNvbS9hcGkvdmlkZW9zLycgKyB2aWRlby5pZCArICcuanNvbicsXG4gICAgICAgIGpzb25wOiAnY2FsbGJhY2snLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHBhdGggPSBkYXRhLmZyYW1lZ3JhYl91cmw7XG4gICAgICAgICAgY3JlYXRlKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0b3BzIHRoZSBjdXJyZW50IHZpZGVvLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBWaWRlby5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2NvcmUudHJpZ2dlcignc3RvcCcsIG51bGwsICd2aWRlbycpO1xuICAgIHRoaXMuX3BsYXlpbmcuZmluZCgnLmNhcm91c2VsX192aWRlby1mcmFtZScpLnJlbW92ZSgpO1xuICAgIHRoaXMuX3BsYXlpbmcucmVtb3ZlQ2xhc3MoJ2Nhcm91c2VsX192aWRlby1wbGF5aW5nJyk7XG4gICAgdGhpcy5fcGxheWluZyA9IG51bGw7XG4gICAgdGhpcy5fY29yZS5sZWF2ZSgncGxheWluZycpO1xuICAgIHRoaXMuX2NvcmUudHJpZ2dlcignc3RvcHBlZCcsIG51bGwsICd2aWRlbycpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGN1cnJlbnQgdmlkZW8uXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgYXJndW1lbnRzLlxuICAgKi9cbiAgVmlkZW8ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICBpdGVtID0gdGFyZ2V0LmNsb3Nlc3QoJy4nICsgdGhpcy5fY29yZS5zZXR0aW5ncy5pdGVtQ2xhc3MpLFxuICAgICAgdmlkZW8gPSB0aGlzLl92aWRlb3NbaXRlbS5hdHRyKCdkYXRhLXZpZGVvJyldLFxuICAgICAgd2lkdGggPSB2aWRlby53aWR0aCB8fCAnMTAwJScsXG4gICAgICBoZWlnaHQgPSB2aWRlby5oZWlnaHQgfHwgdGhpcy5fY29yZS4kc3RhZ2UuaGVpZ2h0KCksXG4gICAgICBodG1sO1xuXG4gICAgaWYgKHRoaXMuX3BsYXlpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jb3JlLmVudGVyKCdwbGF5aW5nJyk7XG4gICAgdGhpcy5fY29yZS50cmlnZ2VyKCdwbGF5JywgbnVsbCwgJ3ZpZGVvJyk7XG5cbiAgICBpdGVtID0gdGhpcy5fY29yZS5pdGVtcyh0aGlzLl9jb3JlLnJlbGF0aXZlKGl0ZW0uaW5kZXgoKSkpO1xuXG4gICAgdGhpcy5fY29yZS5yZXNldChpdGVtLmluZGV4KCkpO1xuXG4gICAgaWYgKHZpZGVvLnR5cGUgPT09ICd5b3V0dWJlJykge1xuICAgICAgaHRtbCA9ICc8aWZyYW1lIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgc3JjPVwiLy93d3cueW91dHViZS5jb20vZW1iZWQvJyArXG4gICAgICAgIHZpZGVvLmlkICsgJz9hdXRvcGxheT0xJnJlbD0wJnY9JyArIHZpZGVvLmlkICsgJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nO1xuICAgIH0gZWxzZSBpZiAodmlkZW8udHlwZSA9PT0gJ3ZpbWVvJykge1xuICAgICAgaHRtbCA9ICc8aWZyYW1lIHNyYz1cIi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby8nICsgdmlkZW8uaWQgK1xuICAgICAgICAnP2F1dG9wbGF5PTFcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICtcbiAgICAgICAgJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG4gICAgfSBlbHNlIGlmICh2aWRlby50eXBlID09PSAndnphYXInKSB7XG4gICAgICBodG1sID0gJzxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCInICsgJ2hlaWdodD1cIicgKyBoZWlnaHQgKyAnXCInICsgJ3dpZHRoPVwiJyArIHdpZHRoICtcbiAgICAgICAgJ1wiIGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gd2Via2l0QWxsb3dGdWxsU2NyZWVuICcgK1xuICAgICAgICAnc3JjPVwiLy92aWV3LnZ6YWFyLmNvbS8nICsgdmlkZW8uaWQgKyAnL3BsYXllcj9hdXRvcGxheT10cnVlXCI+PC9pZnJhbWU+JztcbiAgICB9XG5cbiAgICAkKCc8ZGl2IGNsYXNzPVwiY2Fyb3VzZWxfX3ZpZGVvLWZyYW1lXCI+JyArIGh0bWwgKyAnPC9kaXY+JykuaW5zZXJ0QWZ0ZXIoaXRlbS5maW5kKCcub3dsLXZpZGVvJykpO1xuXG4gICAgdGhpcy5fcGxheWluZyA9IGl0ZW0uYWRkQ2xhc3MoJ2Nhcm91c2VsX192aWRlby1wbGF5aW5nJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIGFuIHZpZGVvIGlzIGN1cnJlbnRseSBpbiBmdWxsIHNjcmVlbiBtb2RlIG9yIG5vdC5cbiAgICogQHRvZG8gQmFkIHN0eWxlIGJlY2F1c2UgbG9va3MgbGlrZSBhIHJlYWRvbmx5IG1ldGhvZCBidXQgY2hhbmdlcyBtZW1iZXJzLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgVmlkZW8ucHJvdG90eXBlLmlzSW5GdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fFxuICAgICAgICBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudDtcblxuICAgIHJldHVybiBlbGVtZW50ICYmICQoZWxlbWVudCkucGFyZW50KCkuaGFzQ2xhc3MoJ2Nhcm91c2VsX192aWRlby1mcmFtZScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgKi9cbiAgVmlkZW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFuZGxlciwgcHJvcGVydHk7XG5cbiAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9mZignY2xpY2sub3dsLnZpZGVvJyk7XG5cbiAgICBmb3IgKGhhbmRsZXIgaW4gdGhpcy5faGFuZGxlcnMpIHtcbiAgICAgIHRoaXMuX2NvcmUuJGVsZW1lbnQub2ZmKGhhbmRsZXIsIHRoaXMuX2hhbmRsZXJzW2hhbmRsZXJdKTtcbiAgICB9XG4gICAgZm9yIChwcm9wZXJ0eSBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgdHlwZW9mIHRoaXNbcHJvcGVydHldICE9ICdmdW5jdGlvbicgJiYgKHRoaXNbcHJvcGVydHldID0gbnVsbCk7XG4gICAgfVxuICB9O1xuXG4gICQuZm4ub3dsQ2Fyb3VzZWwuQ29uc3RydWN0b3IuUGx1Z2lucy5WaWRlbyA9IFZpZGVvO1xuXG59KSh3aW5kb3cuWmVwdG8gfHwgd2luZG93LmpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbi8qKlxuICogQW5pbWF0ZSBQbHVnaW5cbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKiBAYXV0aG9yIEJhcnRvc3ogV29qY2llY2hvd3NraVxuICogQGF1dGhvciBEYXZpZCBEZXV0c2NoXG4gKiBAbGljZW5zZSBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgYW5pbWF0ZSBwbHVnaW4uXG4gICAqIEBjbGFzcyBUaGUgTmF2aWdhdGlvbiBQbHVnaW5cbiAgICogQHBhcmFtIHtPd2x9IHNjb3BlIC0gVGhlIE93bCBDYXJvdXNlbFxuICAgKi9cbiAgdmFyIEFuaW1hdGUgPSBmdW5jdGlvbihzY29wZSkge1xuICAgIHRoaXMuY29yZSA9IHNjb3BlO1xuICAgIHRoaXMuY29yZS5vcHRpb25zID0gJC5leHRlbmQoe30sIEFuaW1hdGUuRGVmYXVsdHMsIHRoaXMuY29yZS5vcHRpb25zKTtcbiAgICB0aGlzLnN3YXBwaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnByZXZpb3VzID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubmV4dCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuaGFuZGxlcnMgPSB7XG4gICAgICAnY2hhbmdlLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgZS5wcm9wZXJ0eS5uYW1lID09ICdwb3NpdGlvbicpIHtcbiAgICAgICAgICB0aGlzLnByZXZpb3VzID0gdGhpcy5jb3JlLmN1cnJlbnQoKTtcbiAgICAgICAgICB0aGlzLm5leHQgPSBlLnByb3BlcnR5LnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdkcmFnLm93bC5jYXJvdXNlbCBkcmFnZ2VkLm93bC5jYXJvdXNlbCB0cmFuc2xhdGVkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UpIHtcbiAgICAgICAgICB0aGlzLnN3YXBwaW5nID0gZS50eXBlID09ICd0cmFuc2xhdGVkJztcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAndHJhbnNsYXRlLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgdGhpcy5zd2FwcGluZyAmJiAodGhpcy5jb3JlLm9wdGlvbnMuYW5pbWF0ZU91dCB8fCB0aGlzLmNvcmUub3B0aW9ucy5hbmltYXRlSW4pKSB7XG4gICAgICAgICAgdGhpcy5zd2FwKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpXG4gICAgfTtcblxuICAgIHRoaXMuY29yZS4kZWxlbWVudC5vbih0aGlzLmhhbmRsZXJzKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBBbmltYXRlLkRlZmF1bHRzID0ge1xuICAgIGFuaW1hdGVPdXQ6IGZhbHNlLFxuICAgIGFuaW1hdGVJbjogZmFsc2VcbiAgfTtcblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgYW5pbWF0aW9uIGNsYXNzZXMgd2hlbmV2ZXIgYW4gdHJhbnNsYXRpb25zIHN0YXJ0cy5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbnx1bmRlZmluZWR9XG4gICAqL1xuICBBbmltYXRlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAodGhpcy5jb3JlLnNldHRpbmdzLml0ZW1zICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQuYW5pbWF0aW9uIHx8ICEkLnN1cHBvcnQudHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29yZS5zcGVlZCgwKTtcblxuICAgIHZhciBsZWZ0LFxuICAgICAgY2xlYXIgPSAkLnByb3h5KHRoaXMuY2xlYXIsIHRoaXMpLFxuICAgICAgcHJldmlvdXMgPSB0aGlzLmNvcmUuJHN0YWdlLmNoaWxkcmVuKCkuZXEodGhpcy5wcmV2aW91cyksXG4gICAgICBuZXh0ID0gdGhpcy5jb3JlLiRzdGFnZS5jaGlsZHJlbigpLmVxKHRoaXMubmV4dCksXG4gICAgICBpbmNvbWluZyA9IHRoaXMuY29yZS5zZXR0aW5ncy5hbmltYXRlSW4sXG4gICAgICBvdXRnb2luZyA9IHRoaXMuY29yZS5zZXR0aW5ncy5hbmltYXRlT3V0O1xuXG4gICAgaWYgKHRoaXMuY29yZS5jdXJyZW50KCkgPT09IHRoaXMucHJldmlvdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob3V0Z29pbmcpIHtcbiAgICAgIGxlZnQgPSB0aGlzLmNvcmUuY29vcmRpbmF0ZXModGhpcy5wcmV2aW91cykgLSB0aGlzLmNvcmUuY29vcmRpbmF0ZXModGhpcy5uZXh0KTtcbiAgICAgIHByZXZpb3VzLm9uZSgkLnN1cHBvcnQuYW5pbWF0aW9uLmVuZCwgY2xlYXIpXG4gICAgICAgIC5jc3MoIHsgJ2xlZnQnOiBsZWZ0ICsgJ3B4JyB9IClcbiAgICAgICAgLmFkZENsYXNzKCdjYXJvdXNlbF9fYW5pbWF0ZWQgY2Fyb3VzZWxfX2FuaW1hdGVkLW91dCcpXG4gICAgICAgIC5hZGRDbGFzcyhvdXRnb2luZyk7XG4gICAgfVxuXG4gICAgaWYgKGluY29taW5nKSB7XG4gICAgICBuZXh0Lm9uZSgkLnN1cHBvcnQuYW5pbWF0aW9uLmVuZCwgY2xlYXIpXG4gICAgICAgIC5hZGRDbGFzcygnY2Fyb3VzZWxfX2FuaW1hdGVkIGNhcm91c2VsX19hbmltYXRlZC1pbicpXG4gICAgICAgIC5hZGRDbGFzcyhpbmNvbWluZyk7XG4gICAgfVxuICB9O1xuXG4gIEFuaW1hdGUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oZSkge1xuICAgICQoZS50YXJnZXQpLmNzcyggeyAnbGVmdCc6ICcnIH0gKVxuICAgICAgLnJlbW92ZUNsYXNzKCdjYXJvdXNlbF9fYW5pbWF0ZWQgY2Fyb3VzZWxfX2FuaW1hdGVkLW91dCBjYXJvdXNlbF9fYW5pbWF0ZWQtaW4nKVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuY29yZS5zZXR0aW5ncy5hbmltYXRlSW4pXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5jb3JlLnNldHRpbmdzLmFuaW1hdGVPdXQpO1xuICAgIHRoaXMuY29yZS5vblRyYW5zaXRpb25FbmQoKTtcbiAgfTtcblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgQW5pbWF0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYW5kbGVyLCBwcm9wZXJ0eTtcblxuICAgIGZvciAoaGFuZGxlciBpbiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICB0aGlzLmNvcmUuJGVsZW1lbnQub2ZmKGhhbmRsZXIsIHRoaXMuaGFuZGxlcnNbaGFuZGxlcl0pO1xuICAgIH1cbiAgICBmb3IgKHByb3BlcnR5IGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICB0eXBlb2YgdGhpc1twcm9wZXJ0eV0gIT0gJ2Z1bmN0aW9uJyAmJiAodGhpc1twcm9wZXJ0eV0gPSBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5vd2xDYXJvdXNlbC5Db25zdHJ1Y3Rvci5QbHVnaW5zLkFuaW1hdGUgPSBBbmltYXRlO1xuXG59KSh3aW5kb3cuWmVwdG8gfHwgd2luZG93LmpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbi8qKlxuICogQXV0b3BsYXkgUGx1Z2luXG4gKiBAdmVyc2lvbiAyLjEuMFxuICogQGF1dGhvciBCYXJ0b3N6IFdvamNpZWNob3dza2lcbiAqIEBhdXRob3IgQXJ0dXMgS29sYW5vd3NraVxuICogQGF1dGhvciBEYXZpZCBEZXV0c2NoXG4gKiBAbGljZW5zZSBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgYXV0b3BsYXkgcGx1Z2luLlxuICAgKiBAY2xhc3MgVGhlIEF1dG9wbGF5IFBsdWdpblxuICAgKiBAcGFyYW0ge093bH0gc2NvcGUgLSBUaGUgT3dsIENhcm91c2VsXG4gICAqL1xuICB2YXIgQXV0b3BsYXkgPSBmdW5jdGlvbihjYXJvdXNlbCkge1xuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgY29yZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge093bH1cbiAgICAgKi9cbiAgICB0aGlzLl9jb3JlID0gY2Fyb3VzZWw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXV0b3BsYXkgdGltZW91dC5cbiAgICAgKiBAdHlwZSB7VGltZW91dH1cbiAgICAgKi9cbiAgICB0aGlzLl90aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB3aGVuZXZlciB0aGUgYXV0b3BsYXkgaXMgcGF1c2VkLlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQWxsIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge1xuICAgICAgJ2NoYW5nZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiBlLnByb3BlcnR5Lm5hbWUgPT09ICdzZXR0aW5ncycpIHtcbiAgICAgICAgICBpZiAodGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvcGxheSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlLm5hbWVzcGFjZSAmJiBlLnByb3BlcnR5Lm5hbWUgPT09ICdwb3NpdGlvbicpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdwbGF5PycsIGUpO1xuICAgICAgICAgIGlmICh0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9wbGF5KSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRBdXRvUGxheUludGVydmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdpbml0aWFsaXplZC5vd2wuY2Fyb3VzZWwnOiAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlICYmIHRoaXMuX2NvcmUuc2V0dGluZ3MuYXV0b3BsYXkpIHtcbiAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAncGxheS5vd2wuYXV0b3BsYXknOiAkLnByb3h5KGZ1bmN0aW9uKGUsIHQsIHMpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlKSB7XG4gICAgICAgICAgdGhpcy5wbGF5KHQsIHMpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdzdG9wLm93bC5hdXRvcGxheSc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UpIHtcbiAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAnbW91c2VvdmVyLm93bC5hdXRvcGxheSc6ICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9wbGF5SG92ZXJQYXVzZSAmJiB0aGlzLl9jb3JlLmlzKCdyb3RhdGluZycpKSB7XG4gICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdtb3VzZWxlYXZlLm93bC5hdXRvcGxheSc6ICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9wbGF5SG92ZXJQYXVzZSAmJiB0aGlzLl9jb3JlLmlzKCdyb3RhdGluZycpKSB7XG4gICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpLFxuICAgICAgJ3RvdWNoc3RhcnQub3dsLmNvcmUnOiAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvcGxheUhvdmVyUGF1c2UgJiYgdGhpcy5fY29yZS5pcygncm90YXRpbmcnKSkge1xuICAgICAgICAgIHRoaXMucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAndG91Y2hlbmQub3dsLmNvcmUnOiAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fY29yZS5zZXR0aW5ncy5hdXRvcGxheUhvdmVyUGF1c2UpIHtcbiAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcylcbiAgICB9O1xuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9uKHRoaXMuX2hhbmRsZXJzKTtcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICB0aGlzLl9jb3JlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQXV0b3BsYXkuRGVmYXVsdHMsIHRoaXMuX2NvcmUub3B0aW9ucyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgQXV0b3BsYXkuRGVmYXVsdHMgPSB7XG4gICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgIGF1dG9wbGF5VGltZW91dDogNTAwMCxcbiAgICBhdXRvcGxheUhvdmVyUGF1c2U6IGZhbHNlLFxuICAgIGF1dG9wbGF5U3BlZWQ6IGZhbHNlXG4gIH07XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgYXV0b3BsYXkuXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lb3V0XSAtIFRoZSBpbnRlcnZhbCBiZWZvcmUgdGhlIG5leHQgYW5pbWF0aW9uIHN0YXJ0cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtzcGVlZF0gLSBUaGUgYW5pbWF0aW9uIHNwZWVkIGZvciB0aGUgYW5pbWF0aW9ucy5cbiAgICovXG4gIEF1dG9wbGF5LnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24odGltZW91dCwgc3BlZWQpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9jb3JlLmlzKCdyb3RhdGluZycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fY29yZS5lbnRlcigncm90YXRpbmcnKTtcblxuICAgIHRoaXMuX3NldEF1dG9QbGF5SW50ZXJ2YWwoKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyBhIG5ldyB0aW1lb3V0XG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZW91dF0gLSBUaGUgaW50ZXJ2YWwgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBzdGFydHMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbc3BlZWRdIC0gVGhlIGFuaW1hdGlvbiBzcGVlZCBmb3IgdGhlIGFuaW1hdGlvbnMuXG4gICAqIEByZXR1cm4ge1RpbWVvdXR9XG4gICAqL1xuICBBdXRvcGxheS5wcm90b3R5cGUuX2dldE5leHRUaW1lb3V0ID0gZnVuY3Rpb24odGltZW91dCwgc3BlZWQpIHtcbiAgICBpZiAoIHRoaXMuX3RpbWVvdXQgKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpO1xuICAgIH1cbiAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9wYXVzZWQgfHwgdGhpcy5fY29yZS5pcygnYnVzeScpIHx8IHRoaXMuX2NvcmUuaXMoJ2ludGVyYWN0aW5nJykgfHwgZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvcmUubmV4dChzcGVlZCB8fCB0aGlzLl9jb3JlLnNldHRpbmdzLmF1dG9wbGF5U3BlZWQpO1xuICAgIH0sIHRoaXMpLCB0aW1lb3V0IHx8IHRoaXMuX2NvcmUuc2V0dGluZ3MuYXV0b3BsYXlUaW1lb3V0KTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyBhdXRvcGxheSBpbiBtb3Rpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBBdXRvcGxheS5wcm90b3R5cGUuX3NldEF1dG9QbGF5SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gdGhpcy5fZ2V0TmV4dFRpbWVvdXQoKTtcbiAgfTtcblxuICAvKipcbiAgICogU3RvcHMgdGhlIGF1dG9wbGF5LlxuICAgKiBAcHVibGljXG4gICAqL1xuICBBdXRvcGxheS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fY29yZS5pcygncm90YXRpbmcnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgdGhpcy5fY29yZS5sZWF2ZSgncm90YXRpbmcnKTtcbiAgfTtcblxuICAvKipcbiAgICogU3RvcHMgdGhlIGF1dG9wbGF5LlxuICAgKiBAcHVibGljXG4gICAqL1xuICBBdXRvcGxheS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2NvcmUuaXMoJ3JvdGF0aW5nJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgKi9cbiAgQXV0b3BsYXkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFuZGxlciwgcHJvcGVydHk7XG5cbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIGZvciAoaGFuZGxlciBpbiB0aGlzLl9oYW5kbGVycykge1xuICAgICAgdGhpcy5fY29yZS4kZWxlbWVudC5vZmYoaGFuZGxlciwgdGhpcy5faGFuZGxlcnNbaGFuZGxlcl0pO1xuICAgIH1cbiAgICBmb3IgKHByb3BlcnR5IGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICB0eXBlb2YgdGhpc1twcm9wZXJ0eV0gIT0gJ2Z1bmN0aW9uJyAmJiAodGhpc1twcm9wZXJ0eV0gPSBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5vd2xDYXJvdXNlbC5Db25zdHJ1Y3Rvci5QbHVnaW5zLmF1dG9wbGF5ID0gQXV0b3BsYXk7XG5cbn0pKHdpbmRvdy5aZXB0byB8fCB3aW5kb3cualF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuLyoqXG4gKiBOYXZpZ2F0aW9uIFBsdWdpblxuICogQHZlcnNpb24gMi4xLjBcbiAqIEBhdXRob3IgQXJ0dXMgS29sYW5vd3NraVxuICogQGF1dGhvciBEYXZpZCBEZXV0c2NoXG4gKiBAbGljZW5zZSBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBuYXZpZ2F0aW9uIHBsdWdpbi5cbiAgICogQGNsYXNzIFRoZSBOYXZpZ2F0aW9uIFBsdWdpblxuICAgKiBAcGFyYW0ge093bH0gY2Fyb3VzZWwgLSBUaGUgT3dsIENhcm91c2VsLlxuICAgKi9cbiAgdmFyIE5hdmlnYXRpb24gPSBmdW5jdGlvbihjYXJvdXNlbCkge1xuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgY29yZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge093bH1cbiAgICAgKi9cbiAgICB0aGlzLl9jb3JlID0gY2Fyb3VzZWw7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgcGx1Z2luIGlzIGluaXRpYWxpemVkIG9yIG5vdC5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHBhZ2luZyBpbmRleGVzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5fcGFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEFsbCBET00gZWxlbWVudHMgb2YgdGhlIHVzZXIgaW50ZXJmYWNlLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2NvbnRyb2xzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBNYXJrdXAgZm9yIGFuIGluZGljYXRvci5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge0FycmF5LjxTdHJpbmc+fVxuICAgICAqL1xuICAgIHRoaXMuX3RlbXBsYXRlcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNhcm91c2VsIGVsZW1lbnQuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5fY29yZS4kZWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRkZW4gbWV0aG9kcyBvZiB0aGUgY2Fyb3VzZWwuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fb3ZlcnJpZGVzID0ge1xuICAgICAgbmV4dDogdGhpcy5fY29yZS5uZXh0LFxuICAgICAgcHJldjogdGhpcy5fY29yZS5wcmV2LFxuICAgICAgdG86IHRoaXMuX2NvcmUudG9cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxsIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge1xuICAgICAgJ3ByZXBhcmVkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgdGhpcy5fY29yZS5zZXR0aW5ncy5kb3RzRGF0YSkge1xuICAgICAgICAgIHRoaXMuX3RlbXBsYXRlcy5wdXNoKCc8ZGl2IGNsYXNzPVwiJyArIHRoaXMuX2NvcmUuc2V0dGluZ3MuZG90Q2xhc3MgKyAnXCI+JyArXG4gICAgICAgICAgICAkKGUuY29udGVudCkuZmluZCgnW2RhdGEtZG90XScpLmFkZEJhY2soJ1tkYXRhLWRvdF0nKS5hdHRyKCdkYXRhLWRvdCcpICsgJzwvZGl2PicpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdhZGRlZC5vd2wuY2Fyb3VzZWwnOiAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlICYmIHRoaXMuX2NvcmUuc2V0dGluZ3MuZG90c0RhdGEpIHtcbiAgICAgICAgICB0aGlzLl90ZW1wbGF0ZXMuc3BsaWNlKGUucG9zaXRpb24sIDAsIHRoaXMuX3RlbXBsYXRlcy5wb3AoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpLFxuICAgICAgJ3JlbW92ZS5vd2wuY2Fyb3VzZWwnOiAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlICYmIHRoaXMuX2NvcmUuc2V0dGluZ3MuZG90c0RhdGEpIHtcbiAgICAgICAgICB0aGlzLl90ZW1wbGF0ZXMuc3BsaWNlKGUucG9zaXRpb24sIDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdjaGFuZ2VkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgZS5wcm9wZXJ0eS5uYW1lID09ICdwb3NpdGlvbicpIHtcbiAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyksXG4gICAgICAnaW5pdGlhbGl6ZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiAhdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICB0aGlzLl9jb3JlLnRyaWdnZXIoJ2luaXRpYWxpemUnLCBudWxsLCAnbmF2aWdhdGlvbicpO1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuX2NvcmUudHJpZ2dlcignaW5pdGlhbGl6ZWQnLCBudWxsLCAnbmF2aWdhdGlvbicpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdyZWZyZXNoZWQub3dsLmNhcm91c2VsJzogJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWVzcGFjZSAmJiB0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgIHRoaXMuX2NvcmUudHJpZ2dlcigncmVmcmVzaCcsIG51bGwsICduYXZpZ2F0aW9uJyk7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgICB0aGlzLl9jb3JlLnRyaWdnZXIoJ3JlZnJlc2hlZCcsIG51bGwsICduYXZpZ2F0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpXG4gICAgfTtcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICB0aGlzLl9jb3JlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTmF2aWdhdGlvbi5EZWZhdWx0cywgdGhpcy5fY29yZS5vcHRpb25zKTtcblxuICAgIC8vIHJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy4kZWxlbWVudC5vbih0aGlzLl9oYW5kbGVycyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucy5cbiAgICogQHB1YmxpY1xuICAgKiBAdG9kbyBSZW5hbWUgYHNsaWRlQnlgIHRvIGBuYXZCeWBcbiAgICovXG4gIE5hdmlnYXRpb24uRGVmYXVsdHMgPSB7XG4gICAgbmF2OiBmYWxzZSxcbiAgICBuYXZUZXh0OiBbICdwcmV2JywgJ25leHQnIF0sXG4gICAgbmF2U3BlZWQ6IGZhbHNlLFxuICAgIG5hdkVsZW1lbnQ6ICdkaXYnLFxuICAgIG5hdkNvbnRhaW5lcjogZmFsc2UsXG4gICAgbmF2Q29udGFpbmVyQ2xhc3M6ICdjYXJvdXNlbF9fbmF2JyxcbiAgICBuYXZDbGFzczogWyAnY2Fyb3VzZWxfX3ByZXYnLCAnY2Fyb3VzZWxfX25leHQnIF0sXG4gICAgc2xpZGVCeTogMSxcbiAgICBkb3RDbGFzczogJ2Nhcm91c2VsX19kb3QnLFxuICAgIGRvdHNDbGFzczogJ2Nhcm91c2VsX19kb3RzJyxcbiAgICBkb3RzOiB0cnVlLFxuICAgIGRvdHNFYWNoOiBmYWxzZSxcbiAgICBkb3RzRGF0YTogZmFsc2UsXG4gICAgZG90c1NwZWVkOiBmYWxzZSxcbiAgICBkb3RzQ29udGFpbmVyOiBmYWxzZVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbGF5b3V0IG9mIHRoZSBwbHVnaW4gYW5kIGV4dGVuZHMgdGhlIGNhcm91c2VsLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG92ZXJyaWRlLFxuICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jb3JlLnNldHRpbmdzO1xuXG4gICAgLy8gY3JlYXRlIERPTSBzdHJ1Y3R1cmUgZm9yIHJlbGF0aXZlIG5hdmlnYXRpb25cbiAgICB0aGlzLl9jb250cm9scy4kcmVsYXRpdmUgPSAoc2V0dGluZ3MubmF2Q29udGFpbmVyID8gJChzZXR0aW5ncy5uYXZDb250YWluZXIpXG4gICAgICA6ICQoJzxkaXY+JykuYWRkQ2xhc3Moc2V0dGluZ3MubmF2Q29udGFpbmVyQ2xhc3MpLmFwcGVuZFRvKHRoaXMuJGVsZW1lbnQpKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgIHRoaXMuX2NvbnRyb2xzLiRwcmV2aW91cyA9ICQoJzwnICsgc2V0dGluZ3MubmF2RWxlbWVudCArICc+JylcbiAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy5uYXZDbGFzc1swXSlcbiAgICAgIC5odG1sKHNldHRpbmdzLm5hdlRleHRbMF0pXG4gICAgICAucHJlcGVuZFRvKHRoaXMuX2NvbnRyb2xzLiRyZWxhdGl2ZSlcbiAgICAgIC5vbignY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wcmV2KHNldHRpbmdzLm5hdlNwZWVkKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB0aGlzLl9jb250cm9scy4kbmV4dCA9ICQoJzwnICsgc2V0dGluZ3MubmF2RWxlbWVudCArICc+JylcbiAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy5uYXZDbGFzc1sxXSlcbiAgICAgIC5odG1sKHNldHRpbmdzLm5hdlRleHRbMV0pXG4gICAgICAuYXBwZW5kVG8odGhpcy5fY29udHJvbHMuJHJlbGF0aXZlKVxuICAgICAgLm9uKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLm5leHQoc2V0dGluZ3MubmF2U3BlZWQpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgLy8gY3JlYXRlIERPTSBzdHJ1Y3R1cmUgZm9yIGFic29sdXRlIG5hdmlnYXRpb25cbiAgICBpZiAoIXNldHRpbmdzLmRvdHNEYXRhKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZXMgPSBbICQoJzxkaXY+JylcbiAgICAgICAgLmFkZENsYXNzKHNldHRpbmdzLmRvdENsYXNzKVxuICAgICAgICAuYXBwZW5kKCQoJzxzcGFuPicpKVxuICAgICAgICAucHJvcCgnb3V0ZXJIVE1MJykgXTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb250cm9scy4kYWJzb2x1dGUgPSAoc2V0dGluZ3MuZG90c0NvbnRhaW5lciA/ICQoc2V0dGluZ3MuZG90c0NvbnRhaW5lcilcbiAgICAgIDogJCgnPGRpdj4nKS5hZGRDbGFzcyhzZXR0aW5ncy5kb3RzQ2xhc3MpLmFwcGVuZFRvKHRoaXMuJGVsZW1lbnQpKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgIHRoaXMuX2NvbnRyb2xzLiRhYnNvbHV0ZS5vbignY2xpY2snLCAnZGl2JywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgaW5kZXggPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5pcyh0aGlzLl9jb250cm9scy4kYWJzb2x1dGUpXG4gICAgICAgID8gJChlLnRhcmdldCkuaW5kZXgoKSA6ICQoZS50YXJnZXQpLnBhcmVudCgpLmluZGV4KCk7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy50byhpbmRleCwgc2V0dGluZ3MuZG90c1NwZWVkKTtcbiAgICB9LCB0aGlzKSk7XG5cbiAgICAvLyBvdmVycmlkZSBwdWJsaWMgbWV0aG9kcyBvZiB0aGUgY2Fyb3VzZWxcbiAgICBmb3IgKG92ZXJyaWRlIGluIHRoaXMuX292ZXJyaWRlcykge1xuICAgICAgdGhpcy5fY29yZVtvdmVycmlkZV0gPSAkLnByb3h5KHRoaXNbb3ZlcnJpZGVdLCB0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIE5hdmlnYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFuZGxlciwgY29udHJvbCwgcHJvcGVydHksIG92ZXJyaWRlO1xuXG4gICAgZm9yIChoYW5kbGVyIGluIHRoaXMuX2hhbmRsZXJzKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZihoYW5kbGVyLCB0aGlzLl9oYW5kbGVyc1toYW5kbGVyXSk7XG4gICAgfVxuICAgIGZvciAoY29udHJvbCBpbiB0aGlzLl9jb250cm9scykge1xuICAgICAgdGhpcy5fY29udHJvbHNbY29udHJvbF0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIGZvciAob3ZlcnJpZGUgaW4gdGhpcy5vdmVyaWRlcykge1xuICAgICAgdGhpcy5fY29yZVtvdmVycmlkZV0gPSB0aGlzLl9vdmVycmlkZXNbb3ZlcnJpZGVdO1xuICAgIH1cbiAgICBmb3IgKHByb3BlcnR5IGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICB0eXBlb2YgdGhpc1twcm9wZXJ0eV0gIT0gJ2Z1bmN0aW9uJyAmJiAodGhpc1twcm9wZXJ0eV0gPSBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGludGVybmFsIHN0YXRlLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBOYXZpZ2F0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaiwgayxcbiAgICAgIGxvd2VyID0gdGhpcy5fY29yZS5jbG9uZXMoKS5sZW5ndGggLyAyLFxuICAgICAgdXBwZXIgPSBsb3dlciArIHRoaXMuX2NvcmUuaXRlbXMoKS5sZW5ndGgsXG4gICAgICBtYXhpbXVtID0gdGhpcy5fY29yZS5tYXhpbXVtKHRydWUpLFxuICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jb3JlLnNldHRpbmdzLFxuICAgICAgc2l6ZSA9IHNldHRpbmdzLmNlbnRlciB8fCBzZXR0aW5ncy5hdXRvV2lkdGggfHwgc2V0dGluZ3MuZG90c0RhdGFcbiAgICAgICAgPyAxIDogc2V0dGluZ3MuZG90c0VhY2ggfHwgc2V0dGluZ3MuaXRlbXM7XG5cbiAgICBpZiAoc2V0dGluZ3Muc2xpZGVCeSAhPT0gJ3BhZ2UnKSB7XG4gICAgICBzZXR0aW5ncy5zbGlkZUJ5ID0gTWF0aC5taW4oc2V0dGluZ3Muc2xpZGVCeSwgc2V0dGluZ3MuaXRlbXMpO1xuICAgIH1cblxuICAgIGlmIChzZXR0aW5ncy5kb3RzIHx8IHNldHRpbmdzLnNsaWRlQnkgPT0gJ3BhZ2UnKSB7XG4gICAgICB0aGlzLl9wYWdlcyA9IFtdO1xuXG4gICAgICBmb3IgKGkgPSBsb3dlciwgaiA9IDAsIGsgPSAwOyBpIDwgdXBwZXI7IGkrKykge1xuICAgICAgICBpZiAoaiA+PSBzaXplIHx8IGogPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9wYWdlcy5wdXNoKHtcbiAgICAgICAgICAgIHN0YXJ0OiBNYXRoLm1pbihtYXhpbXVtLCBpIC0gbG93ZXIpLFxuICAgICAgICAgICAgZW5kOiBpIC0gbG93ZXIgKyBzaXplIC0gMVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChNYXRoLm1pbihtYXhpbXVtLCBpIC0gbG93ZXIpID09PSBtYXhpbXVtKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaiA9IDAsICsraztcbiAgICAgICAgfVxuICAgICAgICBqICs9IHRoaXMuX2NvcmUubWVyZ2Vycyh0aGlzLl9jb3JlLnJlbGF0aXZlKGkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERyYXdzIHRoZSB1c2VyIGludGVyZmFjZS5cbiAgICogQHRvZG8gVGhlIG9wdGlvbiBgZG90c0RhdGFgIHdvbnQgd29yay5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgTmF2aWdhdGlvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaWZmZXJlbmNlLFxuICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jb3JlLnNldHRpbmdzLFxuICAgICAgZGlzYWJsZWQgPSB0aGlzLl9jb3JlLml0ZW1zKCkubGVuZ3RoIDw9IHNldHRpbmdzLml0ZW1zLFxuICAgICAgaW5kZXggPSB0aGlzLl9jb3JlLnJlbGF0aXZlKHRoaXMuX2NvcmUuY3VycmVudCgpKSxcbiAgICAgIGxvb3AgPSBzZXR0aW5ncy5sb29wIHx8IHNldHRpbmdzLnJld2luZDtcblxuICAgIHRoaXMuX2NvbnRyb2xzLiRyZWxhdGl2ZS50b2dnbGVDbGFzcygnZGlzYWJsZWQnLCAhc2V0dGluZ3MubmF2IHx8IGRpc2FibGVkKTtcblxuICAgIGlmIChzZXR0aW5ncy5uYXYpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2xzLiRwcmV2aW91cy50b2dnbGVDbGFzcygnZGlzYWJsZWQnLCAhbG9vcCAmJiBpbmRleCA8PSB0aGlzLl9jb3JlLm1pbmltdW0odHJ1ZSkpO1xuICAgICAgdGhpcy5fY29udHJvbHMuJG5leHQudG9nZ2xlQ2xhc3MoJ2Rpc2FibGVkJywgIWxvb3AgJiYgaW5kZXggPj0gdGhpcy5fY29yZS5tYXhpbXVtKHRydWUpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb250cm9scy4kYWJzb2x1dGUudG9nZ2xlQ2xhc3MoJ2Rpc2FibGVkJywgIXNldHRpbmdzLmRvdHMgfHwgZGlzYWJsZWQpO1xuXG4gICAgaWYgKHNldHRpbmdzLmRvdHMpIHtcbiAgICAgIGRpZmZlcmVuY2UgPSB0aGlzLl9wYWdlcy5sZW5ndGggLSB0aGlzLl9jb250cm9scy4kYWJzb2x1dGUuY2hpbGRyZW4oKS5sZW5ndGg7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5kb3RzRGF0YSAmJiBkaWZmZXJlbmNlICE9PSAwKSB7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xzLiRhYnNvbHV0ZS5odG1sKHRoaXMuX3RlbXBsYXRlcy5qb2luKCcnKSk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xzLiRhYnNvbHV0ZS5hcHBlbmQobmV3IEFycmF5KGRpZmZlcmVuY2UgKyAxKS5qb2luKHRoaXMuX3RlbXBsYXRlc1swXSkpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmZXJlbmNlIDwgMCkge1xuICAgICAgICB0aGlzLl9jb250cm9scy4kYWJzb2x1dGUuY2hpbGRyZW4oKS5zbGljZShkaWZmZXJlbmNlKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29udHJvbHMuJGFic29sdXRlLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB0aGlzLl9jb250cm9scy4kYWJzb2x1dGUuY2hpbGRyZW4oKS5lcSgkLmluQXJyYXkodGhpcy5jdXJyZW50KCksIHRoaXMuX3BhZ2VzKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRXh0ZW5kcyBldmVudCBkYXRhLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IG9iamVjdCB3aGljaCBnZXRzIHRocm93bi5cbiAgICovXG4gIE5hdmlnYXRpb24ucHJvdG90eXBlLm9uVHJpZ2dlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNldHRpbmdzID0gdGhpcy5fY29yZS5zZXR0aW5ncztcblxuICAgIGV2ZW50LnBhZ2UgPSB7XG4gICAgICBpbmRleDogJC5pbkFycmF5KHRoaXMuY3VycmVudCgpLCB0aGlzLl9wYWdlcyksXG4gICAgICBjb3VudDogdGhpcy5fcGFnZXMubGVuZ3RoLFxuICAgICAgc2l6ZTogc2V0dGluZ3MgJiYgKHNldHRpbmdzLmNlbnRlciB8fCBzZXR0aW5ncy5hdXRvV2lkdGggfHwgc2V0dGluZ3MuZG90c0RhdGFcbiAgICAgICAgPyAxIDogc2V0dGluZ3MuZG90c0VhY2ggfHwgc2V0dGluZ3MuaXRlbXMpXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBwYWdlIHBvc2l0aW9uIG9mIHRoZSBjYXJvdXNlbC5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgTmF2aWdhdGlvbi5wcm90b3R5cGUuY3VycmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5fY29yZS5yZWxhdGl2ZSh0aGlzLl9jb3JlLmN1cnJlbnQoKSk7XG4gICAgcmV0dXJuICQuZ3JlcCh0aGlzLl9wYWdlcywgJC5wcm94eShmdW5jdGlvbihwYWdlLCBpbmRleCkge1xuICAgICAgcmV0dXJuIHBhZ2Uuc3RhcnQgPD0gY3VycmVudCAmJiBwYWdlLmVuZCA+PSBjdXJyZW50O1xuICAgIH0sIHRoaXMpKS5wb3AoKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBzdWNjZXNvci9wcmVkZWNlc3NvciBwb3NpdGlvbi5cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgTmF2aWdhdGlvbi5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbihzdWNjZXNzb3IpIHtcbiAgICB2YXIgcG9zaXRpb24sIGxlbmd0aCxcbiAgICAgIHNldHRpbmdzID0gdGhpcy5fY29yZS5zZXR0aW5ncztcblxuICAgIGlmIChzZXR0aW5ncy5zbGlkZUJ5ID09ICdwYWdlJykge1xuICAgICAgcG9zaXRpb24gPSAkLmluQXJyYXkodGhpcy5jdXJyZW50KCksIHRoaXMuX3BhZ2VzKTtcbiAgICAgIGxlbmd0aCA9IHRoaXMuX3BhZ2VzLmxlbmd0aDtcbiAgICAgIHN1Y2Nlc3NvciA/ICsrcG9zaXRpb24gOiAtLXBvc2l0aW9uO1xuICAgICAgcG9zaXRpb24gPSB0aGlzLl9wYWdlc1soKHBvc2l0aW9uICUgbGVuZ3RoKSArIGxlbmd0aCkgJSBsZW5ndGhdLnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMuX2NvcmUucmVsYXRpdmUodGhpcy5fY29yZS5jdXJyZW50KCkpO1xuICAgICAgbGVuZ3RoID0gdGhpcy5fY29yZS5pdGVtcygpLmxlbmd0aDtcbiAgICAgIHN1Y2Nlc3NvciA/IHBvc2l0aW9uICs9IHNldHRpbmdzLnNsaWRlQnkgOiBwb3NpdGlvbiAtPSBzZXR0aW5ncy5zbGlkZUJ5O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfTtcblxuICAvKipcbiAgICogU2xpZGVzIHRvIHRoZSBuZXh0IGl0ZW0gb3IgcGFnZS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3NwZWVkPWZhbHNlXSAtIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zaXRpb24uXG4gICAqL1xuICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAkLnByb3h5KHRoaXMuX292ZXJyaWRlcy50bywgdGhpcy5fY29yZSkodGhpcy5nZXRQb3NpdGlvbih0cnVlKSwgc3BlZWQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTbGlkZXMgdG8gdGhlIHByZXZpb3VzIGl0ZW0gb3IgcGFnZS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3NwZWVkPWZhbHNlXSAtIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zaXRpb24uXG4gICAqL1xuICBOYXZpZ2F0aW9uLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAkLnByb3h5KHRoaXMuX292ZXJyaWRlcy50bywgdGhpcy5fY29yZSkodGhpcy5nZXRQb3NpdGlvbihmYWxzZSksIHNwZWVkKTtcbiAgfTtcblxuICAvKipcbiAgICogU2xpZGVzIHRvIHRoZSBzcGVjaWZpZWQgaXRlbSBvciBwYWdlLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiAtIFRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSBvciBwYWdlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW3NwZWVkXSAtIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zaXRpb24uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3N0YW5kYXJkPWZhbHNlXSAtIFdoZXRoZXIgdG8gdXNlIHRoZSBzdGFuZGFyZCBiZWhhdmlvdXIgb3Igbm90LlxuICAgKi9cbiAgTmF2aWdhdGlvbi5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihwb3NpdGlvbiwgc3BlZWQsIHN0YW5kYXJkKSB7XG4gICAgdmFyIGxlbmd0aDtcblxuICAgIGlmICghc3RhbmRhcmQgJiYgdGhpcy5fcGFnZXMubGVuZ3RoKSB7XG4gICAgICBsZW5ndGggPSB0aGlzLl9wYWdlcy5sZW5ndGg7XG4gICAgICAkLnByb3h5KHRoaXMuX292ZXJyaWRlcy50bywgdGhpcy5fY29yZSkodGhpcy5fcGFnZXNbKChwb3NpdGlvbiAlIGxlbmd0aCkgKyBsZW5ndGgpICUgbGVuZ3RoXS5zdGFydCwgc3BlZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkLnByb3h5KHRoaXMuX292ZXJyaWRlcy50bywgdGhpcy5fY29yZSkocG9zaXRpb24sIHNwZWVkKTtcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5vd2xDYXJvdXNlbC5Db25zdHJ1Y3Rvci5QbHVnaW5zLk5hdmlnYXRpb24gPSBOYXZpZ2F0aW9uO1xuXG59KSh3aW5kb3cuWmVwdG8gfHwgd2luZG93LmpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbi8qKlxuICogSGFzaCBQbHVnaW5cbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKiBAYXV0aG9yIEFydHVzIEtvbGFub3dza2lcbiAqIEBhdXRob3IgRGF2aWQgRGV1dHNjaFxuICogQGxpY2Vuc2UgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKi9cbjsoZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgaGFzaCBwbHVnaW4uXG4gICAqIEBjbGFzcyBUaGUgSGFzaCBQbHVnaW5cbiAgICogQHBhcmFtIHtPd2x9IGNhcm91c2VsIC0gVGhlIE93bCBDYXJvdXNlbFxuICAgKi9cbiAgdmFyIEhhc2ggPSBmdW5jdGlvbihjYXJvdXNlbCkge1xuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgY29yZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge093bH1cbiAgICAgKi9cbiAgICB0aGlzLl9jb3JlID0gY2Fyb3VzZWw7XG5cbiAgICAvKipcbiAgICAgKiBIYXNoIGluZGV4IGZvciB0aGUgaXRlbXMuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5faGFzaGVzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2Fyb3VzZWwgZWxlbWVudC5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQgPSB0aGlzLl9jb3JlLiRlbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogQWxsIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge1xuICAgICAgJ2luaXRpYWxpemVkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgdGhpcy5fY29yZS5zZXR0aW5ncy5zdGFydFBvc2l0aW9uID09PSAnVVJMSGFzaCcpIHtcbiAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignaGFzaGNoYW5nZS5vd2wubmF2aWdhdGlvbicpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdwcmVwYXJlZC5vd2wuY2Fyb3VzZWwnOiAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZXNwYWNlKSB7XG4gICAgICAgICAgdmFyIGhhc2ggPSAkKGUuY29udGVudCkuZmluZCgnW2RhdGEtaGFzaF0nKS5hZGRCYWNrKCdbZGF0YS1oYXNoXScpLmF0dHIoJ2RhdGEtaGFzaCcpO1xuXG4gICAgICAgICAgaWYgKCFoYXNoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5faGFzaGVzW2hhc2hdID0gZS5jb250ZW50O1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSxcbiAgICAgICdjaGFuZ2VkLm93bC5jYXJvdXNlbCc6ICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lc3BhY2UgJiYgZS5wcm9wZXJ0eS5uYW1lID09PSAncG9zaXRpb24nKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLl9jb3JlLml0ZW1zKHRoaXMuX2NvcmUucmVsYXRpdmUodGhpcy5fY29yZS5jdXJyZW50KCkpKSxcbiAgICAgICAgICAgIGhhc2ggPSAkLm1hcCh0aGlzLl9oYXNoZXMsIGZ1bmN0aW9uKGl0ZW0sIGhhc2gpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0gPT09IGN1cnJlbnQgPyBoYXNoIDogbnVsbDtcbiAgICAgICAgICAgIH0pLmpvaW4oKTtcblxuICAgICAgICAgIGlmICghaGFzaCB8fCB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSA9PT0gaGFzaCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcylcbiAgICB9O1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIHRoaXMuX2NvcmUub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBIYXNoLkRlZmF1bHRzLCB0aGlzLl9jb3JlLm9wdGlvbnMpO1xuXG4gICAgLy8gcmVnaXN0ZXIgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy4kZWxlbWVudC5vbih0aGlzLl9oYW5kbGVycyk7XG5cbiAgICAvLyByZWdpc3RlciBldmVudCBsaXN0ZW5lciBmb3IgaGFzaCBuYXZpZ2F0aW9uXG4gICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlLm93bC5uYXZpZ2F0aW9uJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICAgICAgaXRlbXMgPSB0aGlzLl9jb3JlLiRzdGFnZS5jaGlsZHJlbigpLFxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX2hhc2hlc1toYXNoXSAmJiBpdGVtcy5pbmRleCh0aGlzLl9oYXNoZXNbaGFzaF0pO1xuXG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCB8fCBwb3NpdGlvbiA9PT0gdGhpcy5fY29yZS5jdXJyZW50KCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb3JlLnRvKHRoaXMuX2NvcmUucmVsYXRpdmUocG9zaXRpb24pLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSwgdGhpcykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIEhhc2guRGVmYXVsdHMgPSB7XG4gICAgVVJMaGFzaExpc3RlbmVyOiBmYWxzZVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBIYXNoLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhhbmRsZXIsIHByb3BlcnR5O1xuXG4gICAgJCh3aW5kb3cpLm9mZignaGFzaGNoYW5nZS5vd2wubmF2aWdhdGlvbicpO1xuXG4gICAgZm9yIChoYW5kbGVyIGluIHRoaXMuX2hhbmRsZXJzKSB7XG4gICAgICB0aGlzLl9jb3JlLiRlbGVtZW50Lm9mZihoYW5kbGVyLCB0aGlzLl9oYW5kbGVyc1toYW5kbGVyXSk7XG4gICAgfVxuICAgIGZvciAocHJvcGVydHkgaW4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcykpIHtcbiAgICAgIHR5cGVvZiB0aGlzW3Byb3BlcnR5XSAhPSAnZnVuY3Rpb24nICYmICh0aGlzW3Byb3BlcnR5XSA9IG51bGwpO1xuICAgIH1cbiAgfTtcblxuICAkLmZuLm93bENhcm91c2VsLkNvbnN0cnVjdG9yLlBsdWdpbnMuSGFzaCA9IEhhc2g7XG5cbn0pKHdpbmRvdy5aZXB0byB8fCB3aW5kb3cualF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuLyoqXG4gKiBTdXBwb3J0IFBsdWdpblxuICpcbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKiBAYXV0aG9yIFZpdmlkIFBsYW5ldCBTb2Z0d2FyZSBHbWJIXG4gKiBAYXV0aG9yIEFydHVzIEtvbGFub3dza2lcbiAqIEBhdXRob3IgRGF2aWQgRGV1dHNjaFxuICogQGxpY2Vuc2UgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKi9cbjsoZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHN0eWxlID0gJCgnPHN1cHBvcnQ+JykuZ2V0KDApLnN0eWxlLFxuICAgIHByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycuc3BsaXQoJyAnKSxcbiAgICBldmVudHMgPSB7XG4gICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgIGVuZDoge1xuICAgICAgICAgIFdlYmtpdFRyYW5zaXRpb246ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgICBNb3pUcmFuc2l0aW9uOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICAgdHJhbnNpdGlvbjogJ3RyYW5zaXRpb25lbmQnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246IHtcbiAgICAgICAgZW5kOiB7XG4gICAgICAgICAgV2Via2l0QW5pbWF0aW9uOiAnd2Via2l0QW5pbWF0aW9uRW5kJyxcbiAgICAgICAgICBNb3pBbmltYXRpb246ICdhbmltYXRpb25lbmQnLFxuICAgICAgICAgIE9BbmltYXRpb246ICdvQW5pbWF0aW9uRW5kJyxcbiAgICAgICAgICBhbmltYXRpb246ICdhbmltYXRpb25lbmQnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzID0ge1xuICAgICAgY3NzdHJhbnNmb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXRlc3QoJ3RyYW5zZm9ybScpO1xuICAgICAgfSxcbiAgICAgIGNzc3RyYW5zZm9ybXMzZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXRlc3QoJ3BlcnNwZWN0aXZlJyk7XG4gICAgICB9LFxuICAgICAgY3NzdHJhbnNpdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0ZXN0KCd0cmFuc2l0aW9uJyk7XG4gICAgICB9LFxuICAgICAgY3NzYW5pbWF0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXRlc3QoJ2FuaW1hdGlvbicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgZnVuY3Rpb24gdGVzdChwcm9wZXJ0eSwgcHJlZml4ZWQpIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2UsXG4gICAgICB1cHBlciA9IHByb3BlcnR5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcGVydHkuc2xpY2UoMSk7XG5cbiAgICAkLmVhY2goKHByb3BlcnR5ICsgJyAnICsgcHJlZml4ZXMuam9pbih1cHBlciArICcgJykgKyB1cHBlcikuc3BsaXQoJyAnKSwgZnVuY3Rpb24oaSwgcHJvcGVydHkpIHtcbiAgICAgIGlmIChzdHlsZVtwcm9wZXJ0eV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXN1bHQgPSBwcmVmaXhlZCA/IHByb3BlcnR5IDogdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZWZpeGVkKHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIHRlc3QocHJvcGVydHksIHRydWUpO1xuICB9XG5cbiAgaWYgKHRlc3RzLmNzc3RyYW5zaXRpb25zKCkpIHtcbiAgICAvKiBqc2hpbnQgLVcwNTMgKi9cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IG5ldyBTdHJpbmcocHJlZml4ZWQoJ3RyYW5zaXRpb24nKSlcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQgPSBldmVudHMudHJhbnNpdGlvbi5lbmRbICQuc3VwcG9ydC50cmFuc2l0aW9uIF07XG4gIH1cblxuICBpZiAodGVzdHMuY3NzYW5pbWF0aW9ucygpKSB7XG4gICAgLyoganNoaW50IC1XMDUzICovXG4gICAgJC5zdXBwb3J0LmFuaW1hdGlvbiA9IG5ldyBTdHJpbmcocHJlZml4ZWQoJ2FuaW1hdGlvbicpKVxuICAgICQuc3VwcG9ydC5hbmltYXRpb24uZW5kID0gZXZlbnRzLmFuaW1hdGlvbi5lbmRbICQuc3VwcG9ydC5hbmltYXRpb24gXTtcbiAgfVxuXG4gIGlmICh0ZXN0cy5jc3N0cmFuc2Zvcm1zKCkpIHtcbiAgICAvKiBqc2hpbnQgLVcwNTMgKi9cbiAgICAkLnN1cHBvcnQudHJhbnNmb3JtID0gbmV3IFN0cmluZyhwcmVmaXhlZCgndHJhbnNmb3JtJykpO1xuICAgICQuc3VwcG9ydC50cmFuc2Zvcm0zZCA9IHRlc3RzLmNzc3RyYW5zZm9ybXMzZCgpO1xuICB9XG5cbn0pKHdpbmRvdy5aZXB0byB8fCB3aW5kb3cualF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAkKCcuY2Fyb3VzZWwnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgIHZhciBzbGlkZXJPd2wgPSAkKHRoaXMpLFxuICAgICAgICBzbGlkZXJQYXJhbWV0cnMgPSB7fSxcbiAgICAgICAgYXR0clBhcmFtZXRycyA9ICQodGhpcykuYXR0cignZGF0YS1vcHRpb25zJyk7XG4gICAgaWYgKHR5cGVvZiBhdHRyUGFyYW1ldHJzICE9ICd1bmRlZmluZWQnKVxuICAgICAgc2xpZGVyUGFyYW1ldHJzID0gSlNPTi5wYXJzZShhdHRyUGFyYW1ldHJzKTtcbiAgICBzbGlkZXJPd2wub3dsQ2Fyb3VzZWwoc2xpZGVyUGFyYW1ldHJzKTtcbiAgfSk7XG4gIFxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAkKCcuc3Bpbm5lcicpLmhpZGUoKTtcbiAgfSk7XG4gIFxufSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoXCIuZHJvcGRvd25cIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmZpbmQoXCIuZHJvcGRvd25fX2NvbnRlbnRcIikuc2xpZGVUb2dnbGUoKTtcbiAgICAkKHRoaXMpLmZpbmQoXCIuZHJvcGRvd25fX3RpdGxlXCIpLnRvZ2dsZUNsYXNzKFwiZHJvcGRvd25fX3RpdGxlX2hpZ2hsaWdodFwiKTtcbiAgICAkKHRoaXMpLmZpbmQoXCIuaWNvblwiKS50b2dnbGVDbGFzcyhcImljb25fY2hldnJvbi1kb3duIGljb25fY2hldnJvbi11cFwiKTtcbiAgfSk7XG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgXG4gICQoJy5pbnB1dCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgJCh0aGlzKS5ibHVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZigkKHRoaXMpLnZhbCgpLmxlbmd0aCl7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIHZhciBtb2RhbFdyYXBwZXIgPSAkKCcubW9kYWwtd3JhcHBlcicpO1xuICB2YXIgbW9kYWwgPSAkKCcubW9kYWwnKTtcbiAgdmFyIG92ZXJsYXkgPSAkKCcub3ZlcmxheScpO1xuICB2YXIgcGFnZSA9ICQoJy5wYWdlJyk7XG5cbiAgJChcIipbZGF0YS1saW5rKj0nanMtbW9kYWwnXVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBvcGVuTW9kYWwoJCh0aGlzKS5kYXRhKCdsaW5rJykpO1xuICB9KTtcblxuICBtb2RhbC5jbGljayhmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSlcblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKG1vZGFsX2lkKSB7XG4gICAgY29uc29sZS5sb2coJ2Nsb3NlICcsIG1vZGFsX2lkKTtcblxuICAgIHZhciBtb2RhbCA9ICQoJyMnICsgbW9kYWxfaWQpO1xuXG4gICAgb3ZlcmxheS5mYWRlT3V0KDIwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgbW9kYWwuYWRkQ2xhc3MoJ21vZGFsLXdyYXBwZXJfaGlkZGVuJykuYW5pbWF0ZSh7b3BhY2l0eTogMH0sIDEwMCk7XG4gICAgfSk7XG5cbiAgICBvdmVybGF5LmFkZENsYXNzKCdvdmVybGF5X2hpZGRlbicpO1xuICAgIHBhZ2UucmVtb3ZlQ2xhc3MoJ3BhZ2VfaGlkZGVuJyk7XG4gIH1cblxuICBmdW5jdGlvbiBvcGVuTW9kYWwobW9kYWxfaWQpIHtcbiAgICBjb25zb2xlLmxvZygnb3BlbiAnLCBtb2RhbF9pZCk7XG5cbiAgICB2YXIgbW9kYWwgPSAkKCcjJyArIG1vZGFsX2lkKTtcbiAgICB2YXIgbW9kYWxfY2xvc2UgPSAkKCcubW9kYWxfX2Nsb3NlJywgbW9kYWwpO1xuXG4gICAgb3ZlcmxheS5mYWRlSW4oMjAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICBtb2RhbC5yZW1vdmVDbGFzcygnbW9kYWwtd3JhcHBlcl9oaWRkZW4nKS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgMTAwKTtcbiAgICB9KTtcblxuICAgIG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ292ZXJsYXlfaGlkZGVuJyk7XG4gICAgcGFnZS5hZGRDbGFzcygncGFnZV9oaWRkZW4nKTtcblxuICAgIG1vZGFsV3JhcHBlci51bmJpbmQoXCJjbGlja1wiKS5iaW5kKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoIWV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKWNsb3NlTW9kYWwobW9kYWxfaWQpXG4gICAgfSk7XG5cbiAgICBtb2RhbF9jbG9zZS51bmJpbmQoXCJjbGlja1wiKS5iaW5kKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjbG9zZU1vZGFsKG1vZGFsX2lkKVxuICAgIH0pO1xuXG4gICAgaWYgKCEkKFwiZGl2XCIpLmlzKFwiLm92ZXJsYXlcIikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Jsb2NrIFwib3ZlcmxheVwiIG5vdCBmb3VuZCBvbiBhIHBhZ2UuJyk7XG4gICAgfVxuICB9XG5cbn0pOyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBcbiAgLy8g0JrQu9C40Log0L/QviByYWRpbyDQutC90L7Qv9C60LDQvCDQsiDRhNC+0YDQvNCw0YLQtSBidXR0b25cbiAgJCgnYnV0dG9uLnJhZGlvJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciByYWRpb0J1dHRvbiA9ICQodGhpcyksXG4gICAgICAgIGdyb3VwID0gcmFkaW9CdXR0b24uYXR0cignbmFtZScpLFxuICAgICAgICBsaW5rID0gcmFkaW9CdXR0b24uYXR0cignZGF0YS1saW5rJyk7XG4gICAgaWYocmFkaW9CdXR0b24uaGFzQ2xhc3MoJ2FjdGl2ZScpKXtcbiAgICAgIHJhZGlvQnV0dG9uLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICQoJyMnK2xpbmspLnJlbW92ZUNsYXNzKCd0YWJfX2l0ZW1fYWN0aXZlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhZGlvQnV0dG9uLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICByYWRpb0J1dHRvbi5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICBzd2l0Y2hUYWJzKGxpbmspO1xuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICAvLyDQmtC70LjQuiDQv9C+IHJhZGlvINC60L3QvtC/0LrQsNC8INCyINGE0L7RgNC80LDRgtC1IGlucHV0W3R5cGU9XCJyYWRpb1wiXVxuICAkKCcucmFkaW9fX2lucHV0JykuY2hhbmdlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHJhZGlvSW5wdXQgPSAkKHRoaXMpLFxuICAgICAgICBncm91cCA9IHJhZGlvSW5wdXQuYXR0cignbmFtZScpLFxuICAgICAgICBsaW5rID0gcmFkaW9JbnB1dC5hdHRyKCdkYXRhLWxpbmsnKTtcbiAgICBpZighcmFkaW9JbnB1dC5wcm9wKCc6Y2hlY2tlZCcpKXtcbiAgICAgIHN3aXRjaFRhYnMobGluayk7XG4gICAgfVxuICB9KTtcblxufSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cblx0XHQkKCcucmFkaW8tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHQgICAgJCh0aGlzKS5maW5kKCcucmFkaW8nKS5maXJzdCgpLmNsaWNrKCk7XG5cdCAgfSk7XG5cbn0pOyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gIGlmKCQoJ2JvZHknKS5maW5kKCcucmFuZ2UnKS5sZW5ndGgpe1xuXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBcbiAgICAgIHZhciB2YWx1ZVJhbmdlID0gZnVuY3Rpb24oZWwpe1xuICAgICAgICBpZihlbC52YWwoKSAhPSBlbC5hdHRyKCdwbGFjZWhvbGRlcicpICYmIGVsLnZhbCgpLmxlbmd0aCA+IDApe1xuICAgICAgICAgIGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbC52YWwoZWwuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgICQoJy5yYW5nZScpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbCkge1xuICAgICAgICAgIHZhciByYW5nZSA9ICQodGhpcykuZmluZChcIi5yYW5nZV9fc2xpZGVyXCIpLFxuICAgICAgICAgICAgICBtaW4gPSAkKHRoaXMpLmZpbmQoJy5yYW5nZV9fbWluJyksXG4gICAgICAgICAgICAgIG1heCA9ICQodGhpcykuZmluZCgnLnJhbmdlX19tYXgnKSxcbiAgICAgICAgICAgICAgcmFuZ2VSZW1vdmUgPSAkKHRoaXMpLmZpbmQoJy5yYW5nZV9fZmllbGQtcmVtb3ZlJyksXG4gICAgICAgICAgICAgIGZyb20gPSBwYXJzZUludChtaW4uYXR0cigncGxhY2Vob2xkZXInKSksXG4gICAgICAgICAgICAgIHRvID0gcGFyc2VJbnQobWF4LmF0dHIoJ3BsYWNlaG9sZGVyJykpLFxuICAgICAgICAgICAgICByYW5nZVZhbCxcbiAgICAgICAgICAgICAgbWluVmFsLFxuICAgICAgICAgICAgICBtYXhWYWw7XG5cbiAgICAgICAgICBpZihtaW4udmFsKCkgPiAwKXtcbiAgICAgICAgICAgICAgbWluLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYobWF4LnZhbCgpID4gMCl7XG4gICAgICAgICAgICAgIG1heC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1pbi52YWwoKSkge1xuICAgICAgICAgICAgICBtaW5WYWwgPSBtaW4udmFsKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWluVmFsID0gZnJvbTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWF4LnZhbCgpKSB7XG4gICAgICAgICAgICAgIG1heFZhbCA9IG1heC52YWwoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXhWYWwgPSB0bztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByYW5nZS5zbGlkZXIoe1xuICAgICAgICAgICAgICByYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgbWluOiBmcm9tLFxuICAgICAgICAgICAgICBtYXg6IHRvLFxuICAgICAgICAgICAgICB2YWx1ZXM6IFttaW5WYWwsIG1heFZhbF0sXG4gICAgICAgICAgICAgIHNsaWRlOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAgICAgbWluLnZhbCh1aS52YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgIG1heC52YWwodWkudmFsdWVzWzFdKTsgICAgXG4gICAgICAgICAgICAgICAgdmFsdWVSYW5nZShtaW4pO1xuICAgICAgICAgICAgICAgIHZhbHVlUmFuZ2UobWF4KTsgICAgICAgIFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtaW4uY2hhbmdlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmFuZ2Uuc2xpZGVyKFwidmFsdWVzXCIsIDAsICQodGhpcykudmFsKCkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWF4LmNoYW5nZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJhbmdlLnNsaWRlcihcInZhbHVlc1wiLCAxLCAkKHRoaXMpLnZhbCgpKTsgICAgICAgICAgXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtaW4ua2V5dXAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhbHVlUmFuZ2UoJCh0aGlzKSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtYXgua2V5dXAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhbHVlUmFuZ2UoJCh0aGlzKSlcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1pbi52YWwocmFuZ2Uuc2xpZGVyKFwidmFsdWVzXCIsIDApKTtcbiAgICAgICAgICBtYXgudmFsKHJhbmdlLnNsaWRlcihcInZhbHVlc1wiLCAxKSk7XG5cbiAgICAgICAgICByYW5nZVJlbW92ZS5jbGljaygnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGZpZWxkSW5wdXQgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ2lucHV0Jyk7ICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGZpZWxkSW5wdXQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ2lucHV0JykuaGFzQ2xhc3MoJ3JhbmdlX19taW4nKSl7XG4gICAgICAgICAgICAgICAgICBmaWVsZElucHV0LnZhbCgnMCcpO1xuICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2xpZGVyKFwidmFsdWVzXCIsIDAsIGZpZWxkSW5wdXQudmFsKCkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZmllbGRJbnB1dC52YWwoZmllbGRJbnB1dC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgICAgICAgIHJhbmdlLnNsaWRlcihcInZhbHVlc1wiLCAxLCBmaWVsZElucHV0LmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgfVxuXG59KTtcblxuXG5cbi8qISBqUXVlcnkgVUkgLSB2MS4xMS40IC0gMjAxNy0wNi0yNlxuKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4qIEluY2x1ZGVzOiBjb3JlLmpzLCB3aWRnZXQuanMsIG1vdXNlLmpzLCBzbGlkZXIuanNcbiogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnM7IExpY2Vuc2VkIE1JVCAqL1xuXG4oZnVuY3Rpb24odCl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sdCk6dChqUXVlcnkpfSkoZnVuY3Rpb24odCl7ZnVuY3Rpb24gZShlLHMpe3ZhciBuLG8sYSxyPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtyZXR1cm5cImFyZWFcIj09PXI/KG49ZS5wYXJlbnROb2RlLG89bi5uYW1lLGUuaHJlZiYmbyYmXCJtYXBcIj09PW4ubm9kZU5hbWUudG9Mb3dlckNhc2UoKT8oYT10KFwiaW1nW3VzZW1hcD0nI1wiK28rXCInXVwiKVswXSwhIWEmJmkoYSkpOiExKTooL14oaW5wdXR8c2VsZWN0fHRleHRhcmVhfGJ1dHRvbnxvYmplY3QpJC8udGVzdChyKT8hZS5kaXNhYmxlZDpcImFcIj09PXI/ZS5ocmVmfHxzOnMpJiZpKGUpfWZ1bmN0aW9uIGkoZSl7cmV0dXJuIHQuZXhwci5maWx0ZXJzLnZpc2libGUoZSkmJiF0KGUpLnBhcmVudHMoKS5hZGRCYWNrKCkuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJoaWRkZW5cIj09PXQuY3NzKHRoaXMsXCJ2aXNpYmlsaXR5XCIpfSkubGVuZ3RofXQudWk9dC51aXx8e30sdC5leHRlbmQodC51aSx7dmVyc2lvbjpcIjEuMTEuNFwiLGtleUNvZGU6e0JBQ0tTUEFDRTo4LENPTU1BOjE4OCxERUxFVEU6NDYsRE9XTjo0MCxFTkQ6MzUsRU5URVI6MTMsRVNDQVBFOjI3LEhPTUU6MzYsTEVGVDozNyxQQUdFX0RPV046MzQsUEFHRV9VUDozMyxQRVJJT0Q6MTkwLFJJR0hUOjM5LFNQQUNFOjMyLFRBQjo5LFVQOjM4fX0pLHQuZm4uZXh0ZW5kKHtzY3JvbGxQYXJlbnQ6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcy5jc3MoXCJwb3NpdGlvblwiKSxzPVwiYWJzb2x1dGVcIj09PWksbj1lPy8oYXV0b3xzY3JvbGx8aGlkZGVuKS86LyhhdXRvfHNjcm9sbCkvLG89dGhpcy5wYXJlbnRzKCkuZmlsdGVyKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTtyZXR1cm4gcyYmXCJzdGF0aWNcIj09PWUuY3NzKFwicG9zaXRpb25cIik/ITE6bi50ZXN0KGUuY3NzKFwib3ZlcmZsb3dcIikrZS5jc3MoXCJvdmVyZmxvdy15XCIpK2UuY3NzKFwib3ZlcmZsb3cteFwiKSl9KS5lcSgwKTtyZXR1cm5cImZpeGVkXCIhPT1pJiZvLmxlbmd0aD9vOnQodGhpc1swXS5vd25lckRvY3VtZW50fHxkb2N1bWVudCl9LHVuaXF1ZUlkOmZ1bmN0aW9uKCl7dmFyIHQ9MDtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5pZHx8KHRoaXMuaWQ9XCJ1aS1pZC1cIisgKyt0KX0pfX0oKSxyZW1vdmVVbmlxdWVJZDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXsvXnVpLWlkLVxcZCskLy50ZXN0KHRoaXMuaWQpJiZ0KHRoaXMpLnJlbW92ZUF0dHIoXCJpZFwiKX0pfX0pLHQuZXh0ZW5kKHQuZXhwcltcIjpcIl0se2RhdGE6dC5leHByLmNyZWF0ZVBzZXVkbz90LmV4cHIuY3JlYXRlUHNldWRvKGZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihpKXtyZXR1cm4hIXQuZGF0YShpLGUpfX0pOmZ1bmN0aW9uKGUsaSxzKXtyZXR1cm4hIXQuZGF0YShlLHNbM10pfSxmb2N1c2FibGU6ZnVuY3Rpb24oaSl7cmV0dXJuIGUoaSwhaXNOYU4odC5hdHRyKGksXCJ0YWJpbmRleFwiKSkpfSx0YWJiYWJsZTpmdW5jdGlvbihpKXt2YXIgcz10LmF0dHIoaSxcInRhYmluZGV4XCIpLG49aXNOYU4ocyk7cmV0dXJuKG58fHM+PTApJiZlKGksIW4pfX0pLHQoXCI8YT5cIikub3V0ZXJXaWR0aCgxKS5qcXVlcnl8fHQuZWFjaChbXCJXaWR0aFwiLFwiSGVpZ2h0XCJdLGZ1bmN0aW9uKGUsaSl7ZnVuY3Rpb24gcyhlLGkscyxvKXtyZXR1cm4gdC5lYWNoKG4sZnVuY3Rpb24oKXtpLT1wYXJzZUZsb2F0KHQuY3NzKGUsXCJwYWRkaW5nXCIrdGhpcykpfHwwLHMmJihpLT1wYXJzZUZsb2F0KHQuY3NzKGUsXCJib3JkZXJcIit0aGlzK1wiV2lkdGhcIikpfHwwKSxvJiYoaS09cGFyc2VGbG9hdCh0LmNzcyhlLFwibWFyZ2luXCIrdGhpcykpfHwwKX0pLGl9dmFyIG49XCJXaWR0aFwiPT09aT9bXCJMZWZ0XCIsXCJSaWdodFwiXTpbXCJUb3BcIixcIkJvdHRvbVwiXSxvPWkudG9Mb3dlckNhc2UoKSxhPXtpbm5lcldpZHRoOnQuZm4uaW5uZXJXaWR0aCxpbm5lckhlaWdodDp0LmZuLmlubmVySGVpZ2h0LG91dGVyV2lkdGg6dC5mbi5vdXRlcldpZHRoLG91dGVySGVpZ2h0OnQuZm4ub3V0ZXJIZWlnaHR9O3QuZm5bXCJpbm5lclwiK2ldPWZ1bmN0aW9uKGUpe3JldHVybiB2b2lkIDA9PT1lP2FbXCJpbm5lclwiK2ldLmNhbGwodGhpcyk6dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS5jc3MobyxzKHRoaXMsZSkrXCJweFwiKX0pfSx0LmZuW1wib3V0ZXJcIitpXT1mdW5jdGlvbihlLG4pe3JldHVyblwibnVtYmVyXCIhPXR5cGVvZiBlP2FbXCJvdXRlclwiK2ldLmNhbGwodGhpcyxlKTp0aGlzLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLmNzcyhvLHModGhpcyxlLCEwLG4pK1wicHhcIil9KX19KSx0LmZuLmFkZEJhY2t8fCh0LmZuLmFkZEJhY2s9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuYWRkKG51bGw9PXQ/dGhpcy5wcmV2T2JqZWN0OnRoaXMucHJldk9iamVjdC5maWx0ZXIodCkpfSksdChcIjxhPlwiKS5kYXRhKFwiYS1iXCIsXCJhXCIpLnJlbW92ZURhdGEoXCJhLWJcIikuZGF0YShcImEtYlwiKSYmKHQuZm4ucmVtb3ZlRGF0YT1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oaSl7cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGg/ZS5jYWxsKHRoaXMsdC5jYW1lbENhc2UoaSkpOmUuY2FsbCh0aGlzKX19KHQuZm4ucmVtb3ZlRGF0YSkpLHQudWkuaWU9ISEvbXNpZSBbXFx3Ll0rLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSksdC5mbi5leHRlbmQoe2ZvY3VzOmZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihpLHMpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBpP3RoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe3QoZSkuZm9jdXMoKSxzJiZzLmNhbGwoZSl9LGkpfSk6ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fSh0LmZuLmZvY3VzKSxkaXNhYmxlU2VsZWN0aW9uOmZ1bmN0aW9uKCl7dmFyIHQ9XCJvbnNlbGVjdHN0YXJ0XCJpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpP1wic2VsZWN0c3RhcnRcIjpcIm1vdXNlZG93blwiO3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmJpbmQodCtcIi51aS1kaXNhYmxlU2VsZWN0aW9uXCIsZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpfSl9fSgpLGVuYWJsZVNlbGVjdGlvbjpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuYmluZChcIi51aS1kaXNhYmxlU2VsZWN0aW9uXCIpfSx6SW5kZXg6ZnVuY3Rpb24oZSl7aWYodm9pZCAwIT09ZSlyZXR1cm4gdGhpcy5jc3MoXCJ6SW5kZXhcIixlKTtpZih0aGlzLmxlbmd0aClmb3IodmFyIGkscyxuPXQodGhpc1swXSk7bi5sZW5ndGgmJm5bMF0hPT1kb2N1bWVudDspe2lmKGk9bi5jc3MoXCJwb3NpdGlvblwiKSwoXCJhYnNvbHV0ZVwiPT09aXx8XCJyZWxhdGl2ZVwiPT09aXx8XCJmaXhlZFwiPT09aSkmJihzPXBhcnNlSW50KG4uY3NzKFwiekluZGV4XCIpLDEwKSwhaXNOYU4ocykmJjAhPT1zKSlyZXR1cm4gcztuPW4ucGFyZW50KCl9cmV0dXJuIDB9fSksdC51aS5wbHVnaW49e2FkZDpmdW5jdGlvbihlLGkscyl7dmFyIG4sbz10LnVpW2VdLnByb3RvdHlwZTtmb3IobiBpbiBzKW8ucGx1Z2luc1tuXT1vLnBsdWdpbnNbbl18fFtdLG8ucGx1Z2luc1tuXS5wdXNoKFtpLHNbbl1dKX0sY2FsbDpmdW5jdGlvbih0LGUsaSxzKXt2YXIgbixvPXQucGx1Z2luc1tlXTtpZihvJiYoc3x8dC5lbGVtZW50WzBdLnBhcmVudE5vZGUmJjExIT09dC5lbGVtZW50WzBdLnBhcmVudE5vZGUubm9kZVR5cGUpKWZvcihuPTA7by5sZW5ndGg+bjtuKyspdC5vcHRpb25zW29bbl1bMF1dJiZvW25dWzFdLmFwcGx5KHQuZWxlbWVudCxpKX19O3ZhciBzPTAsbj1BcnJheS5wcm90b3R5cGUuc2xpY2U7dC5jbGVhbkRhdGE9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKGkpe3ZhciBzLG4sbztmb3Iobz0wO251bGwhPShuPWlbb10pO28rKyl0cnl7cz10Ll9kYXRhKG4sXCJldmVudHNcIikscyYmcy5yZW1vdmUmJnQobikudHJpZ2dlckhhbmRsZXIoXCJyZW1vdmVcIil9Y2F0Y2goYSl7fWUoaSl9fSh0LmNsZWFuRGF0YSksdC53aWRnZXQ9ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG8sYSxyLGw9e30saD1lLnNwbGl0KFwiLlwiKVswXTtyZXR1cm4gZT1lLnNwbGl0KFwiLlwiKVsxXSxuPWgrXCItXCIrZSxzfHwocz1pLGk9dC5XaWRnZXQpLHQuZXhwcltcIjpcIl1bbi50b0xvd2VyQ2FzZSgpXT1mdW5jdGlvbihlKXtyZXR1cm4hIXQuZGF0YShlLG4pfSx0W2hdPXRbaF18fHt9LG89dFtoXVtlXSxhPXRbaF1bZV09ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fY3JlYXRlV2lkZ2V0Pyhhcmd1bWVudHMubGVuZ3RoJiZ0aGlzLl9jcmVhdGVXaWRnZXQodCxlKSx2b2lkIDApOm5ldyBhKHQsZSl9LHQuZXh0ZW5kKGEsbyx7dmVyc2lvbjpzLnZlcnNpb24sX3Byb3RvOnQuZXh0ZW5kKHt9LHMpLF9jaGlsZENvbnN0cnVjdG9yczpbXX0pLHI9bmV3IGksci5vcHRpb25zPXQud2lkZ2V0LmV4dGVuZCh7fSxyLm9wdGlvbnMpLHQuZWFjaChzLGZ1bmN0aW9uKGUscyl7cmV0dXJuIHQuaXNGdW5jdGlvbihzKT8obFtlXT1mdW5jdGlvbigpe3ZhciB0PWZ1bmN0aW9uKCl7cmV0dXJuIGkucHJvdG90eXBlW2VdLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sbj1mdW5jdGlvbih0KXtyZXR1cm4gaS5wcm90b3R5cGVbZV0uYXBwbHkodGhpcyx0KX07cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGUsaT10aGlzLl9zdXBlcixvPXRoaXMuX3N1cGVyQXBwbHk7cmV0dXJuIHRoaXMuX3N1cGVyPXQsdGhpcy5fc3VwZXJBcHBseT1uLGU9cy5hcHBseSh0aGlzLGFyZ3VtZW50cyksdGhpcy5fc3VwZXI9aSx0aGlzLl9zdXBlckFwcGx5PW8sZX19KCksdm9pZCAwKToobFtlXT1zLHZvaWQgMCl9KSxhLnByb3RvdHlwZT10LndpZGdldC5leHRlbmQocix7d2lkZ2V0RXZlbnRQcmVmaXg6bz9yLndpZGdldEV2ZW50UHJlZml4fHxlOmV9LGwse2NvbnN0cnVjdG9yOmEsbmFtZXNwYWNlOmgsd2lkZ2V0TmFtZTplLHdpZGdldEZ1bGxOYW1lOm59KSxvPyh0LmVhY2goby5fY2hpbGRDb25zdHJ1Y3RvcnMsZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZTt0LndpZGdldChzLm5hbWVzcGFjZStcIi5cIitzLndpZGdldE5hbWUsYSxpLl9wcm90byl9KSxkZWxldGUgby5fY2hpbGRDb25zdHJ1Y3RvcnMpOmkuX2NoaWxkQ29uc3RydWN0b3JzLnB1c2goYSksdC53aWRnZXQuYnJpZGdlKGUsYSksYX0sdC53aWRnZXQuZXh0ZW5kPWZ1bmN0aW9uKGUpe2Zvcih2YXIgaSxzLG89bi5jYWxsKGFyZ3VtZW50cywxKSxhPTAscj1vLmxlbmd0aDtyPmE7YSsrKWZvcihpIGluIG9bYV0pcz1vW2FdW2ldLG9bYV0uaGFzT3duUHJvcGVydHkoaSkmJnZvaWQgMCE9PXMmJihlW2ldPXQuaXNQbGFpbk9iamVjdChzKT90LmlzUGxhaW5PYmplY3QoZVtpXSk/dC53aWRnZXQuZXh0ZW5kKHt9LGVbaV0scyk6dC53aWRnZXQuZXh0ZW5kKHt9LHMpOnMpO3JldHVybiBlfSx0LndpZGdldC5icmlkZ2U9ZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZS53aWRnZXRGdWxsTmFtZXx8ZTt0LmZuW2VdPWZ1bmN0aW9uKG8pe3ZhciBhPVwic3RyaW5nXCI9PXR5cGVvZiBvLHI9bi5jYWxsKGFyZ3VtZW50cywxKSxsPXRoaXM7cmV0dXJuIGE/dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGksbj10LmRhdGEodGhpcyxzKTtyZXR1cm5cImluc3RhbmNlXCI9PT1vPyhsPW4sITEpOm4/dC5pc0Z1bmN0aW9uKG5bb10pJiZcIl9cIiE9PW8uY2hhckF0KDApPyhpPW5bb10uYXBwbHkobixyKSxpIT09biYmdm9pZCAwIT09aT8obD1pJiZpLmpxdWVyeT9sLnB1c2hTdGFjayhpLmdldCgpKTppLCExKTp2b2lkIDApOnQuZXJyb3IoXCJubyBzdWNoIG1ldGhvZCAnXCIrbytcIicgZm9yIFwiK2UrXCIgd2lkZ2V0IGluc3RhbmNlXCIpOnQuZXJyb3IoXCJjYW5ub3QgY2FsbCBtZXRob2RzIG9uIFwiK2UrXCIgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247IFwiK1wiYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kICdcIitvK1wiJ1wiKX0pOihyLmxlbmd0aCYmKG89dC53aWRnZXQuZXh0ZW5kLmFwcGx5KG51bGwsW29dLmNvbmNhdChyKSkpLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQuZGF0YSh0aGlzLHMpO2U/KGUub3B0aW9uKG98fHt9KSxlLl9pbml0JiZlLl9pbml0KCkpOnQuZGF0YSh0aGlzLHMsbmV3IGkobyx0aGlzKSl9KSksbH19LHQuV2lkZ2V0PWZ1bmN0aW9uKCl7fSx0LldpZGdldC5fY2hpbGRDb25zdHJ1Y3RvcnM9W10sdC5XaWRnZXQucHJvdG90eXBlPXt3aWRnZXROYW1lOlwid2lkZ2V0XCIsd2lkZ2V0RXZlbnRQcmVmaXg6XCJcIixkZWZhdWx0RWxlbWVudDpcIjxkaXY+XCIsb3B0aW9uczp7ZGlzYWJsZWQ6ITEsY3JlYXRlOm51bGx9LF9jcmVhdGVXaWRnZXQ6ZnVuY3Rpb24oZSxpKXtpPXQoaXx8dGhpcy5kZWZhdWx0RWxlbWVudHx8dGhpcylbMF0sdGhpcy5lbGVtZW50PXQoaSksdGhpcy51dWlkPXMrKyx0aGlzLmV2ZW50TmFtZXNwYWNlPVwiLlwiK3RoaXMud2lkZ2V0TmFtZSt0aGlzLnV1aWQsdGhpcy5iaW5kaW5ncz10KCksdGhpcy5ob3ZlcmFibGU9dCgpLHRoaXMuZm9jdXNhYmxlPXQoKSxpIT09dGhpcyYmKHQuZGF0YShpLHRoaXMud2lkZ2V0RnVsbE5hbWUsdGhpcyksdGhpcy5fb24oITAsdGhpcy5lbGVtZW50LHtyZW1vdmU6ZnVuY3Rpb24odCl7dC50YXJnZXQ9PT1pJiZ0aGlzLmRlc3Ryb3koKX19KSx0aGlzLmRvY3VtZW50PXQoaS5zdHlsZT9pLm93bmVyRG9jdW1lbnQ6aS5kb2N1bWVudHx8aSksdGhpcy53aW5kb3c9dCh0aGlzLmRvY3VtZW50WzBdLmRlZmF1bHRWaWV3fHx0aGlzLmRvY3VtZW50WzBdLnBhcmVudFdpbmRvdykpLHRoaXMub3B0aW9ucz10LndpZGdldC5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMuX2dldENyZWF0ZU9wdGlvbnMoKSxlKSx0aGlzLl9jcmVhdGUoKSx0aGlzLl90cmlnZ2VyKFwiY3JlYXRlXCIsbnVsbCx0aGlzLl9nZXRDcmVhdGVFdmVudERhdGEoKSksdGhpcy5faW5pdCgpfSxfZ2V0Q3JlYXRlT3B0aW9uczp0Lm5vb3AsX2dldENyZWF0ZUV2ZW50RGF0YTp0Lm5vb3AsX2NyZWF0ZTp0Lm5vb3AsX2luaXQ6dC5ub29wLGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLl9kZXN0cm95KCksdGhpcy5lbGVtZW50LnVuYmluZCh0aGlzLmV2ZW50TmFtZXNwYWNlKS5yZW1vdmVEYXRhKHRoaXMud2lkZ2V0RnVsbE5hbWUpLnJlbW92ZURhdGEodC5jYW1lbENhc2UodGhpcy53aWRnZXRGdWxsTmFtZSkpLHRoaXMud2lkZ2V0KCkudW5iaW5kKHRoaXMuZXZlbnROYW1lc3BhY2UpLnJlbW92ZUF0dHIoXCJhcmlhLWRpc2FibGVkXCIpLnJlbW92ZUNsYXNzKHRoaXMud2lkZ2V0RnVsbE5hbWUrXCItZGlzYWJsZWQgXCIrXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSx0aGlzLmJpbmRpbmdzLnVuYmluZCh0aGlzLmV2ZW50TmFtZXNwYWNlKSx0aGlzLmhvdmVyYWJsZS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpLHRoaXMuZm9jdXNhYmxlLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtZm9jdXNcIil9LF9kZXN0cm95OnQubm9vcCx3aWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50fSxvcHRpb246ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG8sYT1lO2lmKDA9PT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0LndpZGdldC5leHRlbmQoe30sdGhpcy5vcHRpb25zKTtpZihcInN0cmluZ1wiPT10eXBlb2YgZSlpZihhPXt9LHM9ZS5zcGxpdChcIi5cIiksZT1zLnNoaWZ0KCkscy5sZW5ndGgpe2ZvcihuPWFbZV09dC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9uc1tlXSksbz0wO3MubGVuZ3RoLTE+bztvKyspbltzW29dXT1uW3Nbb11dfHx7fSxuPW5bc1tvXV07aWYoZT1zLnBvcCgpLDE9PT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB2b2lkIDA9PT1uW2VdP251bGw6bltlXTtuW2VdPWl9ZWxzZXtpZigxPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdm9pZCAwPT09dGhpcy5vcHRpb25zW2VdP251bGw6dGhpcy5vcHRpb25zW2VdO2FbZV09aX1yZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyhhKSx0aGlzfSxfc2V0T3B0aW9uczpmdW5jdGlvbih0KXt2YXIgZTtmb3IoZSBpbiB0KXRoaXMuX3NldE9wdGlvbihlLHRbZV0pO3JldHVybiB0aGlzfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMub3B0aW9uc1t0XT1lLFwiZGlzYWJsZWRcIj09PXQmJih0aGlzLndpZGdldCgpLnRvZ2dsZUNsYXNzKHRoaXMud2lkZ2V0RnVsbE5hbWUrXCItZGlzYWJsZWRcIiwhIWUpLGUmJih0aGlzLmhvdmVyYWJsZS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpLHRoaXMuZm9jdXNhYmxlLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtZm9jdXNcIikpKSx0aGlzfSxlbmFibGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyh7ZGlzYWJsZWQ6ITF9KX0sZGlzYWJsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zZXRPcHRpb25zKHtkaXNhYmxlZDohMH0pfSxfb246ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG89dGhpcztcImJvb2xlYW5cIiE9dHlwZW9mIGUmJihzPWksaT1lLGU9ITEpLHM/KGk9bj10KGkpLHRoaXMuYmluZGluZ3M9dGhpcy5iaW5kaW5ncy5hZGQoaSkpOihzPWksaT10aGlzLmVsZW1lbnQsbj10aGlzLndpZGdldCgpKSx0LmVhY2gocyxmdW5jdGlvbihzLGEpe2Z1bmN0aW9uIHIoKXtyZXR1cm4gZXx8by5vcHRpb25zLmRpc2FibGVkIT09ITAmJiF0KHRoaXMpLmhhc0NsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIik/KFwic3RyaW5nXCI9PXR5cGVvZiBhP29bYV06YSkuYXBwbHkobyxhcmd1bWVudHMpOnZvaWQgMH1cInN0cmluZ1wiIT10eXBlb2YgYSYmKHIuZ3VpZD1hLmd1aWQ9YS5ndWlkfHxyLmd1aWR8fHQuZ3VpZCsrKTt2YXIgbD1zLm1hdGNoKC9eKFtcXHc6LV0qKVxccyooLiopJC8pLGg9bFsxXStvLmV2ZW50TmFtZXNwYWNlLGM9bFsyXTtjP24uZGVsZWdhdGUoYyxoLHIpOmkuYmluZChoLHIpfSl9LF9vZmY6ZnVuY3Rpb24oZSxpKXtpPShpfHxcIlwiKS5zcGxpdChcIiBcIikuam9pbih0aGlzLmV2ZW50TmFtZXNwYWNlK1wiIFwiKSt0aGlzLmV2ZW50TmFtZXNwYWNlLGUudW5iaW5kKGkpLnVuZGVsZWdhdGUoaSksdGhpcy5iaW5kaW5ncz10KHRoaXMuYmluZGluZ3Mubm90KGUpLmdldCgpKSx0aGlzLmZvY3VzYWJsZT10KHRoaXMuZm9jdXNhYmxlLm5vdChlKS5nZXQoKSksdGhpcy5ob3ZlcmFibGU9dCh0aGlzLmhvdmVyYWJsZS5ub3QoZSkuZ2V0KCkpfSxfZGVsYXk6ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiB0P3NbdF06dCkuYXBwbHkocyxhcmd1bWVudHMpfXZhciBzPXRoaXM7cmV0dXJuIHNldFRpbWVvdXQoaSxlfHwwKX0sX2hvdmVyYWJsZTpmdW5jdGlvbihlKXt0aGlzLmhvdmVyYWJsZT10aGlzLmhvdmVyYWJsZS5hZGQoZSksdGhpcy5fb24oZSx7bW91c2VlbnRlcjpmdW5jdGlvbihlKXt0KGUuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKX0sbW91c2VsZWF2ZTpmdW5jdGlvbihlKXt0KGUuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKX19KX0sX2ZvY3VzYWJsZTpmdW5jdGlvbihlKXt0aGlzLmZvY3VzYWJsZT10aGlzLmZvY3VzYWJsZS5hZGQoZSksdGhpcy5fb24oZSx7Zm9jdXNpbjpmdW5jdGlvbihlKXt0KGUuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1mb2N1c1wiKX0sZm9jdXNvdXQ6ZnVuY3Rpb24oZSl7dChlLmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtZm9jdXNcIil9fSl9LF90cmlnZ2VyOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbixvLGE9dGhpcy5vcHRpb25zW2VdO2lmKHM9c3x8e30saT10LkV2ZW50KGkpLGkudHlwZT0oZT09PXRoaXMud2lkZ2V0RXZlbnRQcmVmaXg/ZTp0aGlzLndpZGdldEV2ZW50UHJlZml4K2UpLnRvTG93ZXJDYXNlKCksaS50YXJnZXQ9dGhpcy5lbGVtZW50WzBdLG89aS5vcmlnaW5hbEV2ZW50KWZvcihuIGluIG8pbiBpbiBpfHwoaVtuXT1vW25dKTtyZXR1cm4gdGhpcy5lbGVtZW50LnRyaWdnZXIoaSxzKSwhKHQuaXNGdW5jdGlvbihhKSYmYS5hcHBseSh0aGlzLmVsZW1lbnRbMF0sW2ldLmNvbmNhdChzKSk9PT0hMXx8aS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSl9fSx0LmVhY2goe3Nob3c6XCJmYWRlSW5cIixoaWRlOlwiZmFkZU91dFwifSxmdW5jdGlvbihlLGkpe3QuV2lkZ2V0LnByb3RvdHlwZVtcIl9cIitlXT1mdW5jdGlvbihzLG4sbyl7XCJzdHJpbmdcIj09dHlwZW9mIG4mJihuPXtlZmZlY3Q6bn0pO3ZhciBhLHI9bj9uPT09ITB8fFwibnVtYmVyXCI9PXR5cGVvZiBuP2k6bi5lZmZlY3R8fGk6ZTtuPW58fHt9LFwibnVtYmVyXCI9PXR5cGVvZiBuJiYobj17ZHVyYXRpb246bn0pLGE9IXQuaXNFbXB0eU9iamVjdChuKSxuLmNvbXBsZXRlPW8sbi5kZWxheSYmcy5kZWxheShuLmRlbGF5KSxhJiZ0LmVmZmVjdHMmJnQuZWZmZWN0cy5lZmZlY3Rbcl0/c1tlXShuKTpyIT09ZSYmc1tyXT9zW3JdKG4uZHVyYXRpb24sbi5lYXNpbmcsbyk6cy5xdWV1ZShmdW5jdGlvbihpKXt0KHRoaXMpW2VdKCksbyYmby5jYWxsKHNbMF0pLGkoKX0pfX0pLHQud2lkZ2V0O3ZhciBvPSExO3QoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXtvPSExfSksdC53aWRnZXQoXCJ1aS5tb3VzZVwiLHt2ZXJzaW9uOlwiMS4xMS40XCIsb3B0aW9uczp7Y2FuY2VsOlwiaW5wdXQsdGV4dGFyZWEsYnV0dG9uLHNlbGVjdCxvcHRpb25cIixkaXN0YW5jZToxLGRlbGF5OjB9LF9tb3VzZUluaXQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuZWxlbWVudC5iaW5kKFwibW91c2Vkb3duLlwiK3RoaXMud2lkZ2V0TmFtZSxmdW5jdGlvbih0KXtyZXR1cm4gZS5fbW91c2VEb3duKHQpfSkuYmluZChcImNsaWNrLlwiK3RoaXMud2lkZ2V0TmFtZSxmdW5jdGlvbihpKXtyZXR1cm4hMD09PXQuZGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIik/KHQucmVtb3ZlRGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiksaS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwhMSk6dm9pZCAwfSksdGhpcy5zdGFydGVkPSExfSxfbW91c2VEZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnVuYmluZChcIi5cIit0aGlzLndpZGdldE5hbWUpLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlJiZ0aGlzLmRvY3VtZW50LnVuYmluZChcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLnVuYmluZChcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSl9LF9tb3VzZURvd246ZnVuY3Rpb24oZSl7aWYoIW8pe3RoaXMuX21vdXNlTW92ZWQ9ITEsdGhpcy5fbW91c2VTdGFydGVkJiZ0aGlzLl9tb3VzZVVwKGUpLHRoaXMuX21vdXNlRG93bkV2ZW50PWU7dmFyIGk9dGhpcyxzPTE9PT1lLndoaWNoLG49XCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5jYW5jZWwmJmUudGFyZ2V0Lm5vZGVOYW1lP3QoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLmNhbmNlbCkubGVuZ3RoOiExO3JldHVybiBzJiYhbiYmdGhpcy5fbW91c2VDYXB0dXJlKGUpPyh0aGlzLm1vdXNlRGVsYXlNZXQ9IXRoaXMub3B0aW9ucy5kZWxheSx0aGlzLm1vdXNlRGVsYXlNZXR8fCh0aGlzLl9tb3VzZURlbGF5VGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe2kubW91c2VEZWxheU1ldD0hMH0sdGhpcy5vcHRpb25zLmRlbGF5KSksdGhpcy5fbW91c2VEaXN0YW5jZU1ldChlKSYmdGhpcy5fbW91c2VEZWxheU1ldChlKSYmKHRoaXMuX21vdXNlU3RhcnRlZD10aGlzLl9tb3VzZVN0YXJ0KGUpIT09ITEsIXRoaXMuX21vdXNlU3RhcnRlZCk/KGUucHJldmVudERlZmF1bHQoKSwhMCk6KCEwPT09dC5kYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSYmdC5yZW1vdmVEYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5fbW91c2VNb3ZlKHQpfSx0aGlzLl9tb3VzZVVwRGVsZWdhdGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuX21vdXNlVXAodCl9LHRoaXMuZG9jdW1lbnQuYmluZChcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLmJpbmQoXCJtb3VzZXVwLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZVVwRGVsZWdhdGUpLGUucHJldmVudERlZmF1bHQoKSxvPSEwLCEwKSk6ITB9fSxfbW91c2VNb3ZlOmZ1bmN0aW9uKGUpe2lmKHRoaXMuX21vdXNlTW92ZWQpe2lmKHQudWkuaWUmJighZG9jdW1lbnQuZG9jdW1lbnRNb2RlfHw5PmRvY3VtZW50LmRvY3VtZW50TW9kZSkmJiFlLmJ1dHRvbilyZXR1cm4gdGhpcy5fbW91c2VVcChlKTtpZighZS53aGljaClyZXR1cm4gdGhpcy5fbW91c2VVcChlKX1yZXR1cm4oZS53aGljaHx8ZS5idXR0b24pJiYodGhpcy5fbW91c2VNb3ZlZD0hMCksdGhpcy5fbW91c2VTdGFydGVkPyh0aGlzLl9tb3VzZURyYWcoZSksZS5wcmV2ZW50RGVmYXVsdCgpKToodGhpcy5fbW91c2VEaXN0YW5jZU1ldChlKSYmdGhpcy5fbW91c2VEZWxheU1ldChlKSYmKHRoaXMuX21vdXNlU3RhcnRlZD10aGlzLl9tb3VzZVN0YXJ0KHRoaXMuX21vdXNlRG93bkV2ZW50LGUpIT09ITEsdGhpcy5fbW91c2VTdGFydGVkP3RoaXMuX21vdXNlRHJhZyhlKTp0aGlzLl9tb3VzZVVwKGUpKSwhdGhpcy5fbW91c2VTdGFydGVkKX0sX21vdXNlVXA6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZG9jdW1lbnQudW5iaW5kKFwibW91c2Vtb3ZlLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSkudW5iaW5kKFwibW91c2V1cC5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VVcERlbGVnYXRlKSx0aGlzLl9tb3VzZVN0YXJ0ZWQmJih0aGlzLl9tb3VzZVN0YXJ0ZWQ9ITEsZS50YXJnZXQ9PT10aGlzLl9tb3VzZURvd25FdmVudC50YXJnZXQmJnQuZGF0YShlLnRhcmdldCx0aGlzLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiwhMCksdGhpcy5fbW91c2VTdG9wKGUpKSxvPSExLCExfSxfbW91c2VEaXN0YW5jZU1ldDpmdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5tYXgoTWF0aC5hYnModGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVgtdC5wYWdlWCksTWF0aC5hYnModGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVktdC5wYWdlWSkpPj10aGlzLm9wdGlvbnMuZGlzdGFuY2V9LF9tb3VzZURlbGF5TWV0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW91c2VEZWxheU1ldH0sX21vdXNlU3RhcnQ6ZnVuY3Rpb24oKXt9LF9tb3VzZURyYWc6ZnVuY3Rpb24oKXt9LF9tb3VzZVN0b3A6ZnVuY3Rpb24oKXt9LF9tb3VzZUNhcHR1cmU6ZnVuY3Rpb24oKXtyZXR1cm4hMH19KSx0LndpZGdldChcInVpLnNsaWRlclwiLHQudWkubW91c2Use3ZlcnNpb246XCIxLjExLjRcIix3aWRnZXRFdmVudFByZWZpeDpcInNsaWRlXCIsb3B0aW9uczp7YW5pbWF0ZTohMSxkaXN0YW5jZTowLG1heDoxMDAsbWluOjAsb3JpZW50YXRpb246XCJob3Jpem9udGFsXCIscmFuZ2U6ITEsc3RlcDoxLHZhbHVlOjAsdmFsdWVzOm51bGwsY2hhbmdlOm51bGwsc2xpZGU6bnVsbCxzdGFydDpudWxsLHN0b3A6bnVsbH0sbnVtUGFnZXM6NSxfY3JlYXRlOmZ1bmN0aW9uKCl7dGhpcy5fa2V5U2xpZGluZz0hMSx0aGlzLl9tb3VzZVNsaWRpbmc9ITEsdGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9oYW5kbGVJbmRleD1udWxsLHRoaXMuX2RldGVjdE9yaWVudGF0aW9uKCksdGhpcy5fbW91c2VJbml0KCksdGhpcy5fY2FsY3VsYXRlTmV3TWF4KCksdGhpcy5lbGVtZW50LmFkZENsYXNzKFwidWktc2xpZGVyIHVpLXNsaWRlci1cIit0aGlzLm9yaWVudGF0aW9uK1wiIHVpLXdpZGdldFwiK1wiIHVpLXdpZGdldC1jb250ZW50XCIrXCIgdWktY29ybmVyLWFsbFwiKSx0aGlzLl9yZWZyZXNoKCksdGhpcy5fc2V0T3B0aW9uKFwiZGlzYWJsZWRcIix0aGlzLm9wdGlvbnMuZGlzYWJsZWQpLHRoaXMuX2FuaW1hdGVPZmY9ITF9LF9yZWZyZXNoOmZ1bmN0aW9uKCl7dGhpcy5fY3JlYXRlUmFuZ2UoKSx0aGlzLl9jcmVhdGVIYW5kbGVzKCksdGhpcy5fc2V0dXBFdmVudHMoKSx0aGlzLl9yZWZyZXNoVmFsdWUoKX0sX2NyZWF0ZUhhbmRsZXM6ZnVuY3Rpb24oKXt2YXIgZSxpLHM9dGhpcy5vcHRpb25zLG49dGhpcy5lbGVtZW50LmZpbmQoXCIudWktc2xpZGVyLWhhbmRsZVwiKS5hZGRDbGFzcyhcInVpLXN0YXRlLWRlZmF1bHQgdWktY29ybmVyLWFsbFwiKSxvPVwiPHNwYW4gY2xhc3M9J3VpLXNsaWRlci1oYW5kbGUgdWktc3RhdGUtZGVmYXVsdCB1aS1jb3JuZXItYWxsJyB0YWJpbmRleD0nMCc+PC9zcGFuPlwiLGE9W107Zm9yKGk9cy52YWx1ZXMmJnMudmFsdWVzLmxlbmd0aHx8MSxuLmxlbmd0aD5pJiYobi5zbGljZShpKS5yZW1vdmUoKSxuPW4uc2xpY2UoMCxpKSksZT1uLmxlbmd0aDtpPmU7ZSsrKWEucHVzaChvKTt0aGlzLmhhbmRsZXM9bi5hZGQodChhLmpvaW4oXCJcIikpLmFwcGVuZFRvKHRoaXMuZWxlbWVudCkpLHRoaXMuaGFuZGxlPXRoaXMuaGFuZGxlcy5lcSgwKSx0aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihlKXt0KHRoaXMpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIsZSl9KX0sX2NyZWF0ZVJhbmdlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5vcHRpb25zLGk9XCJcIjtlLnJhbmdlPyhlLnJhbmdlPT09ITAmJihlLnZhbHVlcz9lLnZhbHVlcy5sZW5ndGgmJjIhPT1lLnZhbHVlcy5sZW5ndGg/ZS52YWx1ZXM9W2UudmFsdWVzWzBdLGUudmFsdWVzWzBdXTp0LmlzQXJyYXkoZS52YWx1ZXMpJiYoZS52YWx1ZXM9ZS52YWx1ZXMuc2xpY2UoMCkpOmUudmFsdWVzPVt0aGlzLl92YWx1ZU1pbigpLHRoaXMuX3ZhbHVlTWluKCldKSx0aGlzLnJhbmdlJiZ0aGlzLnJhbmdlLmxlbmd0aD90aGlzLnJhbmdlLnJlbW92ZUNsYXNzKFwidWktc2xpZGVyLXJhbmdlLW1pbiB1aS1zbGlkZXItcmFuZ2UtbWF4XCIpLmNzcyh7bGVmdDpcIlwiLGJvdHRvbTpcIlwifSk6KHRoaXMucmFuZ2U9dChcIjxkaXY+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuZWxlbWVudCksaT1cInVpLXNsaWRlci1yYW5nZSB1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci1hbGxcIiksdGhpcy5yYW5nZS5hZGRDbGFzcyhpKyhcIm1pblwiPT09ZS5yYW5nZXx8XCJtYXhcIj09PWUucmFuZ2U/XCIgdWktc2xpZGVyLXJhbmdlLVwiK2UucmFuZ2U6XCJcIikpKToodGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLnJhbmdlPW51bGwpfSxfc2V0dXBFdmVudHM6ZnVuY3Rpb24oKXt0aGlzLl9vZmYodGhpcy5oYW5kbGVzKSx0aGlzLl9vbih0aGlzLmhhbmRsZXMsdGhpcy5faGFuZGxlRXZlbnRzKSx0aGlzLl9ob3ZlcmFibGUodGhpcy5oYW5kbGVzKSx0aGlzLl9mb2N1c2FibGUodGhpcy5oYW5kbGVzKX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhhbmRsZXMucmVtb3ZlKCksdGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJ1aS1zbGlkZXIgdWktc2xpZGVyLWhvcml6b250YWwgdWktc2xpZGVyLXZlcnRpY2FsIHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1jb3JuZXItYWxsXCIpLHRoaXMuX21vdXNlRGVzdHJveSgpfSxfbW91c2VDYXB0dXJlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGEscixsLGgsYz10aGlzLHU9dGhpcy5vcHRpb25zO3JldHVybiB1LmRpc2FibGVkPyExOih0aGlzLmVsZW1lbnRTaXplPXt3aWR0aDp0aGlzLmVsZW1lbnQub3V0ZXJXaWR0aCgpLGhlaWdodDp0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKX0sdGhpcy5lbGVtZW50T2Zmc2V0PXRoaXMuZWxlbWVudC5vZmZzZXQoKSxpPXt4OmUucGFnZVgseTplLnBhZ2VZfSxzPXRoaXMuX25vcm1WYWx1ZUZyb21Nb3VzZShpKSxuPXRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSsxLHRoaXMuaGFuZGxlcy5lYWNoKGZ1bmN0aW9uKGUpe3ZhciBpPU1hdGguYWJzKHMtYy52YWx1ZXMoZSkpOyhuPml8fG49PT1pJiYoZT09PWMuX2xhc3RDaGFuZ2VkVmFsdWV8fGMudmFsdWVzKGUpPT09dS5taW4pKSYmKG49aSxvPXQodGhpcyksYT1lKX0pLHI9dGhpcy5fc3RhcnQoZSxhKSxyPT09ITE/ITE6KHRoaXMuX21vdXNlU2xpZGluZz0hMCx0aGlzLl9oYW5kbGVJbmRleD1hLG8uYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1hY3RpdmVcIikuZm9jdXMoKSxsPW8ub2Zmc2V0KCksaD0hdChlLnRhcmdldCkucGFyZW50cygpLmFkZEJhY2soKS5pcyhcIi51aS1zbGlkZXItaGFuZGxlXCIpLHRoaXMuX2NsaWNrT2Zmc2V0PWg/e2xlZnQ6MCx0b3A6MH06e2xlZnQ6ZS5wYWdlWC1sLmxlZnQtby53aWR0aCgpLzIsdG9wOmUucGFnZVktbC50b3Atby5oZWlnaHQoKS8yLShwYXJzZUludChvLmNzcyhcImJvcmRlclRvcFdpZHRoXCIpLDEwKXx8MCktKHBhcnNlSW50KG8uY3NzKFwiYm9yZGVyQm90dG9tV2lkdGhcIiksMTApfHwwKSsocGFyc2VJbnQoby5jc3MoXCJtYXJnaW5Ub3BcIiksMTApfHwwKX0sdGhpcy5oYW5kbGVzLmhhc0NsYXNzKFwidWktc3RhdGUtaG92ZXJcIil8fHRoaXMuX3NsaWRlKGUsYSxzKSx0aGlzLl9hbmltYXRlT2ZmPSEwLCEwKSl9LF9tb3VzZVN0YXJ0OmZ1bmN0aW9uKCl7cmV0dXJuITB9LF9tb3VzZURyYWc6ZnVuY3Rpb24odCl7dmFyIGU9e3g6dC5wYWdlWCx5OnQucGFnZVl9LGk9dGhpcy5fbm9ybVZhbHVlRnJvbU1vdXNlKGUpO3JldHVybiB0aGlzLl9zbGlkZSh0LHRoaXMuX2hhbmRsZUluZGV4LGkpLCExfSxfbW91c2VTdG9wOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmhhbmRsZXMucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5fbW91c2VTbGlkaW5nPSExLHRoaXMuX3N0b3AodCx0aGlzLl9oYW5kbGVJbmRleCksdGhpcy5fY2hhbmdlKHQsdGhpcy5faGFuZGxlSW5kZXgpLHRoaXMuX2hhbmRsZUluZGV4PW51bGwsdGhpcy5fY2xpY2tPZmZzZXQ9bnVsbCx0aGlzLl9hbmltYXRlT2ZmPSExLCExfSxfZGV0ZWN0T3JpZW50YXRpb246ZnVuY3Rpb24oKXt0aGlzLm9yaWVudGF0aW9uPVwidmVydGljYWxcIj09PXRoaXMub3B0aW9ucy5vcmllbnRhdGlvbj9cInZlcnRpY2FsXCI6XCJob3Jpem9udGFsXCJ9LF9ub3JtVmFsdWVGcm9tTW91c2U6ZnVuY3Rpb24odCl7dmFyIGUsaSxzLG4sbztyZXR1cm5cImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24/KGU9dGhpcy5lbGVtZW50U2l6ZS53aWR0aCxpPXQueC10aGlzLmVsZW1lbnRPZmZzZXQubGVmdC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQubGVmdDowKSk6KGU9dGhpcy5lbGVtZW50U2l6ZS5oZWlnaHQsaT10LnktdGhpcy5lbGVtZW50T2Zmc2V0LnRvcC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQudG9wOjApKSxzPWkvZSxzPjEmJihzPTEpLDA+cyYmKHM9MCksXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmKHM9MS1zKSxuPXRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSxvPXRoaXMuX3ZhbHVlTWluKCkrcypuLHRoaXMuX3RyaW1BbGlnblZhbHVlKG8pfSxfc3RhcnQ6ZnVuY3Rpb24odCxlKXt2YXIgaT17aGFuZGxlOnRoaXMuaGFuZGxlc1tlXSx2YWx1ZTp0aGlzLnZhbHVlKCl9O3JldHVybiB0aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCYmKGkudmFsdWU9dGhpcy52YWx1ZXMoZSksaS52YWx1ZXM9dGhpcy52YWx1ZXMoKSksdGhpcy5fdHJpZ2dlcihcInN0YXJ0XCIsdCxpKX0sX3NsaWRlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcyxuLG87dGhpcy5vcHRpb25zLnZhbHVlcyYmdGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGg/KHM9dGhpcy52YWx1ZXMoZT8wOjEpLDI9PT10aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCYmdGhpcy5vcHRpb25zLnJhbmdlPT09ITAmJigwPT09ZSYmaT5zfHwxPT09ZSYmcz5pKSYmKGk9cyksaSE9PXRoaXMudmFsdWVzKGUpJiYobj10aGlzLnZhbHVlcygpLG5bZV09aSxvPXRoaXMuX3RyaWdnZXIoXCJzbGlkZVwiLHQse2hhbmRsZTp0aGlzLmhhbmRsZXNbZV0sdmFsdWU6aSx2YWx1ZXM6bn0pLHM9dGhpcy52YWx1ZXMoZT8wOjEpLG8hPT0hMSYmdGhpcy52YWx1ZXMoZSxpKSkpOmkhPT10aGlzLnZhbHVlKCkmJihvPXRoaXMuX3RyaWdnZXIoXCJzbGlkZVwiLHQse2hhbmRsZTp0aGlzLmhhbmRsZXNbZV0sdmFsdWU6aX0pLG8hPT0hMSYmdGhpcy52YWx1ZShpKSl9LF9zdG9wOmZ1bmN0aW9uKHQsZSl7dmFyIGk9e2hhbmRsZTp0aGlzLmhhbmRsZXNbZV0sdmFsdWU6dGhpcy52YWx1ZSgpfTt0aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCYmKGkudmFsdWU9dGhpcy52YWx1ZXMoZSksaS52YWx1ZXM9dGhpcy52YWx1ZXMoKSksdGhpcy5fdHJpZ2dlcihcInN0b3BcIix0LGkpfSxfY2hhbmdlOmZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuX2tleVNsaWRpbmcmJiF0aGlzLl9tb3VzZVNsaWRpbmcpe3ZhciBpPXtoYW5kbGU6dGhpcy5oYW5kbGVzW2VdLHZhbHVlOnRoaXMudmFsdWUoKX07dGhpcy5vcHRpb25zLnZhbHVlcyYmdGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgmJihpLnZhbHVlPXRoaXMudmFsdWVzKGUpLGkudmFsdWVzPXRoaXMudmFsdWVzKCkpLHRoaXMuX2xhc3RDaGFuZ2VkVmFsdWU9ZSx0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsdCxpKX19LHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiBhcmd1bWVudHMubGVuZ3RoPyh0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdHJpbUFsaWduVmFsdWUodCksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fY2hhbmdlKG51bGwsMCksdm9pZCAwKTp0aGlzLl92YWx1ZSgpfSx2YWx1ZXM6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG87aWYoYXJndW1lbnRzLmxlbmd0aD4xKXJldHVybiB0aGlzLm9wdGlvbnMudmFsdWVzW2VdPXRoaXMuX3RyaW1BbGlnblZhbHVlKGkpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2NoYW5nZShudWxsLGUpLHZvaWQgMDtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fdmFsdWVzKCk7aWYoIXQuaXNBcnJheShhcmd1bWVudHNbMF0pKXJldHVybiB0aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aD90aGlzLl92YWx1ZXMoZSk6dGhpcy52YWx1ZSgpO2ZvcihzPXRoaXMub3B0aW9ucy52YWx1ZXMsbj1hcmd1bWVudHNbMF0sbz0wO3MubGVuZ3RoPm87bys9MSlzW29dPXRoaXMuX3RyaW1BbGlnblZhbHVlKG5bb10pLHRoaXMuX2NoYW5nZShudWxsLG8pO3RoaXMuX3JlZnJlc2hWYWx1ZSgpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbj0wO3N3aXRjaChcInJhbmdlXCI9PT1lJiZ0aGlzLm9wdGlvbnMucmFuZ2U9PT0hMCYmKFwibWluXCI9PT1pPyh0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKDApLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCk6XCJtYXhcIj09PWkmJih0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKHRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoLTEpLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCkpLHQuaXNBcnJheSh0aGlzLm9wdGlvbnMudmFsdWVzKSYmKG49dGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgpLFwiZGlzYWJsZWRcIj09PWUmJnRoaXMuZWxlbWVudC50b2dnbGVDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIsISFpKSx0aGlzLl9zdXBlcihlLGkpLGUpe2Nhc2VcIm9yaWVudGF0aW9uXCI6dGhpcy5fZGV0ZWN0T3JpZW50YXRpb24oKSx0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJ1aS1zbGlkZXItaG9yaXpvbnRhbCB1aS1zbGlkZXItdmVydGljYWxcIikuYWRkQ2xhc3MoXCJ1aS1zbGlkZXItXCIrdGhpcy5vcmllbnRhdGlvbiksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5oYW5kbGVzLmNzcyhcImhvcml6b250YWxcIj09PWk/XCJib3R0b21cIjpcImxlZnRcIixcIlwiKTticmVhaztjYXNlXCJ2YWx1ZVwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fY2hhbmdlKG51bGwsMCksdGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJ2YWx1ZXNcIjpmb3IodGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoVmFsdWUoKSxzPTA7bj5zO3MrPTEpdGhpcy5fY2hhbmdlKG51bGwscyk7dGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJzdGVwXCI6Y2FzZVwibWluXCI6Y2FzZVwibWF4XCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9jYWxjdWxhdGVOZXdNYXgoKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9hbmltYXRlT2ZmPSExO2JyZWFrO2Nhc2VcInJhbmdlXCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoKCksdGhpcy5fYW5pbWF0ZU9mZj0hMX19LF92YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy52YWx1ZTtyZXR1cm4gdD10aGlzLl90cmltQWxpZ25WYWx1ZSh0KX0sX3ZhbHVlczpmdW5jdGlvbih0KXt2YXIgZSxpLHM7aWYoYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gZT10aGlzLm9wdGlvbnMudmFsdWVzW3RdLGU9dGhpcy5fdHJpbUFsaWduVmFsdWUoZSk7aWYodGhpcy5vcHRpb25zLnZhbHVlcyYmdGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgpe2ZvcihpPXRoaXMub3B0aW9ucy52YWx1ZXMuc2xpY2UoKSxzPTA7aS5sZW5ndGg+cztzKz0xKWlbc109dGhpcy5fdHJpbUFsaWduVmFsdWUoaVtzXSk7cmV0dXJuIGl9cmV0dXJuW119LF90cmltQWxpZ25WYWx1ZTpmdW5jdGlvbih0KXtpZih0aGlzLl92YWx1ZU1pbigpPj10KXJldHVybiB0aGlzLl92YWx1ZU1pbigpO2lmKHQ+PXRoaXMuX3ZhbHVlTWF4KCkpcmV0dXJuIHRoaXMuX3ZhbHVlTWF4KCk7dmFyIGU9dGhpcy5vcHRpb25zLnN0ZXA+MD90aGlzLm9wdGlvbnMuc3RlcDoxLGk9KHQtdGhpcy5fdmFsdWVNaW4oKSklZSxzPXQtaTtyZXR1cm4gMipNYXRoLmFicyhpKT49ZSYmKHMrPWk+MD9lOi1lKSxwYXJzZUZsb2F0KHMudG9GaXhlZCg1KSl9LF9jYWxjdWxhdGVOZXdNYXg6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubWF4LGU9dGhpcy5fdmFsdWVNaW4oKSxpPXRoaXMub3B0aW9ucy5zdGVwLHM9TWF0aC5mbG9vcigrKHQtZSkudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24oKSkvaSkqaTt0PXMrZSx0aGlzLm1heD1wYXJzZUZsb2F0KHQudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24oKSkpfSxfcHJlY2lzaW9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fcHJlY2lzaW9uT2YodGhpcy5vcHRpb25zLnN0ZXApO3JldHVybiBudWxsIT09dGhpcy5vcHRpb25zLm1pbiYmKHQ9TWF0aC5tYXgodCx0aGlzLl9wcmVjaXNpb25PZih0aGlzLm9wdGlvbnMubWluKSkpLHR9LF9wcmVjaXNpb25PZjpmdW5jdGlvbih0KXt2YXIgZT1cIlwiK3QsaT1lLmluZGV4T2YoXCIuXCIpO3JldHVybi0xPT09aT8wOmUubGVuZ3RoLWktMX0sX3ZhbHVlTWluOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9ucy5taW59LF92YWx1ZU1heDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1heH0sX3JlZnJlc2hWYWx1ZTpmdW5jdGlvbigpe3ZhciBlLGkscyxuLG8sYT10aGlzLm9wdGlvbnMucmFuZ2Uscj10aGlzLm9wdGlvbnMsbD10aGlzLGg9dGhpcy5fYW5pbWF0ZU9mZj8hMTpyLmFuaW1hdGUsYz17fTt0aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aD90aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihzKXtpPTEwMCooKGwudmFsdWVzKHMpLWwuX3ZhbHVlTWluKCkpLyhsLl92YWx1ZU1heCgpLWwuX3ZhbHVlTWluKCkpKSxjW1wiaG9yaXpvbnRhbFwiPT09bC5vcmllbnRhdGlvbj9cImxlZnRcIjpcImJvdHRvbVwiXT1pK1wiJVwiLHQodGhpcykuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oYyxyLmFuaW1hdGUpLGwub3B0aW9ucy5yYW5nZT09PSEwJiYoXCJob3Jpem9udGFsXCI9PT1sLm9yaWVudGF0aW9uPygwPT09cyYmbC5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7bGVmdDppK1wiJVwifSxyLmFuaW1hdGUpLDE9PT1zJiZsLnJhbmdlW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe3dpZHRoOmktZStcIiVcIn0se3F1ZXVlOiExLGR1cmF0aW9uOnIuYW5pbWF0ZX0pKTooMD09PXMmJmwucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2JvdHRvbTppK1wiJVwifSxyLmFuaW1hdGUpLDE9PT1zJiZsLnJhbmdlW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2hlaWdodDppLWUrXCIlXCJ9LHtxdWV1ZTohMSxkdXJhdGlvbjpyLmFuaW1hdGV9KSkpLGU9aX0pOihzPXRoaXMudmFsdWUoKSxuPXRoaXMuX3ZhbHVlTWluKCksbz10aGlzLl92YWx1ZU1heCgpLGk9byE9PW4/MTAwKigocy1uKS8oby1uKSk6MCxjW1wiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbj9cImxlZnRcIjpcImJvdHRvbVwiXT1pK1wiJVwiLHRoaXMuaGFuZGxlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKGMsci5hbmltYXRlKSxcIm1pblwiPT09YSYmXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDppK1wiJVwifSxyLmFuaW1hdGUpLFwibWF4XCI9PT1hJiZcImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2VbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7d2lkdGg6MTAwLWkrXCIlXCJ9LHtxdWV1ZTohMSxkdXJhdGlvbjpyLmFuaW1hdGV9KSxcIm1pblwiPT09YSYmXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OmkrXCIlXCJ9LHIuYW5pbWF0ZSksXCJtYXhcIj09PWEmJlwidmVydGljYWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2VbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OjEwMC1pK1wiJVwifSx7cXVldWU6ITEsZHVyYXRpb246ci5hbmltYXRlfSkpfSxfaGFuZGxlRXZlbnRzOntrZXlkb3duOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGE9dChlLnRhcmdldCkuZGF0YShcInVpLXNsaWRlci1oYW5kbGUtaW5kZXhcIik7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTpjYXNlIHQudWkua2V5Q29kZS5FTkQ6Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9VUDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046Y2FzZSB0LnVpLmtleUNvZGUuVVA6Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjpjYXNlIHQudWkua2V5Q29kZS5MRUZUOmlmKGUucHJldmVudERlZmF1bHQoKSwhdGhpcy5fa2V5U2xpZGluZyYmKHRoaXMuX2tleVNsaWRpbmc9ITAsdChlLnRhcmdldCkuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1hY3RpdmVcIiksaT10aGlzLl9zdGFydChlLGEpLGk9PT0hMSkpcmV0dXJufXN3aXRjaChvPXRoaXMub3B0aW9ucy5zdGVwLHM9bj10aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aD90aGlzLnZhbHVlcyhhKTp0aGlzLnZhbHVlKCksZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5IT01FOm49dGhpcy5fdmFsdWVNaW4oKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTkQ6bj10aGlzLl92YWx1ZU1heCgpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6bj10aGlzLl90cmltQWxpZ25WYWx1ZShzKyh0aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkpL3RoaXMubnVtUGFnZXMpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjpuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMtKHRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSkvdGhpcy5udW1QYWdlcyk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6aWYocz09PXRoaXMuX3ZhbHVlTWF4KCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocytvKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOmNhc2UgdC51aS5rZXlDb2RlLkxFRlQ6aWYocz09PXRoaXMuX3ZhbHVlTWluKCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocy1vKX10aGlzLl9zbGlkZShlLGEsbil9LGtleXVwOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZS50YXJnZXQpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIpO3RoaXMuX2tleVNsaWRpbmcmJih0aGlzLl9rZXlTbGlkaW5nPSExLHRoaXMuX3N0b3AoZSxpKSx0aGlzLl9jaGFuZ2UoZSxpKSx0KGUudGFyZ2V0KS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWFjdGl2ZVwiKSl9fX0pfSk7XG5cbi8qIVxuICogalF1ZXJ5IFVJIFRvdWNoIFB1bmNoIDAuMi4zXG4gKlxuICogQ29weXJpZ2h0IDIwMTHigJMyMDE0LCBEYXZlIEZ1cmZlcm9cbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxuICpcbiAqIERlcGVuZHM6XG4gKiAganF1ZXJ5LnVpLndpZGdldC5qc1xuICogIGpxdWVyeS51aS5tb3VzZS5qc1xuICovXG4hZnVuY3Rpb24oYSl7ZnVuY3Rpb24gZihhLGIpe2lmKCEoYS5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoPjEpKXthLnByZXZlbnREZWZhdWx0KCk7dmFyIGM9YS5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLGQ9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50c1wiKTtkLmluaXRNb3VzZUV2ZW50KGIsITAsITAsd2luZG93LDEsYy5zY3JlZW5YLGMuc2NyZWVuWSxjLmNsaWVudFgsYy5jbGllbnRZLCExLCExLCExLCExLDAsbnVsbCksYS50YXJnZXQuZGlzcGF0Y2hFdmVudChkKX19aWYoYS5zdXBwb3J0LnRvdWNoPVwib250b3VjaGVuZFwiaW4gZG9jdW1lbnQsYS5zdXBwb3J0LnRvdWNoKXt2YXIgZSxiPWEudWkubW91c2UucHJvdG90eXBlLGM9Yi5fbW91c2VJbml0LGQ9Yi5fbW91c2VEZXN0cm95O2IuX3RvdWNoU3RhcnQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpczshZSYmYi5fbW91c2VDYXB0dXJlKGEub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkmJihlPSEwLGIuX3RvdWNoTW92ZWQ9ITEsZihhLFwibW91c2VvdmVyXCIpLGYoYSxcIm1vdXNlbW92ZVwiKSxmKGEsXCJtb3VzZWRvd25cIikpfSxiLl90b3VjaE1vdmU9ZnVuY3Rpb24oYSl7ZSYmKHRoaXMuX3RvdWNoTW92ZWQ9ITAsZihhLFwibW91c2Vtb3ZlXCIpKX0sYi5fdG91Y2hFbmQ9ZnVuY3Rpb24oYSl7ZSYmKGYoYSxcIm1vdXNldXBcIiksZihhLFwibW91c2VvdXRcIiksdGhpcy5fdG91Y2hNb3ZlZHx8ZihhLFwiY2xpY2tcIiksZT0hMSl9LGIuX21vdXNlSW5pdD1mdW5jdGlvbigpe3ZhciBiPXRoaXM7Yi5lbGVtZW50LmJpbmQoe3RvdWNoc3RhcnQ6YS5wcm94eShiLFwiX3RvdWNoU3RhcnRcIiksdG91Y2htb3ZlOmEucHJveHkoYixcIl90b3VjaE1vdmVcIiksdG91Y2hlbmQ6YS5wcm94eShiLFwiX3RvdWNoRW5kXCIpfSksYy5jYWxsKGIpfSxiLl9tb3VzZURlc3Ryb3k9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2IuZWxlbWVudC51bmJpbmQoe3RvdWNoc3RhcnQ6YS5wcm94eShiLFwiX3RvdWNoU3RhcnRcIiksdG91Y2htb3ZlOmEucHJveHkoYixcIl90b3VjaE1vdmVcIiksdG91Y2hlbmQ6YS5wcm94eShiLFwiX3RvdWNoRW5kXCIpfSksZC5jYWxsKGIpfX19KGpRdWVyeSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgJChcIipbZGF0YS1saW5rKj0nanMtc25hY2tiYXInXVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgc2hvd1NuYWNrYmFyKCQodGhpcykuZGF0YSgnbGluaycpKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2hvd1NuYWNrYmFyKHNuYWtiYXJfaWQpIHtcbiAgICB2YXIgc25hY2tiYXIgPSAkKCcjJyArIHNuYWtiYXJfaWQpO1xuICAgIHZhciB0aW1lb3V0ID0gc25hY2tiYXIuZGF0YSgndGltZW91dCcpIHx8IDMwMDA7XG5cbiAgICBzbmFja2Jhci5hZGRDbGFzcygnc25hY2tiYXJfb3BlbicpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNuYWNrYmFyLnJlbW92ZUNsYXNzKCdzbmFja2Jhcl9vcGVuJyk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG59KTsiLCJ2YXIgc3dpdGNoVGFicyA9IGZ1bmN0aW9uKGVsKXtcbiAgZWwgPSAnIycrIGVsO1xuICAkKGVsKS5wYXJlbnQoKS5maW5kKCcudGFiX19pdGVtX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCd0YWJfX2l0ZW1fYWN0aXZlJyk7XG4gICQoZWwpLmFkZENsYXNzKCd0YWJfX2l0ZW1fYWN0aXZlJyk7XG59IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgJCgnLmhlYWRlcl9fbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcucGFnZScpLmFkZENsYXNzKCdoaWRkZW4nKTsgXG4gICAgJCgnLnJpZ2h0LXNpZGViYXInKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICQoJy5ob2xkZXInKS5hZGRDbGFzcygnbWVudS1vcGVuJyk7XG4gICAgJCgnI292ZXJsYXknKS5mYWRlSW4oMTAwKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgMjAwKTtcbiAgfSk7XG5cbiAgJCgnI292ZXJsYXknKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLnBhZ2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7IFxuICAgICQoJy5yaWdodC1zaWRlYmFyJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAkKCcuaG9sZGVyJykucmVtb3ZlQ2xhc3MoJ21lbnUtb3BlbicpO1xuICAgICQoJyNvdmVybGF5JykuZmFkZU91dCgxMDApLmNzcygnZGlzcGxheScsICdub25lJykuYW5pbWF0ZSh7b3BhY2l0eTogMH0sIDIwMCk7XG4gIH0pO1xuXG59KTsiXX0=
