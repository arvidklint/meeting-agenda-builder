if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Session.set("parkedActivityModal", false);

	Template.body.helpers({
		parkedActivities: function() {
			// results = Schedules.findOne("7brtTuz4yWDtKtS4Z");
			// return results.parkedActivities;

			return getParkedActivities();
		}
	});

	Template.body.events({
		"click #addParkedActivity": function() {
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

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("parkedActivityModal", false);
		}
	});

	Template.newActivityView.helpers({
		addParkedActivityModal: function() {
			return Session.get("parkedActivityModal");
		}
	})
}
