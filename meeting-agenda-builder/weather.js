if (Meteor.isClient) {
	Session.set("weather", "");
	Session.set("weatherNotification", "loading weather");

	// Does this browser support geolocation?
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

	function locationSuccess(position) {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		//console.log(lat, lon);

		var query = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + lat + '&lon=' + lon + '&cnt=10&mode=json';

		//console.log(query);

		// Session.set("position", {"lat": lat, "lon": lon});
		var count = 0;
		var weatherInterval = setInterval(function() {
			Meteor.call("getWeather", query, function (err, r) {
				if(r) {
					console.log("gotWeather");
					Session.set("weather", r.data);
					clearInterval(weatherInterval);
				} else {
					console.log("error getting weather: " + err);
					count++;
					if (count > 5) {
						Session.set("weatherNotification", "Weather error");
						clearInterval(weatherInterval);
					}
				}
			});
		}, 3000);
	}

	function locationError(error) {
		// switch(error.code) {
		// 	case error.TIMEOUT:
		// 		console.log("A timeout occured! Please try again!");
		// 		break;
		// 	case error.POSITION_UNAVAILABLE:
		// 		console.log('We can\'t detect your location. Sorry!');
		// 		break;
		// 	case error.PERMISSION_DENIED:
		// 		console.log('Please allow geolocation access for this to work.');
		// 		break;
		// 	case error.UNKNOWN_ERROR:
		// 		console.log('An unknown error occured!');
		// 		break;
		// }
		Session.set("weatherNotification", "Weather error");
	}
}