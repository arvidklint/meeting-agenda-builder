if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Session.set("parkedActivityModal", false);

	Template.parkedActivitiesView.helpers({
		parkedActivities: function() {
			return getParkedActivities();
		}
	});

	Template.parkedActivitiesView.events({
		"click #addParkedActivity": function() {
			Session.set("parkedActivityModal", true);
		}
	});

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("parkedActivityModal", false);
		},
		"submit .newActivity": function(event) {
			var n = event.target.name.value;
			var l = event.target.length.value;
			var t = event.target.type.value;
			var d = event.target.description.value;

			var activity = {
				name: n,
				length: l,
				type: t,
				description: d
			}

			Meteor.call("addParkedActivity", activity, null);

			Session.set("parkedActivityModal", false);
			return false;
		}
	});

	Template.newActivityView.helpers({
		addParkedActivityModal: function() {
			return Session.get("parkedActivityModal");
		}
	});

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
