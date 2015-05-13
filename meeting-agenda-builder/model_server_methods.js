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
			throw new Message("Error", "You are not the owner of the schedule \"" + schedule.scheduleTitle + "\" and can therefore not delete it.");
		}
	},
	editSchedule: function(scheduleID, newTitle, numDays) {
		if (newTitle) {
			Schedules.update( {"_id": scheduleID}, {$set: {'scheduleTitle': newTitle}} );
		}
	},
	updateSchedulePos: function(scheduleID, position) {
		Schedules.update({'_id': scheduleID}, {$set: {'position': position}});
	},
	addDay: function(day) {
		Days.insert(day);
	},
	addSeveralDays: function(scheduleID, numDays) {
		for (var i = 0; i < numDays; i++) {
			Meteor.call("addDay", new Day(scheduleID));
		}
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
	},
	getWeather: function (query) {
		return Meteor.http.get(query);
	}
});
