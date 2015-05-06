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
		days = addDayNumbers(days);

		for (var i in days) {
			days[i]["activities"] = addActivityNumbers(days[i]["activities"]);
		}

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
		var pas = getParkedActivities(Session.get("currentSchedule"));
		pas = addActivityNumbers(pas);

		return pas;
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
		if(this.date !== null && Session.get("weather")) {
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

Template.activity.events({
	"click .editActivity": function() {
		var target = Template.parentData(1);
		if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
		else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

		var activityIndex = parseInt(this.activityNumber) - 1;

		editActivity(target, activityIndex);
	},
	"dblclick .activityObject": function() {
		var target = Template.parentData(1);
		if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
		else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

		var activityIndex = parseInt(this.activityNumber) - 1;

		editActivity(target, activityIndex);
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
		start: function(e, ui) {
			startPos = ui.item.index();
			startTarget = $(ui.item).parent().attr("id");
			console.log(startPos);
		},
		stop: function(e, ui) {
			endPos = ui.item.index();
			endTarget = $(ui.item).parent().attr("id");
			$('.activityList').sortable('cancel');
			//$('.activityList').sortable('refresh');
			if(startTarget === endTarget) {
				Meteor.call("moveActivity", Session.get("currentSchedule"), startTarget, startPos, endPos);
			} else {
				Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
			}
			console.log(endPos);
		}

		// //placeholder: "activityPlaceholder",
		// start: function(e, ui) {
		// 	startPos = ui.item.index();
		// 	startTarget = $(ui.item).parent().attr("id"); //ID från den första listan
		// 	endTarget = startTarget; //endTarget är vid detta tillfälle samma lista, om objektet dras till en annan lista så kommer "receive" att köras och ändra endTarget till den nya listan. "receive" körs innan "stop"
		// 	console.log("start: " + this.id + ", pos: " + startPos);
		// 	startItem = $(ui.item);
		// },
		// stop: function(e, ui) {
		// 	endPos = ui.item.index();
		// 	endTarget = $(ui.item).parent().attr("id");
		// 	console.log("stop: " + endTarget + ", pos: " + endPos);
		// 	$('.activityList').sortable('cancel');
		// 	console.log("cancel sortable");
		// 	if(startTarget === endTarget) {
		// 		//$('.activityList').sortable('cancel');
		// 		//console.log("cancel sortable");
		// 		console.log(startTarget + ", " + startPos + ", " + endPos);
		// 		Meteor.call("moveActivity", Session.get("currentSchedule"), startTarget, startPos, endPos);
		// 		console.log("Samma lista");
		// 	} 
		// 	else {
		// 		Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
		// 		console.log("Annan lista");
		// 	}
		// 	//$(".activityList").empty();
			
		// },
		// update: function(e, ui) {
		// 	console.log("update");
		// }
	});
};