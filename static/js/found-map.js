/*setting up a map*/
"use strict";

var map;

function initMap() {

    // console.dir(userLocation);

    let mapCenter = { lat: 37.73, lng: -122.453526 };

    //try to use geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.dir(pos);

        const userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
                url: '/static/user-location.svg',
                scaledSize: new google.maps.Size(30, 30)
            }
        });

        map.setCenter(pos);
      }, function() {
        handleLocationError(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false);
    }

    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 11
    });

    const infoWindow = new google.maps.InfoWindow();

    // //AJAX call to get list of founds
    $.get('/api/found', (founds) => {
        for(let found of founds) {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(found.lat, found.lng),
                map: map,
                title: found.title,
                icon: {
                    url: '/static/img/found-marker.svg',
                    scaledSize: new google.maps.Size(30, 30)
                }
                });

                // Define the content of the infoWindow
                const html = `<div class="window-content">
                <h3>
                    <a href="found/${found.id}">
                        ${found.title}
                    </a>
                </h3>
                <ul class="found-info">
                  <li><b>Description: </b>${found.description}</li>
                  <li><b>Found By: </b>
                    <a href=${"/user/" + found.user_id}>
                        ${found.user_fname} ${found.user_lname}
                    </a></li>
                </ul>
                </div>`;

              google.maps.event.addListener(marker, 'click', () => {
                infoWindow.close();
                infoWindow.setContent(html);
                infoWindow.open(map, marker);



            });
            
        }
    });
}

function handleLocationError(browserHasGeolocation) {
    console.log(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}