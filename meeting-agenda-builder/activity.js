if(Meteor.isClient) {
	Session.set("parkedActivityModal", false);
	Session.set("parentParked", false);

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

	Template.activity.helpers({
		activityStart: function() {
			console.log(this);
			return this.length;
		}
	});
}
