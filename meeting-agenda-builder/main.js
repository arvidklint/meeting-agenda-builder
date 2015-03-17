if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.body.helpers({
		parkedActivities: function() {
			// results = Schedules.findOne("7brtTuz4yWDtKtS4Z");
			// return results.parkedActivities;

			return getParkedActivities();
		}
	});

	Template.body.events({
		"click #addParkedActivity": function() {
			test_activity = {
				name: "Mats",
				length: "60",
				type: "Presentation",
				description: "Mats ska berätta om föroreningar orsakade av Al Gore"
			};

			Meteor.call("addParkedActivity", test_activity, null);
		},
		"click #addParkedActivityAt2": function() {
			test_activity = {
				name: "Nummer2aktiviteten",
				length: "360",
				type: "Presentation",
				description: "Hängringar om te"
			};

			Meteor.call("addParkedActivity", test_activity, 2);
		}
	});

	
}

