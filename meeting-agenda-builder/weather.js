if (Meteor.isClient) {
	// Does this browser support geolocation?
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else{
		showError("Your browser does not support Geolocation!");
	}

	function locationSuccess(position) {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		//console.log(lat, lon);

		var query = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + lat + '&lon=' + lon + '&cnt=10&mode=json';

		//console.log(query);

		// Session.set("position", {"lat": lat, "lon": lon});

		Meteor.call("getWeather", query, function (err, r) {
			if(r) {
				Session.set("weather", r.data);
			} else {
				console.log("error getting weather: " + err);
			}
		});
	}

	function locationError(error){
		switch(error.code) {
			case error.TIMEOUT:
				showError("A timeout occured! Please try again!");
				break;
			case error.POSITION_UNAVAILABLE:
				showError('We can\'t detect your location. Sorry!');
				break;
			case error.PERMISSION_DENIED:
				showError('Please allow geolocation access for this to work.');
				break;
			case error.UNKNOWN_ERROR:
				showError('An unknown error occured!');
				break;
		}
	}
}

showError = function(msg){
	alert(msg);
}

if(Meteor.isServer) {
	Meteor.methods({
		getWeather: function (query) {
			//this.unblock();
			return Meteor.http.get(query);
		}
	});

}