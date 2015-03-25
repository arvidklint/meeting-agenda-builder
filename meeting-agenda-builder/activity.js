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
		},
		days: function() {
			days = getDays();
			days = addDayNumbers(days);
			return days;
		}
	});

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("activityModal", false);
		},
		"submit .newActivity": function(event) {
			var title = event.target.title.value;
			var location = event.target.location.value;
			var lengthH = event.target.lengthH.value;
			var lengthM = event.target.lengthM.value;
			var type = event.target.type.value;
			var target = event.target.target.value;
			var description = event.target.description.value;

			var length = hmToMinutes(lengthH, lengthM);

			if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

			Meteor.call("addActivity", makeActivityObject(title, length, type, location, description), target);

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
