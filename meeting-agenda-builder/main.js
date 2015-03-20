if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.daysView.helpers({
		days: function() {
			return getDays();
		}
	});

	Template.daysView.events({
		"click #addDay": function() {
			Meteor.call("addDay");
		}
	});

	Template.day.helpers({
		startTimeHuman: function() {
			return this.startTime + 10;
		}
	});
}
