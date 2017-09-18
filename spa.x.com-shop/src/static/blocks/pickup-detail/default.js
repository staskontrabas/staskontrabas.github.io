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