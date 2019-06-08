/*setting up a map*/
"use strict";

var map;

var userLocation;

function getLocation() {
    //if browser capable of geolocation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    }
}

function success(pos) {
    userLocation = {lat: pos.coords.latitude, lng: pos.ccoord.longitude};
}

function initMap() {

    // console.dir(userLocation);

    let mapCenter = { lat: 37.73, lng: -122.453526 };

    //if browser capable of geolocation
    if(userLocation) {
        mapCenter = userLocation;
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