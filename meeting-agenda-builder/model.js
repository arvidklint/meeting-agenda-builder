var ActivityType = ["presentation","group_work","discussion","break"]

Schedules = new Mongo.Collection("schedules");

// Main model functions

leTest = function() {
	console.log("leTest");
	loggedIn = true;
}

getSchedules = function(user) {
	schedules = Schedules.find({"owner": user._id}).fetch();

	return schedules;
}

getParkedActivities = function(scheduleID) {
	return Schedules.findOne(scheduleID).parkedActivities;
}

function dynamicSort(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

getDays = function(scheduleID) {
	return Schedules.findOne(scheduleID).days;
}

getActivity = function(scheduleID, day, activityIndex) {
	if (day === "parkedActivities") {
		return Schedules.findOne(scheduleID).parkedActivities[activityIndex];
	} else {
		return Schedules.findOne(scheduleID).days[day].activities[activityIndex];
	}
}

getScheduleInfo = function(scheduleID) {
	schedule = Schedules.findOne(scheduleID);

	var scheduleInfo = {};

	scheduleInfo["id"] = schedule._id;
	scheduleInfo["scheduleTitle"] = schedule.scheduleTitle;
	scheduleInfo["owner"] = schedule.owner;

	return scheduleInfo;
}

getListPos = function(target) {
	if (target === "parkedActivities") {
		var position = $("#parkedActivities").offset();
		return position;
	}
}

// getTotalListHeight = function(target) {
// 	if (target === "parkedActivities") {
// 		pas = getParkedActivities();
// 		var totalHeight = 0;
// 		for (var i = 0; i < pas.length; i++) {
// 			totalHeight += getActivityHeight(pas[i]);
// 			totalHeight += MARGIN_BETWEEN_ACTIVITIES;
// 		}
// 		return totalHeight;
// 	}
// }

getActivityHeight = function(activity) {
	if (activity.activityLength >= 30) {
		return activity.activityLength * 1.5 + 20;
	} else {
		return 45 + 20;
	}
}

// getBiggestValueID = function(target) {
// 	if (target === "parkedActivities") {
// 		pas = getParkedActivities();
// 		var biggestValue = 0;
// 		for (var i = 0; i < pas.length; i++) {
// 			if (parseInt(pas[i].id) > biggestValue) {
// 				biggestValue = parseInt(pas[i].id);
// 			}
// 		}
// 		return biggestValue;
// 	}
// }

Activity = function(title, length, type, location, description) {
	this.title = title;
	this.activityLength = length;
	this.type = type;
	this.location = location;
	this.description = description;
}

// Template for schedule objects
emptySchedule = function() {
	this.scheduleTitle = "";
	this.parkedActivities = [];
	this.days = [];
	this.owner = "";
}

// Template for day objects
Day = function(title, startTime, date) {
	title = typeof title !== 'undefined' ? title : "";
	startTime = typeof startTime !== 'undefined' ? startTime : 540;
	date = typeof date !== 'undefined' ? date : 'undefined';

	this.dayTitle = title;
	this.startTime = startTime;
	this.activities = [];
	this.date = date;
}

activityTypes = [
	{"value": "presentation", "name": "Presentation"},
	{"value": "group_work", "name": "Group work"},
	{"value": "discussion", "name": "Discussion"},
	{"value": "break", "name": "Break"}
];

addActivityStartTimes = function(days) {
	// Receives an array of days. Returns an array of days, with fields for activity start times added

	for (var i in days) {
		startTime = days[i].startTime; // the startTime of the first activity is the startTime of the day

		for (var j in days[i].activities) {
			days[i].activities[j]["activityStart"] = startTime; // add startTime to the activity object
			startTime += days[i].activities[j].activityLength; // increase the startTime variable for the next activity, with the length of this activity
		}
	}

	return days;
}

addDayNumbers = function(days) {
	// Receives an array of days. Returns an array of days, with fields for day number added.

	for (var i in days) {
		days[i]["dayNumber"] = parseInt(i) + 1;
	}

	return days;
}

addActivityNumbers = function(activities) {
	// Receives an array of activities. Returns an array of activities with fields for activity numbers added.

	for (var i in activities) {
		activities[i]["activityNumber"] = parseInt(i) + 1;
	}

	return activities;
}

dayLength = function(day) {
	length = 0;

	for (var i in day.activities) {
		length += day.activities[i].activityLength;
	}

	return length;
}

minutesToHuman = function(inMinutes) {
	// Receives a number in minutes. Outputs a human-readable string formatted to HH:MM

	hours = "" + Math.floor(inMinutes/60);
	hours = zeroPadding(hours, 2);

	minutes = "" + inMinutes % 60;
	minutes = zeroPadding(minutes, 2);

	return hours + ":" + minutes;
}

minutesToHM = function(inMinutes) {
	hours = "" + Math.floor(inMinutes/60);
	hours = zeroPadding(hours, 2);

	minutes = "" + inMinutes % 60;
	minutes = zeroPadding(minutes, 2);

	return [hours, minutes];
}

hmToMinutes = function(hours, minutes) {
	return parseInt(hours) * 60 + parseInt(minutes);
}

zeroPadding = function(num, size) {
	while (num.length < size) {
		num = "0" + num;
	}

	return num;
}

numberList = function(start, end, step, padding) {
	var numList = []

	for (var i = start; i < end + 1; i = i + step) {
		if (padding) {
			num = zeroPadding("" + i, 2);
		} else {
			num = i;
		}
		numList.push(num);
	}

	return numList;
}

moveActivityInList = function(list, startPos, endPos) {
	var activity = list[startPos];
	list.splice(startPos, 1);

	if (endPos >= list.length) {
		list.push(activity);
	} else {
		list.splice(endPos, 0, activity);
	}
	return list;
}

putActivityInList = function(list, activity, pos) {
	// if (pos >= list.length) {
	// 	list.push(activity);
	// } else {
	// 	list.splice(pos, 0, activity);
	// }
	list.splice(pos, 0, activity);
	return list;
}

getCurrentYear = function() {
	var year = zeroPadding(new Date().getFullYear(), 4);
	return year;
}

getCurrentMonth = function() {
	var month = zeroPadding(new Date().getMonth() + 1, 2);
	return month;
}

getCurrentDay = function() {
	var day = zeroPadding(new Date().getDate(), 2);
	return day;
}

getDaysFromNow = function(date) {
	var currentDate = new Date(parseInt(getCurrentYear()), parseInt(getCurrentMonth()), parseInt(getCurrentDay()));
	var otherDate = new Date(parseInt(date.year), parseInt(date.month), parseInt(date.day));

	var timeDiff = otherDate.getTime() - currentDate.getTime();
	var dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

	return dayDiff;
}

getTemp = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	var daysFromNow = getDaysFromNow(date);

	if(dayInWeatherRange(daysFromNow)) {
		return (parseInt(Session.get("weather").list[daysFromNow].temp.day) - 273).toString() + " °C";
	}
	return "none";
}

