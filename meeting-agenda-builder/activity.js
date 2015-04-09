if (Meteor.isClient) {
	Session.set("activityModal", false);

	Template.parkedActivitiesView.helpers({
		parkedActivities: function() {
			return getParkedActivities();
		}
	});

	Template.parkedActivitiesView.events({
		"click #addActivityButton": function() {
			Session.set("activityModal", true);
		}
	});

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("activityModal", false);
		},
		"submit .newActivity": function(event) {
			var ti = event.target.title.value;
			var n = event.target.name.value;
			var l = event.target.length.value;
			var t = event.target.type.value;
			var d = event.target.description.value;

			var activity = makeActivityObject(ti, n, l, t, d);

			Meteor.call("addActivity", activity, null);

			Session.set("activityModal", false);
			return false;
		}
	});

	Template.newActivityView.helpers({
		addActivityModal: function() {
			return Session.get("activityModal");
		}
	});

	Template.activity.helpers({
		startTimeHuman: function() {
			return minutesToHuman(this.activityStart);
		},
		activityHeight: function() {
			if (this.activityLength >= 30) {
				return this.activityLength * 1.5 + 20;
			} else {
				return 45 + 20;
			}
		},
		tooShort: function() {
			if (this.activityLength < 30) {
				return "tooShort";
			}
		},
	});
}
