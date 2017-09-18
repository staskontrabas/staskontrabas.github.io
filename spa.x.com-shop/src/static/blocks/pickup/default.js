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