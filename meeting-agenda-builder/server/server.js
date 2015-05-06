if (Meteor.isServer) {
	Meteor.publish("schedules", function() {
		return Schedules.find({});
	});

	Meteor.startup(function () {
		// code to run on server at startup
	});
}