var ActivityType = ["presentation","group_work","discussion","break"]

Schedules = new Mongo.Collection("schedules");

// Main model functions

getParkedActivities = function() {
	return Schedules.findOne("7brtTuz4yWDtKtS4Z").parkedActivities;
}

Meteor.methods({
	addDay: function(startH, startM) {
		var day;
		if(startH){
			day = new Day(startH,startM);
		} else {
			day = new Day(8,0);
		}
		this.days.push(day);
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
