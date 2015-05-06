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
	addDay: function(scheduleID, title, startTime, date, displayWeather) {
		var day = new Day(title, startTime, date, displayWeather);

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
	editDayInfo: function(scheduleID, target, dayTitle, startTime, date, displayWeather) {
		// Receives information about a day to edit and the new information to insert.
		// Downloads the day, modifies it and updates it. 
		var day = getDays(scheduleID)[target];

		day.dayTitle = dayTitle;
		day.startTime = startTime;
		day.date = date;
		day.displayWeather = displayWeather;

		Meteor.call("updateDay", target, day, scheduleID);
	},
	deleteDay: function(scheduleID, target) {
		// Receives a scheduleID and a day index. Downloads the days array, removes the specified day, replaces the days array with the modified one. 

		var days = getDays(scheduleID);
		days.splice(target, 1);

		Schedules.update({"_id": scheduleID}, {$set: {"days": days}})
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
	deleteActivity: function(target, position, scheduleID) {
		if (target === "parkedActivities") {
			var pas = getParkedActivities(scheduleID);
			pas.splice(position, 1);
			Meteor.call("updateDay", target, pas, scheduleID);
		} else {
			var day = getDays(scheduleID)[target];
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

		Meteor.call("deleteActivity", oldInfo.day, oldInfo.activityIndex, scheduleID);
		Meteor.call("addActivity", newActivity, target, position, scheduleID);
	}
});