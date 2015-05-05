
Template.listView.helpers({
	test: function() {
		return "jag är test";
	},
	parkedActivities: function() {
		return getParkedActivities(Session.get("currentSchedule"));
	},
	days: function() {
		var days = getDays(Session.get("currentSchedule"));
		days = addActivityStartTimes(days);
		days = addDayNumbers(days);

		for (var i in days) {
			days[i]["activities"] = addActivityNumbers(days[i]["activities"]);
		}

		return days;
	},
	activityType: function() {
		return this.type;
	},
	activityStart: function() {
		return minutesToHuman(this.activityStart);
	}
});

Template.listView.events({
	//
});
