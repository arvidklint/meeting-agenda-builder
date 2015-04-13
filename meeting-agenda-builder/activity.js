if (Meteor.isClient) {
	Session.set("activityModal", false);

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

			// var biggestID = getBiggestValueID(target);
			// var newID = biggestID + 1;

			// var listPos = getListPos(target);
			// var topPos = getTotalListHeight(target) + listPos.top;
			// var leftPos = listPos.left + MARGIN_ACTIVITY_LEFT;

			var length = hmToMinutes(lengthH, lengthM);

			if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

			Meteor.call("addActivity", makeActivityObject(title, length, type, location, description), target, 0);

			Session.set("activityModal", false);
			return false;
		}
	});

	Template.activity.helpers({
		startTimeHuman: function() {
			return minutesToHuman(this.activityStart);
		},
		activityHeight: function() {
			return getActivityHeight(this);
		},
		tooShort: function() {
			if (this.activityLength < 30) {
				return "tooShort";
			}
		},
		activityStartSet: function() {
			if (this.activityStart != null) return true;
			else return false;
		},
		leftPos: function() {
			return this.leftPos;
		},
		topPos: function() {
			return this.topPos;
		},
		activityID: function() {
			return this.activityID;
		},
		target: function() {
			return this.targetList;
		}
	});
}
