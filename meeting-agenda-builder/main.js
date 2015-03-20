if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.daysView.helpers({
		days: function() {
			days = getDays();

			return days;
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
