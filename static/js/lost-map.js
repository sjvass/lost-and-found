/*setting up a map*/
var map;
"use strict";

let userLocation;

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

    let mapCenter = { lat: 37.73, lng: -122.453526 };

    //if browser capable of geolocation
    if(userLocation) {
        mapCenter = userLocation;
    }

    //random coordinates
    // const sfCoords = { lat: 37.73, lng: -122.453526 };

    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 11
    });

    const infoWindow = new google.maps.InfoWindow();

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