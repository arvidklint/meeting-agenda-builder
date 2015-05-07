Meteor.subscribe("schedules");

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
		days = addActivityStartTimes(days);
		//days = addDayNumbers(days);

		// for (var i in days) {
		// 	days[i]["activities"] = addActivityNumbers(days[i]["activities"]);
		// }

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
		var array = [];
		for (var i in pas) {
			array.push({
				'activity': pas[i],
				'index': i,
				'parentID': "parkedActivities"
			});
		}
		return array;
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
		return this.dayNumber;
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
		return getDiagramActivityHeightPercent(ActivityType[0], this.activities);
	},
	groupWorkHeight: function() {
		return getDiagramActivityHeightPercent(ActivityType[1], this.activities);
	},
	discussionHeight: function() {
		return getDiagramActivityHeightPercent(ActivityType[2], this.activities);
	},
	breakHeight: function() {
		return getDiagramActivityHeightPercent(ActivityType[3], this.activities);
	},
	anyActivities: function() {
		var activities = getActivities(Session.get("currentSchedule"), 'day_' + (parseInt(this.position) + 1));
		if (activities.length == 0) {
			return false;
		} else {
			return true;
		}
	},
	listID: function() {
		return "day_" + this.dayNumber;
	},
	activities: function() {
		var array = [];
		var activities = getActivities(Session.get("currentSchedule"), 'day_' + (parseInt(this.position) + 1));
		console.log(activities);
		for (var i in activities) {
			array.push({
				'activity': activities[i],
				'index': i,
				'parentID': "day_" + this.position
			});
		}
		return array;
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
		var dayNumber = parseInt(this.dayNumber);
		var newTime = hmToMinutes(event.target.startHours.value, event.target.startMinutes.value);

		Meteor.call("changeStartTime", dayNumber - 1, newTime, Session.get("currentSchedule"));

		return false;
	},
	"dblclick .dayHeader": function() {
		editDay(parseInt(this.dayNumber) - 1);
	},
	"click .editDay": function() {
		editDay(parseInt(this.dayNumber) - 1);
	}
});

Template.activity.helpers({
	startTimeHuman: function() {
		return minutesToHuman(this.activity.activityStart);
	},
	activityHeight: function() {
		return getActivityHeight(this.activity.activityLength);
	},
	tooShort: function() {
		if (this.activity.activityLength < 30) {
			return "tooShort";
		}
	},
	activityStartSet: function() {
		if (this.activity.activityStart != null) return true;
		else return false;
	},
	leftPos: function() {
		return this.activity.leftPos;
	},
	topPos: function() {
		return this.activity.topPos;
	},
	activityID: function() {
		return this.activity.activityID;
	},
	target: function() {
		return this.activity.targetList;
	}
});

Template.activity.events({
	"click .editActivity": function() {
		var target = Template.parentData(1);
		if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
		else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

		editActivity(target, this.index);
	},
	"dblclick .activityObject": function() {
		var target = Template.parentData(1);
		if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
		else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

		editActivity(target, this.index);
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

// Template.activity.rendered = function() {
// 	this.$(".activityObject").draggable({
// 		stop: function(e, ui) {
// 			var leftPos = ui.position.left;
// 			var topPos = ui.position.top;
// 			var activityID = $(this).attr('id');
// 			console.log(activityID);
// 			var target = "parkedActivities";
// 			Meteor.call("updateActivityPos", target, activityID, leftPos, topPos);
// 		}
// 	});
// }

Template.scheduleView.rendered = function() {
	this.$('.activityList').sortable({
		connectWith: ".connectLists",
		dropOnEmpty: true,
		// helper: "clone",
		stop: function(e, ui) {
			// startItem = ui.item;
			// console.log($(ui.item).parent().attr("id") + ": start");
			// startPos = ui.item.index();
			// startTarget = $(ui.item).parent().attr("id");
			// console.log(startPos);
			var $this = $(this);
			var endPos = ui.item.index();
			var endTarget = $(ui.item).parent().attr("id");
			var startPos = $(ui.item).attr('position');
			var startTarget = $(ui.item).attr('parentid');
			var activities = $this.sortable('toArray');
			console.log($this.attr("id") + ": update, startTarget: " + startTarget + ", " + startPos + ", endTarget, endPos: " + endTarget + ", " + endPos);

			if(startTarget === endTarget) {
				Meteor.call("moveActivity", Session.get("currentSchedule"), startTarget, startPos, endPos);
			} else {
				Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
			}

			// _.each(activities, function(activity, index) {

			// });


		}
		// stop: function(e, ui) {
		// 	console.log($(ui.item).parent().attr("id") + ": stop");
		// 	var parent = ui.item.parent();
		// 	var id = parent.attr('id');
			//$('#' + id).find('li[parentID!=' + id + ']').remove();
			// endPos = ui.item.index();
			// endTarget = $(ui.item).parent().attr("id");
			// //$(startItem).remove();
			// $('.activityList').sortable('cancel');
			// //$('.activityList').sortable('refresh');
			// if(startTarget === endTarget) {
			// 	Meteor.call("moveActivity", Session.get("currentSchedule"), startTarget, startPos, endPos);
			// } else {
			// 	Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
			// }
			// console.log(endPos);
			// initSortable();
		//}
	}).disableSelection();
}

Meteor.startup(function() {
	console.log("Startup");
	//initSortable();
});
