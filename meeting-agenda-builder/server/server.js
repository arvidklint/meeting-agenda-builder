Meteor.publish("schedules", function() {
	return Schedules.find({});
});

Meteor.publish("activities", function() {
	return Activities.find({});
});

Meteor.publish("days", function() {
	return Days.find({});
});