getWeatherDescription = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	var daysFromNow = getDaysFromNow(date);

	if(dayInWeatherRange(daysFromNow)) {
		return Session.get("weather").list[daysFromNow].weather[0].description;
	}
	return "no description";
}

getWeatherImgRef = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	var daysFromNow = getDaysFromNow(date);

	if(dayInWeatherRange(daysFromNow)) {
		return "http://openweathermap.org/img/w/" + Session.get("weather").list[daysFromNow].weather[0].icon + ".png";
	}
	return "no description";
}

dayInWeatherRange = function(daysFromNow) {
	if(daysFromNow >= 0 && daysFromNow < Session.get("weather").cnt) {
		return true;
	} else {
		return false;
	}
}

editActivity = function(target, activityIndex) {
	Session.set("editActivityModal", true);
	Session.set("activityBeingEdited", {"day": target, "activityIndex": activityIndex});
}

stopEditingActivity = function() {
	Session.set("editActivityModal", false);
	Session.set("activityBeingEdited", null);
}

editDay = function(target) {
	var dayBeingEdited = getDays(Session.get("currentSchedule"))[target];

	dayBeingEdited["dayNumber"] = target + 1;
	dayBeingEdited["startTimeHM"] = minutesToHM(dayBeingEdited.startTime);
	Session.set("dayBeingEdited", dayBeingEdited);

	if (dayBeingEdited.date) Session.set("addDate", true);
	else Session.set("addDate", false);

	Session.set("editDayModal", true);
}

