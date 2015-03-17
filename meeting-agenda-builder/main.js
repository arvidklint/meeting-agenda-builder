if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.parkedActivitiesView.helpers({
		parkedActivities: function() {
			// results = Schedules.findOne("7brtTuz4yWDtKtS4Z");
			// return results.parkedActivities;

			return getParkedActivities();
		}
	});

	Template.parkedActivitiesView.events({
		"click #addParkedActivity": function() {
			test_activity = {
				name: "Mats",
				length: "60",
				type: "presentation",
				description: "Mats ska berätta om föroreningar orsakade av Al Gore"
			};

			Meteor.call("addParkedActivity", test_activity, null);
		},
		"click #addParkedActivityAt2": function() {
			test_activity = {
				name: "Nummer2aktiviteten",
				length: "360",
				type: "group_discussion",
				description: "Hängringar om te"
			};

			Meteor.call("addParkedActivity", test_activity, 2);
		}
	});

	Template.daysView.helpers({
		days: function() {
			test_day = {
				start: "480",
				activities: []
			};

			return [test_day, test_day];
		}
	});

	
}

