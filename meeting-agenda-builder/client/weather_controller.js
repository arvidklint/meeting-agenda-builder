Session.set("weather", "");
Session.set("weatherNotification", "loading weather");

// Does this browser support geolocation?
navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

function locationSuccess(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	var query = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + lat + '&lon=' + lon + '&cnt=10&mode=json';

	var count = 0;
	var weatherInterval = setInterval(function() {
		Meteor.call("getWeather", query, function (err, r) {
			if(r) {
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
	Session.set("weatherNotification", "Weather error");
}