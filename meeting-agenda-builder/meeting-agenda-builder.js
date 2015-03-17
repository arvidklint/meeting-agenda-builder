if (Meteor.isClient) {
	Template.body.helpers({
		parkedActivities: function() {
			// results = Schedules.findOne("7brtTuz4yWDtKtS4Z");
			// return results.parkedActivities;

			return getParkedActivities();
		}
	});

	Template.body.events({
		"click #addParkedActivity": function() {
			Meteor.call("asdf", "ddddddddddddddddd");
		}
	});

	
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