stopEditingDay = function() {
	Session.set("editDayModal", false);
	Session.set("dayBeingEdited", null);
}

stopAddingDay = function() {
	Session.set("addDayModal", false);
	Session.set("addDate", false);
}

Meteor.methods({
	addSchedule: function(userID, scheduleTitle, numDays) {
		var schedule = new emptySchedule;

		schedule.scheduleTitle = scheduleTitle;
		schedule.owner = userID;

		for (var i = 0; i < numDays; i ++) {
			schedule.days.push(new Day());
		}

		var scheduleID = Schedules.insert(schedule);
		Session.set("currentSchedule", scheduleID);
	},
	deleteSchedule: function(scheduleID) {
		var schedule = Schedules.findOne(scheduleID);

		if (schedule.owner == Meteor.user()._id) {
			Schedules.remove(schedule._id);
		} else {
			throw new Error("You are not the owner of the schedule \"" + schedule.scheduleTitle + "\" and can therefore not delete it.");
		}
	},
	editSchedule: function(scheduleID, newTitle, numDays) {
		if (newTitle) {
			Schedules.update( {"_id": scheduleID}, {$set: {scheduleTitle: newTitle}} );
		}

		if (numDays) {
			oldLength = parseInt(getDays(scheduleID).length);
			difference = numDays - oldLength;
			newDays = [];

			for (var i = 0; i < difference; i ++) {
				newDays.push(new Day);
			}

			// ej klar än
		}
	},
	addDay: function(scheduleID, title, startTime, date) {
		var day = new Day(title, startTime, date);

		Schedules.update( {"_id": scheduleID}, { $push: {days: day}} )
	},
	updateDay: function(target, modifiedDay, scheduleID) {
		// Receives either "parkedActivites" or a day index. Receives a day object.
		// Replaces the specified day in the database.

		if (target === "parkedActivities") {
			Schedules.update({"_id": scheduleID}, {$set: {parkedActivities: modifiedDay}});
		} else {
			var formattedInfo = {};
			formattedInfo["days." + target] = modifiedDay; // create dict with a key named days[target] and push the new day (a necessary trick)
			Schedules.update({"_id": scheduleID}, {$set: formattedInfo}) // reupload the whole day
		}
	},
	addActivity: function(activity, target, position, scheduleID) {
		if (target === "parkedActivities") {
			pas = getParkedActivities(scheduleID);
			pas.splice(position, 0, activity);
			Meteor.call("updateDay", target, pas, scheduleID);
		} else {
			day = getDays(scheduleID)[target];

			if (position == null) day.activities.push(activity);
			else day.activities.splice(position, 0, activity);
				// console.log("add activity to specific position");
				// activities = day.activities;
				// console.log(activities);
				// activities.splice(position, 0, activity);
				// day.activities = activities;
				// console.log(day);

			Meteor.call("updateDay", target, day, scheduleID);
		};
	},
	removeActivity: function(target, position, scheduleID) {
		if (target === "parkedActivities") {
			pas = getParkedActivities(scheduleID);
			pas.splice(position, 1);
			Meteor.call("updateDay", target, pas, scheduleID);
		} else {
			day = getDays(scheduleID)[target];
			day.activities.splice(position, 1);
			Meteor.call("updateDay", target, day, scheduleID);
		}
	},
	changeStartTime: function(target, newTime, scheduleID) {
		day = Schedules.findOne(scheduleID).days[target]; // get the day
		day.startTime = newTime; // modify the day's start time
		Meteor.call("updateDay", target, day, scheduleID);
	},
	// updateActivityPos: function(targetList, activityID, leftPos, topPos) {
	// 	if (targetList === "parkedActivities") {
	// 		Schedules.update(
	// 			{
	// 				"_id": queryID, 
	// 				"parkedActivities.id": activityID
	// 			}, 
	// 			{
	// 				"$set": {
	// 					"parkedActivities.$.leftPos": leftPos + "px",
	// 					"parkedActivities.$.topPos": topPos + "px"
	// 				}
	// 			}
	// 		);
	// 	}
	// },
	moveActivity: function(scheduleID, target, startPos, endPos) {
		if (target === "parkedActivities") {
			var pas = getParkedActivities(scheduleID);
			pas = moveActivityInList(pas, startPos, endPos);
			Meteor.call("updateDay", target, pas, scheduleID);			
		} else {
			var dayIndex = parseInt(target.replace(/\D/g,'')) - 1; //Replaces every non-digit characters with nothing.
			var day = getDays(scheduleID)[dayIndex];

			day.activities = moveActivityInList(day.activities, startPos, endPos);

			Meteor.call("updateDay", dayIndex, day, scheduleID);
		}
		Deps.flush();
	},
	moveActivityToList: function(scheduleID, startTarget, endTarget, startPos, endPos) {

		if(startTarget === "parkedActivities") {
			console.log("parkedActivities till lista");
			var pas = getParkedActivities(scheduleID);

			var dayIndex = parseInt(endTarget.replace(/\D/g,'')) - 1;

			var day = getDays(scheduleID)[dayIndex];

			var activity = pas.splice(startPos, 1)[0];
			
			day.activities = putActivityInList(day.activities, activity, endPos);

			Schedules.update( {"_id": scheduleID}, {$set: {parkedActivities: pas} });
			var formattedInfo = {};

			formattedInfo["days." + dayIndex] = day;
			Schedules.update( {"_id": scheduleID}, { $set: formattedInfo });

		} else if (endTarget === "parkedActivities") {
			console.log("lista till parkedActivities");
			var pas = getParkedActivities(scheduleID);

			var dayIndex = parseInt(startTarget.replace(/\D/g,'')) - 1;

			var day = getDays(scheduleID)[dayIndex];

			var activity = day.activities.splice(startPos, 1)[0];

			pas = putActivityInList(pas, activity, endPos);

			Schedules.update( {"_id": scheduleID}, {$set: {parkedActivities: pas} });

			var formattedInfo = {};
			formattedInfo["days." + dayIndex] = day;
			Schedules.update( {"_id": scheduleID}, {$set: formattedInfo});

		} else {
			console.log("lista till lista");
			var dayStartIndex = parseInt(startTarget.replace(/\D/g,'')) - 1;
			var dayEndIndex = parseInt(endTarget.replace(/\D/g,'')) - 1;

			var dayStart = getDays(scheduleID)[dayStartIndex];
			var dayEnd = getDays(scheduleID)[dayEndIndex];

			var activity = dayStart.activities.splice(startPos, 1)[0];

			dayEnd.activities = putActivityInList(dayEnd.activities, activity, endPos);

			var formattedInfo = {};
			formattedInfo["days." + dayStartIndex] = dayStart;
			formattedInfo["days." + dayEndIndex] = dayEnd;

			Schedules.update( {"_id": scheduleID}, {$set: formattedInfo});
		}
		
		Deps.flush();
	},
	// updateRank: function(id, rank) {
	// 	Schedules.update( {"_id": Session.get("currentSchedule"), parkedActivities._id = id}, {$set: {parkedActivities.$.rank: rank}});
	// },
	modifyActivity: function(newActivity, target, position, oldInfo, scheduleID) {
		if (oldInfo.day !== target) position = null; // temporarily remove position info when changing days until reactive position chooser is implemented

		Meteor.call("removeActivity", oldInfo.day, oldInfo.activityIndex, scheduleID);
		Meteor.call("addActivity", newActivity, target, position, scheduleID);
	}
});

if (Meteor.isServer) {
	Meteor.publish("schedules", function() {
		return Schedules.find({});
	});

	Meteor.startup(function () {
		// code to run on server at startup
	});
}
