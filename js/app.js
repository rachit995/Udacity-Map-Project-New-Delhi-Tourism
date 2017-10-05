//To check window size and hide side menu

$(window).resize(function() {
    var path = $(this);
    if (path.width() >= 720) {
        document.getElementsByClassName("sidebar-toggle")[0].style.left = "300px";
    } else {
        document.getElementsByClassName("sidebar-toggle")[0].style.left = "-300px";
    }
});

//To toggle the side nav bar with toggle menu button
$(document).ready(function() {
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        var elem = document.getElementById("sidebar-wrapper");
        left = window.getComputedStyle(elem, null).getPropertyValue("left");
        if (left == "300px") {
            document.getElementsByClassName("sidebar-toggle")[0].style.left = "-300px";
        } else if (left == "-300px") {
            document.getElementsByClassName("sidebar-toggle")[0].style.left = "300px";
        }
    });
});

function viewModel() {
    var self = this;
    self.map = null;
    self.showResults = ko.observableArray();
    self.marker = ko.observableArray();
    self.searchquery = ko.observable("");
    self.openInfoWindowH = null;
    self.wikiflag = 0;

    //Initialize map in centre with Airport and Railway station markers

    self.initializeMap = function() {
        var defLatLng = new google.maps.LatLng({
            lat: 28.5982305,
            lng: 77.2175561
        });
        var zoom = 12;
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: defLatLng,
            zoom: zoom,
            mapTypeControl: false,
            gestureHandling: 'greedy',
            streetViewControl: false,
            fullscreenControl: false,
        });

        map.marker = new google.maps.Marker({
            map: self.map,
            position: airportLatLng,
            animation: google.maps.Animation.DROP,
            icon: 'img/airport-marker.png',
            title: 'Nearest Airport'

        });

        map.marker = new google.maps.Marker({
            map: self.map,
            position: trainLatLng,
            animation: google.maps.Animation.DROP,
            icon: 'img/train-marker.png',
            title: 'Nearest Railway Station'

        });
    };

    //To update the results of search in side nav bar list

    self.resultsUpdate = function(locationdata) {
        self.showResults(self.sortMarker());
        self.cleanMarkers();
        self.relistMarkers(self.sortMarker());
    };

    //To fetch the search query and process it

    self.sortMarker = function() {
        var showResults = [];
        var searchquery = self.searchquery().toLowerCase();
        locationdata.forEach(function(getmapspot) {
            if (getmapspot.title.toLowerCase().includes(searchquery)) {
                showResults.push(getmapspot);
            }
        });
        return showResults;
    };

    //To clean the markers on map on when each search query is rendered

    self.cleanMarkers = function() {
        self.marker().forEach(function(marker, i) {
            marker.setMap(null);
        });
        self.marker.removeAll();
    };

    //To show the re-listed markers on the map. 

    self.relistMarkers = function(sortMarker) {
        sortMarker.forEach(function(getmapspot) {
            getmapspot.marker = new google.maps.Marker({
                map: self.map,
                position: getmapspot.coordinates,
                animation: google.maps.Animation.DROP,
                icon: self.mapMarkerColor(getmapspot),
                title: getmapspot.title + ' (' +self.getTimeColor(getmapspot) + ')'

            });
            getmapspot.marker.addListener('click', function() {
                self.chooseMonument(getmapspot);
            });
            self.marker().push(getmapspot.marker);
        });
    };

    //To choose the location on side nav bar and show it on map

    self.chooseMonument = function(getmapspot) {
        self.popInfoWindow(getmapspot);
        self.map.setCenter(getmapspot.marker.getPosition());
        self.bounceMarkers(getmapspot.marker);
    };

    //Bounce the marker on each click

    self.bounceMarkers = function(mapPoint) {
        if (mapPoint.getAnimation() !== null) {
            mapPoint.setAnimation(null);
        } else {
            mapPoint.setAnimation(google.maps.Animation.DROP);
        }
    };

    //Show InfoWindow on each click of location

    self.popInfoWindow = function(getmapspot) {
        if (self.openInfoWindowH !== null) {
            self.openInfoWindowH.close();
        }
        getmapspot.infoWindow = new google.maps.InfoWindow({
            content: self.infowindowContent(getmapspot),
            maxWidth: 400
        });
        self.openInfoWindowH = getmapspot.infoWindow;
        self.openInfoWindowH.open(self.map, getmapspot.marker);
    };

    //To get the color of clock in side nav menu on basis of whether it is open or not

    self.getTimeColor = function(getmapspot) {
        var currTime = new Date();
        currTime = parseInt(currTime.getHours() + "" + ("0" + currTime.getMinutes()).substr(-2) + "" + ("0" + currTime.getSeconds()).substr(-2));
        closeTime = parseInt(getmapspot.closeTiming.hh + "" + ("0" + getmapspot.closeTiming.mm).substr(-2) + "" + ("00"));
        openTime = parseInt(getmapspot.openTiming.hh + "" + ("0" + getmapspot.openTiming.mm).substr(-2) + "" + ("00"));
        var clockBg = null;

        if (currTime < closeTime && currTime > openTime)
            clockBg = 'Open'
        else
            clockBg = 'Closed';

        return clockBg;
    }

    //To  check the same whether it is open or not and color of marker

    self.mapMarkerColor = function(getmapspot) {
        var marker;
        if (self.getTimeColor(getmapspot) == 'Open')
            marker = 'img/open-map-marker.png';
        else
            marker = 'img/closed-map-marker.png';

        return marker;

    }

    //Customize the information in InfoWindow
    self.infowindowContent = function(getmapspot) {
        //calculate airport to location distance
        var airdistance = (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(airportLatLng.lat, airportLatLng.lng), new google.maps.LatLng(getmapspot.coordinates.lat, getmapspot.coordinates.lng))) / 1000;
        //calculate railway to location distance
        var raildistance = (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(trainLatLng.lat, trainLatLng.lng), new google.maps.LatLng(getmapspot.coordinates.lat, getmapspot.coordinates.lng))) / 1000
        var currTime = new Date();
        currTime = parseInt(currTime.getHours() + "" + ("0" + currTime.getMinutes()).substr(-2) + "" + ("0" + currTime.getSeconds()).substr(-2));
        closeTime = parseInt(getmapspot.closeTiming.hh + "" + ("0" + getmapspot.closeTiming.mm).substr(-2) + "" + ("00"));
        openTime = parseInt(getmapspot.openTiming.hh + "" + ("0" + getmapspot.openTiming.mm).substr(-2) + "" + ("00"));
        var timeBg = (currTime < closeTime && currTime > openTime) ? '#28a745' : '#dc3545';
        var timings = null;
        if (closeTime == '235900' && openTime == '000000')
            timings = 'All Days';
        else
            timings = getmapspot.openTiming.hh + ':' + getmapspot.openTiming.mm + '-' + getmapspot.closeTiming.hh + ':' + getmapspot.closeTiming.mm;
        getmapspot.color = timeBg;
        var template = '<div class="popUpWindow" style="background:url($img);">' +
            '<div class="popUpNearest">' +
            '<span class="nearestdistance airportdistance">' +
            '<i class="fa fa-plane" aria-hidden="true"></i>$airportdistance km' +
            '</span>' +
            '<span class="nearestdistance raildistance">' +
            '<i class="fa fa-train" aria-hidden="true"></i>$traindistance km' +
            '</span>' +
            '</div>' +
            '<h3 class="popUpHeading">$title</h3>' +
            '</div>' +
            '$wikiContent' +
            '<span class="timings" style="background:' + timeBg + '">' +
            '<i class="fa fa-clock-o" aria-hidden="true"></i>' + timings +
            '</span><div><br/><br/></div>';
        var wikiContentLayout = '$wikiContent';
        var var4 = '';
        if (getmapspot.var4 !== undefined) {
            var4 = wikiContentLayout.replace('$wikiContent', '<div class="popUpContent"><h6>Wikipedia says</h6><span>' + getmapspot.var4 + '</span></div>');
            if (getmapspot.img !== undefined)
                var4 = wikiContentLayout.replace('$wikiContent', '<div class="popUpContent"><h6>Wikipedia says</h6><span>' + getmapspot.var4 + '</span></div>');
        } else
            self.fetchWikiContent(getmapspot);
        var html = template.replace('$title', getmapspot.title).replace('$wikiContent', var4).replace('$img', getmapspot.imgItem).replace('$airportdistance', airdistance.toFixed(2)).replace('$traindistance', raildistance.toFixed(2));
        return html;
    };

    //To input search query or title of location as string query

    self.fetchWikiContent = function(getmapspot) {
        var wikiSearchQuery = null;
        if (getmapspot.wikiquery == null)
            wikiSearchQuery = getmapspot.title;
        else
            wikiSearchQuery = getmapspot.wikiquery;
        var wikiSearchUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiSearchQuery + '&format=json';
        $.ajax({
            url: wikiSearchUrl,
            dataType: 'jsonp',
            success: function(response) {
                if (response[2][0] !== undefined) {
                    getmapspot.var4 = response[2][0];
                    getmapspot.infoWindow.setContent(self.infowindowContent(getmapspot));
                }
            },
            timeout: 9500,

            //error handling

            error: function() {
                if (self.wikiflag !== 0) {
                    alert("No connection. Wikipedia API failed to load. Please reload after some time.");
                    self.wikiflag = 0;
                }
            }
        });
        $.getJSON("http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?", {
                titles: wikiSearchQuery,
                prop: "pageimages",
                pithumbsize: 350
            },

            //returning a default image or fetched image

            function(wikiPage) {
                var imgUrl = imageUrlKey(wikiPage.query.pages);
                var imgItem;
                if (imgUrl === "")
                    getmapspot.imgItem = "img/default.svg";
                else
                    getmapspot.imgItem = imgUrl;
            }
        );

        //To fetch the actual index of data as image URL    

        function imageUrlKey(queryPages) {
            var wImageUrl = "";
            for (var i in queryPages) {
                if (queryPages[i].thumbnail !== undefined) {
                    if (queryPages[i].thumbnail.source !== undefined) {
                        wImageUrl = queryPages[i].thumbnail.source;
                        break;
                    }
                }
            }
            return wImageUrl;
        }

    };

}

//Initiate the main function, also callback from Google Maps

function init() {

    myVM = new viewModel();
    //To show initials markers on map
    myVM.initializeMap();
    //To re-list the side nav bar locations from locationData
    myVM.resultsUpdate();
    //To start knockout and bind data in side nav bar
    ko.applyBindings(myVM, document.getElementById("sidebar-wrapper"));

}

//Google maps error handling

function gmapsError() {
    alert("Google Maps API failed to load.");
}
