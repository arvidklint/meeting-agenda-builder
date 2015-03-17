var ActivityType = ["presentation","group_work","discussion","break"]

Schedules = new Mongo.Collection("schedules");

// Main model functions

getParkedActivities = function() {
	return Schedules.findOne("7brtTuz4yWDtKtS4Z").parkedActivities;
}

getDays = function() {
	return Schedules.findOne("7brtTuz4yWDtKtS4Z").days;
}

Meteor.methods({
	addDay: function(startH, startM) {
		var day = {
			startTime: 0,
			activities: []
		}

		Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $push: {days: day}} )
	},
	addParkedActivity: function(activity, position) {
		if (position === null) {
			console.log(activity);
			Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $push: {parkedActivities: activity} } );
		} else {
			pas = getParkedActivities();
			pas.splice(position, 0, activity);
			Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $set: {parkedActivities: pas} });
		};
	}
});

if (Meteor.isServer) {
	Meteor.publish("schedules", function() {
		return Schedules.find({});
	});


	Meteor.startup(function () {
		// code to run on server at startup
	});
}
