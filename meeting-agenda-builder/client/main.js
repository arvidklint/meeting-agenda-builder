Meteor.subscribe("schedules");
Meteor.subscribe("activities");
Meteor.subscribe("days");

Session.set("showPas", true);
Session.set("addDayModal", false);
Session.set("activityModal", false);

Session.set("refreshingLists", true);

Template.scheduleView.helpers({
	viewAsList: function() {
		return Session.get("viewAsList");
	}
});

Template.scheduleTitle.helpers({
	scheduleTitle: function() {
		return getScheduleInfo(Session.get("currentSchedule")).scheduleTitle;
	},
	editScheduleTitle: function() {
		return Session.get("editScheduleTitle");
	},
	viewAsList: function() {
		return Session.get("viewAsList");
	}
});

Template.scheduleTitle.events({
	"click #toScheduleChooser": function() {
		closeSchedule();
	},
	"click #toListView": function() {
		Session.set("viewAsList", true);
	},
	"click #toScheduleView": function() {
		Session.set("viewAsList", false);
	},
	"dblclick #scheduleTitle": function() {
		Session.set("editScheduleTitle", true);
	},
	"submit #scheduleTitleForm": function(event) {
		var newName = event.target.scheduleTitle.value;
		Meteor.call("editSchedule", Session.get("currentSchedule"), newName, null);
		Session.set("editScheduleTitle", false);
		return false;
	}
});

Template.daysView.helpers({
	days: function() {
		var days = getDays(Session.get("currentSchedule"));
		return days;
	}
});

Template.daysView.events({
	"click #addDay": function() {
		Session.set("addDayModal", true);
	}
});

Template.parkedActivitiesView.helpers({
	parkedActivities: function() {
		var pas = getActivities(Session.get("currentSchedule"), "parkedActivities");
		return pas;
	},
	listID: function() {
		return "parkedActivities";
	}
});

Template.parkedActivitiesView.events({
	"click #addActivityButton": function() {
		Session.set("activityModal", true);
	}
});

Template.day.helpers({
	startTimeHuman: function() {
		return minutesToHuman(this.startTime);
	},
	dayNumber: function() {
		return this.position + 1;
	},
	dayLength: function() {
		return minutesToHuman(dayLength(this));
	},
	dayEnd: function() {
		return minutesToHuman(this.startTime + dayLength(this));
	},
	addWeather: function() {
		if(this.date !== null && Session.get("weather") && this.displayWeather) {
			if(dayInWeatherRange(this.date)) return true;
		}
	},
	date: function() {
		return this.date.year + "-" + this.date.month + "-" + this.date.day;
	},
	addDate: function() {
		if (this.date) 
			return true;
	},
	addDayTitle: function() {
		if (this.dayTitle !== "") return true;
	},
	presentationHeight: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		return getDiagramActivityHeightPercent(ActivityType[0], activities);
	},
	groupWorkHeight: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		return getDiagramActivityHeightPercent(ActivityType[1], activities);
	},
	discussionHeight: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		return getDiagramActivityHeightPercent(ActivityType[2], activities);
	},
	breakHeight: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		return getDiagramActivityHeightPercent(ActivityType[3], activities);
	},
	anyActivities: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		if (activities.length == 0) {
			return false;
		} else {
			return true;
		}
	},
	listID: function() {
		return this._id;
	},
	activities: function() {
		var activities = getActivities(Session.get("currentSchedule"), this._id);
		activities = addActivityStartTimes(this.startTime, activities);
		return activities;
	}
});

Template.day.events({
	"change .hoursList": function(event) {
		$(event.target).parent().submit();
	},
	"change .minutesList": function(event) {
		$(event.target).parent().submit();
	},
	"submit .startTime": function(event) {
		var newTime = hmToMinutes(event.target.startHours.value, event.target.startMinutes.value);

		Meteor.call("changeStartTime", this._id, newTime);

		return false;
	},
	"dblclick .dayHeader": function() {
		editDay(this._id);
	},
	"click .editDay": function() {
		editDay(this._id);
	},
	"click .diagramContainer": function() {
		diagramExplanation();
	}
});

Template.activity.helpers({
	startTimeHuman: function() {
		return minutesToHuman(this.activityStart);
	},
	activityHeight: function() {
		return getActivityHeight(this.activityLength);
	},
	tooShort: function() {
		if (this.activityLength <= TOO_SHORT) {
			return "tooShort";
		}
	},
	activityStartSet: function() {
		if (this.activityStart != null) return true;
		else return false;
	},
	activityID: function() {
		return this._id;
	},
	pos: function() {
		return this.position;
	}
});

Template.activity.events({
	"click .editActivity": function() {
		editActivity(this._id);
	},
	"dblclick .activityObject": function() {
		editActivity(this._id);
	}
});

Template.weather.helpers({
	temp: function() {
		return getTemp(this.date);
	},
	description: function() {
		return getWeatherDescription(this.date);
	},
	imgref: function() {
		return getWeatherImgRef(this.date);
	}
});

Template.hoursList.helpers({
	hours: function() {
		return numberList(0, 23, 1, 2);
	},
	selected: function() {
		// Returns true if this hour should be selected in the menu

		var hour = minutesToHuman(Template.parentData(1).startTime).split(":")[0]; // get the day's selected hour from the parent template
		return (this == hour);
	}
});

Template.minutesList.helpers({
	minutes: function() {
		return numberList(0, 59, 5, 2);
	},
	selected: function() {
		// Returns true if this minute should be selected in the menu

		var minute = minutesToHuman(Template.parentData(1).startTime).split(":")[1]; // get the day's selected minute from the parent template
		return (this == minute);
	}
});

Template.activity.rendered = function() {
	$('.activityList').sortable({
		connectWith: ".connectLists",
		dropOnEmpty: true,
		// helper: "clone",
		update: function(event, ui) {
			var $this = $(this);
			var activities = $this.sortable('toArray');
			var parentList = $this.attr('id');
			_.each(activities, function(activityID, index){
				Meteor.call("updateActivityPos", activityID, parentList, index);
			});
		},
		stop: function(e, ui) {
			var parent = ui.item.parent();
            var id = parent.attr('id');
			$('.activityList').sortable('refresh');
		}
	}).disableSelection();
}
