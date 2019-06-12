/*setting up a map*/
var map;
"use strict";

function initMap() {

    let mapCenter = { lat: 37.73, lng: -122.453526 };

    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 11
    });

    const infoWindow = new google.maps.InfoWindow();


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

        // infoWindow.setPosition(pos);
        // infoWindow.setContent('Location found.');
        // infoWindow.open(map, userMarker);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true/*, infoWindow, map.getCenter()*/);
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false/*, infoWindow, map.getCenter()*/);
    }


    // //AJAX call to get list of losts
    $.get('/api/lost', (losts) => {
        for(let lost of losts) {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lost.lat, lost.lng),
                map: map,
                title: lost.title,
                icon: {
                    url: '/static/img/lost-marker.svg',
                    scaledSize: new google.maps.Size(30, 30)
                }
            });
            
            // Define the content of the infoWindow
            const html = `<div class="window-content">
                <h3>
                    <a href="lost/${lost.id}">
                        ${lost.title}
                    </a>
                </h3>
                <ul class="found-info">
                  <li><b>Description: </b>${lost.description}</li>
                  <li><b>Found By: </b>
                    <a href=${"/user/" + lost.user_id}>
                        ${lost.user_fname} ${lost.user_lname}
                    </a></li>
                  <li><b>Reward: </b>$${lost.reward}</li>
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
    // infoWindow.setPosition(pos);
    // infoWindow.setContent(browserHasGeolocation ?
    //                       'Error: The Geolocation service failed.' :
    //                       'Error: Your browser doesn\'t support geolocation.');
    // infoWindow.open(map);

    console.log(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}