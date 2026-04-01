function loadMap() {
    var geojson = JSON.parse(jQuery('.contactmap-features').html());
    var centerPoint = JSON.parse(jQuery('.contactmap-centerPoint').html());
    var responsive_width = jQuery(window).width();
    var dragPan, mobile, center, zoom, bearing;

    if (responsive_width >= 1030) {
        dragPan = true;
        mobile = false;
        center = [centerPoint[0] + 0.015, centerPoint[1]];
        zoom = 12;
        bearing = -47.6;
    } else {
        center = [centerPoint[0], centerPoint[1] + 0.0015];
        dragPan = false;
        zoom = 15;
        bearing = 0,
            mobile = true;
    }

    if (typeof centerPoint !== 'undefined' && jQuery(".map")[0]) {
        mapboxgl.accessToken = 'pk.eyJ1IjoidXR6ZWwiLCJhIjoiY2lua2tuYWJtMDA4NnZ4bHlxeGxjYTFtNyJ9.Z5KECZq7JWm4TZp7ZIAb6w';
        var map = new mapboxgl.Map({
            style: 'mapbox://styles/mapbox/light-v9',
            center: center,
            zoom: zoom,
            pitch: 45,
            bearing: bearing,
            container: 'map',
            scrollZoom: false,
            dragPan: dragPan,
            boxZoom: false,
            doubleClickZoom: false
        });

        // add markers to map
        geojson.features.forEach(function(marker) {
            // create a DOM element for the marker
            var el = document.createElement('div');
            el.className = 'marker';

            // create the popup
            var popup = new mapboxgl.Popup({ closeButton: false, offset: 35 })
                .setHTML(marker.properties.message);

            // add marker to map
            var markerEl = new mapboxgl.Marker(el, { offset: [-marker.properties.iconSize[0] / 1.6, -marker.properties.iconSize[1] / 2] })
                .setLngLat(marker.geometry.coordinates)
                .setPopup(popup)
                .addTo(map);


            // Hover marker
            jQuery(".marker")
                .mouseenter(function() {
                    console.log("Marker hover", marker);
                    markerEl.togglePopup();
                })
                .mouseleave(function() {
                    console.log("Marker hover oa", marker);
                    markerEl.togglePopup();
                });
        });



        // Into Animation

        /* if is above or equal to 1010px */
        if (mobile === false) {

            map.flyTo({
                center: [centerPoint[0], centerPoint[1] + 0.001],
                zoom: 15,
                bearing: 0,
                speed: 0.6, // make the flying slow
                curve: 1, // change the speed at which it zooms out

                // This can be any easing function: it takes a number between
                // 0 and 1 and returns another number between 0 and 1.
                easing: function(t) {
                    return t * (2 - t);
                }
            });
        }

        // disable map zoom when using scroll
        map.scrollZoom.disable();
        map.touchZoomRotate.disable();

        // Scrolldown Animation
        /*var scrollPos = 0;
        var scrollPos = '';
        jQuery(window).scroll(function() {
            var height = jQuery(window).scrollTop();
            if (height > 30 && scrollPos == 'bottom') {
              scrollPos = '';
              map.flyTo({
                    bearing: 20,
                    center: [centerPoint[0], centerPoint[1]],
                    zoom: 15,
                    speed: 0.8, // make the flying slow
                  curve: 1, 
                });
            }
            else if (height < 30 && scrollPos == '') {
              scrollPos = 'bottom';
              map.flyTo({
                    bearing: 10,
                    center: [centerPoint[0], centerPoint[1]],
                    zoom: 15,
                    speed: 0.8, // make the flying slow
                    curve: 1, 
                });
            }

        });*/
    }
}

//jQuery(document).ready(function( $ ) {
loadMap();
//});