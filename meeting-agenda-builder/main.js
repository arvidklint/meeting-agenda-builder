if (Meteor.isClient) {
	Meteor.subscribe("schedules");

<<<<<<< HEAD
	Session.set("parkedActivityModal", false);

	Template.body.helpers({
=======
	Template.parkedActivitiesView.helpers({
>>>>>>> 9a5018de4f0a97c581466ad0b354a5e348ccc6cf
		parkedActivities: function() {
			return getParkedActivities();
		}
	});

	Template.parkedActivitiesView.events({
		"click #addParkedActivity": function() {
<<<<<<< HEAD
			// test_activity = {
			// 	name: "Mats",
			// 	length: "60",
			// 	type: "Presentation",
			// 	description: "Mats ska berätta om föroreningar orsakade av Al Gore"
			// };
			//
			// Meteor.call("addParkedActivity", test_activity, null);
			Session.set("parkedActivityModal", true);
		}
	});
=======
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
>>>>>>> 9a5018de4f0a97c581466ad0b354a5e348ccc6cf

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("parkedActivityModal", false);
		}
	});

<<<<<<< HEAD
	Template.newActivityView.helpers({
		addParkedActivityModal: function() {
			return Session.get("parkedActivityModal");
		}
	})
=======
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
	})

	
>>>>>>> 9a5018de4f0a97c581466ad0b354a5e348ccc6cf
}
