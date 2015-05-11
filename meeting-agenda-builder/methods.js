Meteor.methods({
	addSchedule: function(schedule) {
		var scheduleID = Schedules.insert(schedule);
		return scheduleID;
	},
	deleteSchedule: function(scheduleID) {
		var schedule = Schedules.findOne(scheduleID);

		if (schedule.owner === Meteor.user()._id) {
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
	addDay: function(day) {
		Days.insert(day);
	},
	updateDay: function(dayID, day) {
		Days.update({'_id': dayID}, {$set: {
			'dayTitle': day.dayTitle,
			'startTime': day.startTime,
			'date': day.date,
			'displayWeather': day.displayWeather
		}});
	},
	updateDayPos: function(dayID, position) {
		Days.update({'_id': dayID}, {$set: {'position': position}});
	},
	// editDayInfo: function(scheduleID, target, dayTitle, startTime, date, displayWeather) {
	// 	// Receives information about a day to edit and the new information to insert.
	// 	// Downloads the day, modifies it and updates it. 
	// 	var day = getDays(scheduleID)[target];

	// 	day.dayTitle = dayTitle;
	// 	day.startTime = startTime;
	// 	day.date = date;
	// 	day.displayWeather = displayWeather;

	// 	Meteor.call("updateDay", target, day, scheduleID);
	// },
	deleteDay: function(dayID) {
		Days.remove({'_id': dayID});
	},
	addActivity: function(activity) {
		Activities.insert(activity);
	},
	deleteActivity: function(activityID) {
		Activities.remove({'_id': activityID});
	},
	changeStartTime: function(dayID, newTime) {
		Days.update({'_id': dayID}, {$set: {'startTime': newTime}});
	},
	updateActivityPos: function(activityID, parentList, index) {
		Activities.update({"_id": activityID}, {$set: {"parentList": parentList, "position": index}})
	},
	modifyActivity: function(activityID, activity) {
		Activities.update({'_id':activityID}, {$set: {
													'title': activity.title,
													'activityLength': activity.activityLength,
													'type': activity.type,
													'location': activity.location,
													'description': activity.description,
													'parentList': activity.parentList
												}
											}
		);
	}
});















