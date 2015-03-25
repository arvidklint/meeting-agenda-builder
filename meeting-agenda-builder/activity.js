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

	Template.newActivityView.helpers({
		addActivityModal: function() {
			return Session.get("activityModal");
		},
		hours: function() {
			return numberList(0, 23, 1, 2);
		},
		minutes: function() {
			return numberList(0, 59, 5, 2);
		},
		selectedHour: function() {
			if (this == "00") return true;
		},
		selectedMinute: function() {
			if (this == "45") return true;
		}
	});

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("activityModal", false);
		},
		"submit .newActivity": function(event) {
			var ti = event.target.title.value;
			var n = event.target.name.value;
			var h = event.target.lengthH.value;
			var m = event.target.lengthM.value;
			var t = event.target.type.value;
			var d = event.target.description.value;

			var l = hmToMinutes(h, m);

			Meteor.call("addActivity", makeActivityObject(ti, n, l, t, d), null);

			Session.set("activityModal", false);
			return false;
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
		activityStartSet: function() {
			if (this.activityStart != null) return true;
			else return false;
		}
	});
}
