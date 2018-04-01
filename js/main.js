$(document).ready(function () {

    $('.lookupbtn').on('click', function (event) {
        event.preventDefault();
        let googleMapAPI = "";
        let loader = new Loader();
        let ipService = new IPService();
        let map = window.map;
            loader.show().then(() => {
                ipService.fetchIPs($('#ips').val().split("\n")).then((fetchedIps) => {
                    fetchedIps.forEach((fetchedIp) => {
                        let marker = new google.maps.Marker({
                            position: new google.maps.LatLng(fetchedIp.getLatitude(), fetchedIp.getLongitude()),
                            map: map,
                            title: fetchedIp.getTitle()
                        });
                        map.setCenter(marker.getPosition());
                        let infowindow = new google.maps.InfoWindow();
                        let content = fetchedIp.getTitle();
                        google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
                            return function () {
                                infowindow.setContent(content);
                                infowindow.open(map, marker);
                            };
                        })(marker, content, infowindow));
                    });
                    loader.hide();
                })
            });
    });
});

function initMap() {
    window.map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(40.5516, -74.4637),
        zoom: 4
    });
}

function Loader() {
    let loadingDiv = $(
        '<div class="modal" tabindex="-1" role="dialog" id="loader">' +
        '  <div class="modal-dialog" role="document">' +
        '    <div class="modal-content">' +
        '      <div class="modal-body">' +
        '        <div style="text-align: center">' +
        '           <i class="fas fa-spinner fa-spin fa-5x"></i><br>' +
        '           <span>Loading...</span>' +
        '</div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>');
    Loader.prototype.show = () => {
        return new Promise((resolve, reject) => {
            $(loadingDiv).modal();
            resolve(true);
        });
    };

    Loader.prototype.hide = () => {
        $('#loader').modal('hide');
    }
}

function APIService() {
    APIService.prototype.get = (url) => {
        return fetch(url).then((response) => {
            return response.json();
        })
    }
}

function IPService() {
    let apiService = new APIService();

    IPService.prototype.fetchIPs = (ips) => {
        return sendJSONRequest(apiService, ips.filter((item, index) => {
            return ips.indexOf(item) === index;
        }));
    };
}

function LatAndLonObject(lat_, lon_, title_) {
    let lat = lat_;
    let lon = lon_;
    let title = title_;

    LatAndLonObject.prototype.getLongitude = () => {
        return lon;
    };

    LatAndLonObject.prototype.getLatitude = () => {
        return lat;
    };

    LatAndLonObject.prototype.getTitle = () => {
        return title;
    }
}

function sendJSONRequest(service, items) {
    let url = "http://extreme-ip-lookup.com/json/";
    return service.get(`${url}${items.shift()}`).then((ipData) => {
        if (items.length > 0) {
            return sendJSONRequest(service, items).then((data) => {
                return data.concat([
                    new LatAndLonObject(parseFloat(ipData.lat), parseFloat(ipData.lon), ipData.isp)
                ]);
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve([new LatAndLonObject(parseFloat(ipData.lat), parseFloat(ipData.lon), ipData.isp)]);
            });
        }
    })
}

