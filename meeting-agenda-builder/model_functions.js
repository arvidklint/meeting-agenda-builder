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

	if(dayInWeatherRange(date)) {
		return (parseInt(Session.get("weather").list[getDaysFromNow(date)].temp.day) - 273).toString() + " °C";
	}
	return "none";
}

getWeatherDescription = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	if(dayInWeatherRange(date)) {
		return Session.get("weather").list[getDaysFromNow(date)].weather[0].description;
	}
	return "no description";
}

getWeatherImgRef = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	if(dayInWeatherRange(date)) {
		return "http://openweathermap.org/img/w/" + Session.get("weather").list[getDaysFromNow(date)].weather[0].icon + ".png";
	}
	return "no description";
}

dayInWeatherRange = function(date) {
	var daysFromNow = getDaysFromNow(date);
	if(daysFromNow >= 0 && daysFromNow < Session.get("weather").cnt) {
		return true;
	} else {
		return false;
	}
}

openSchedule = function(scheduleID) {
	Session.set("currentSchedule", scheduleID);
}

editActivity = function(target, activityIndex) {
	Session.set("editActivityModal", true);
	Session.set("activityBeingEdited", {"day": target, "activityIndex": activityIndex});
}

stopEditingActivity = function() {
	Session.set("editActivityModal", false);
	Session.set("deleteActivityModal", false);
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
	Session.set("deleteDayModal", false);
	Session.set("dayBeingEdited", null);
}

stopAddingDay = function() {
	Session.set("addDayModal", false);
	Session.set("addDate", false);
}

stopEditingSchedules = function() {
	Session.set("editSchedules", false);
	Session.set("deleteScheduleModal", false);
	Session.set("scheduleToDelete", null);
}

stopDeletingSchedule = function() {
	Session.set("deleteScheduleModal", false);
	Session.set("scheduleToDelete", null);
}

logout = function() {
	Meteor.logout();

	Session.set("anySchedules", false);
	stopEditingSchedules();
	stopDeletingSchedule();
}
