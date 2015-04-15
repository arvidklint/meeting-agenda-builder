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

makeActivityObject = function(title, length, type, location, description) {
	return {
		"title": title,
		"activityLength": length,
		"type": type,
		"location": location,
		"description": description
	}
}

emptySchedule = function() {
	this.scheduleTitle = "";
	this.parkedActivities = [];
	this.days = [];
	this.owner = "";
}

emptyDay = function() {
	this.dayTitle = "";
	this.startTime = 540;
	this.activities = [];
	this.date = "";
}

addActivityStartTimes = function(days) {
	// Receives an array of days. Returns an array of days, with fields for activity start times added

	for (i in days) {
		startTime = days[i].startTime; // the startTime of the first activity is the startTime of the day

		for (j in days[i].activities) {
			days[i].activities[j]["activityStart"] = startTime; // add startTime to the activity object
			startTime += days[i].activities[j].activityLength; // increase the startTime variable for the next activity, with the length of this activity
		}
	}

	return days;
}

addDayNumbers = function(days) {
	// Receives an array of days. Returns an array of days, with fields for day number added.

	for (i in days) {
		days[i]["dayNumber"] = parseInt(i) + 1;
	}

	return days;
}

dayLength = function(day) {
	length = 0;

	for (i in day.activities) {
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
		console.log("push");
		list.push(activity);
	} else {
		list.splice(endPos, 0, activity);
		console.log("splice");
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

Meteor.methods({
	addSchedule: function(userID, scheduleTitle, numDays) {
		var schedule = new emptySchedule;

		schedule.scheduleTitle = scheduleTitle;
		schedule.owner = userID;

		for (var i = 0; i < numDays; i ++) {
			schedule.days.push(new emptyDay);
		}

		var scheduleID = Schedules.insert(schedule);
		Session.set("currentSchedule", scheduleID);
	},
	deleteSchedule: function(scheduleID) {
		var schedule = Schedules.findOne(scheduleID);

		if (schedule.owner == Meteor.user()._id) {
			Schedules.remove(schedule._id);
		} else {
			throw new Error("You are not the owner of the schedule " + schedule.scheduleTitle + " and can therefore not delete it.");
		}
	},
	addDay: function(startH, startM, scheduleID) {
		var day = new emptyDay();

		Schedules.update( {"_id": scheduleID}, { $push: {days: day}} )
	},
	addActivity: function(activity, target, position, scheduleID) {
		console.log("addActivity");

		if (target === "parkedActivities") {
			pas = getParkedActivities(scheduleID);
			pas.splice(position, 0, activity);
			Schedules.update( {"_id": scheduleID}, { $set: {parkedActivities: pas} });
		} else {
			console.log(scheduleID);
			day = getDays(scheduleID)[target]; // get the whole day
			day.activities.push(activity);

			var formattedInfo = {};
			formattedInfo["days." + target] = day; // create dict with a key named days[target] and push the new day (a necessary trick)

			Schedules.update( {"_id": scheduleID}, { $set: formattedInfo }) // reupload the whole day
		};
	},
	removeActivity: function(position, scheduleID) {
		pas = getParkedActivities(scheduleID);
		pas.splice(position, 1);
		Schedules.update( {"_id": scheduleID}, { $set: {parkedActivities: pas} });
	},
	changeStartTime: function(position, newTime, scheduleID) {
		day = Schedules.findOne(scheduleID).days[position]; // get the day
		day.startTime = newTime; // modify the day's start time

		var formattedInfo = {};
		formattedInfo["days." + position] = day; // create dict with a key named days[target] and push the new day (a necessary trick)

		Schedules.update( {"_id": scheduleID}, { $set: formattedInfo }); // replace the whole day (the only way unfortunately)
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

			Schedules.update( {"_id": scheduleID}, {$set: {parkedActivities: pas} });
			
		} else {
			var dayIndex = parseInt(target.replace(/\D/g,'')) - 1; //Replaces every non-digit characters with nothing.
			var day = getDays(scheduleID)[dayIndex];

			day.activities = moveActivityInList(day.activities, startPos, endPos);

			var formattedInfo = {};
			formattedInfo["days." + dayIndex] = day;
			console.log(formattedInfo);

			Schedules.update( {"_id": scheduleID}, { $set: formattedInfo});

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
	}
	// updateRank: function(id, rank) {
	// 	Schedules.update( {"_id": Session.get("currentSchedule"), parkedActivities._id = id}, {$set: {parkedActivities.$.rank: rank}});
	// }
});

if (Meteor.isServer) {
	Meteor.publish("schedules", function() {
		return Schedules.find({});
	});

	Meteor.startup(function () {
		// code to run on server at startup
	});
}
