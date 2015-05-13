Template.listView.rendered = function() {
	setContentSize();
}

Template.listView.helpers({
	test: function() {
		return "jag är test";
	},
	parkedActivities: function() {
		return getActivities(Session.get("currentSchedule"), "parkedActivities");
	},
	days: function() {
		return getDays(Session.get("currentSchedule"));;
	},
	activities: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		activities = addActivityStartTimes(this.startTime, activities);
		return activities;
	},
	dayLength: function() {
		return minutesToHuman(dayLength(this));
	},
	dayEnd: function() {
		return minutesToHuman(this.startTime + dayLength(this));
	},
	startTimeHuman: function() {
		return minutesToHuman(this.startTime);
	},
	dayNumber: function() {
		return this.position + 1;
	}
});

Template.listView.events({
	"click .editDay_listView": function() {
		editDay(this._id);
	},
	"click .editActivity_listView": function() {
		editActivity(this._id);
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
		editActivity(this._id);
	}
});
