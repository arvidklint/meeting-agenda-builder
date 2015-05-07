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
	dayLength: function() {
		return minutesToHuman(dayLength(this));
	},
	dayEnd: function() {
		return minutesToHuman(this.startTime + dayLength(this));
	},
	startTimeHuman: function() {
		return minutesToHuman(this.startTime);
	}
});

Template.listView.events({
	"click .editDay_listView": function() {
		console.log(this);
		editDay(parseInt(this.dayNumber) - 1);
	}
});

Template.activity_listView.helpers({
	activityType: function() {
		return activityTypesTranslation[this.type];
	},
	activityStart: function() {
		return minutesToHuman(this.activityStart);
	},
	activityStartSet: function() {
		if (this.activityStart != null) return true;
		else return false;
	}
});

Template.activity_listView.events({
	"dblclick tr": function() {
		var target = checkClickOfActivityObject(Template.parentData(1));
		console.log(target);
	}
});
