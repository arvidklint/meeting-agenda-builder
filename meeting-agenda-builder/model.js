var ActivityType = ["Presentation","Group Work","Discussion","Break"]

Schedules = new Mongo.Collection("schedules");

getParkedActivities = function() {
	return Schedules.findOne("7brtTuz4yWDtKtS4Z").parkedActivities;
}


Meteor.methods({
// 
});

