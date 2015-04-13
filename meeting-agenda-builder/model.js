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

getParkedActivities = function() {
	return Schedules.findOne(Session.get("currentSchedule")).parkedActivities;
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

getDays = function() {
	return Schedules.findOne(Session.get("currentSchedule")).days;
}

getScheduleInfo = function() {
	schedule = Schedules.findOne(Session.get("currentSchedule"));

	var scheduleInfo = {};

	scheduleInfo["id"] = schedule._id;
	scheduleInfo["scheduleTitle"] = schedule.scheduleTitle;
	scheduleInfo["owner"] = schedule.owner;

	return scheduleInfo;
}

makeActivityObject = function(title, length, type, location, description) {
	return {
		"title": title,
		"activityLength": length,
		"type": type,
		"location": location,
		"description": description
	}
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

Meteor.methods({
	addDay: function(startH, startM) {
		var day = {
			startTime: 540,
			activities: []
		}

		Schedules.update( {"_id": Session.get("currentSchedule")}, { $push: {days: day}} )
	},
	addActivity: function(activity, target, position) {
		if (target == "parkedActivities") {
			pas = getParkedActivities();
			pas.splice(position, 0, activity);
			Schedules.update( {"_id": Session.get("currentSchedule")}, { $set: {parkedActivities: pas} });
		} else {
			day = getDays()[target]; // get the whole day
			day.activities.push(activity);

			var formattedInfo = {};
			formattedInfo["days." + target] = day; // create dict with a key named days[target] and push the new day (a necessary trick)

			Schedules.update( {"_id": Session.get("currentSchedule")}, { $set: formattedInfo }) // reupload the whole day
		};
	},
	removeActivity: function(position) {
		pas = getParkedActivities();
		pas.splice(position, 1);
		Schedules.update( {"_id": Session.get("currentSchedule")}, { $set: {parkedActivities: pas} });
	},
	changeStartTime: function(position, newTime) {
		day = Schedules.findOne(Session.get("currentSchedule")).days[position]; // get the day
		day.startTime = newTime; // modify the day's start time

		var formattedInfo = {};
		formattedInfo["days." + position] = day; // create dict with a key named days[target] and push the new day (a necessary trick)

		Schedules.update( {"_id": Session.get("currentSchedule")}, { $set: formattedInfo }); // replace the whole day (the only way unfortunately)
	},
	moveActivity: function(target, startPos, endPos) {
		if (target == "parkedActivities") {
			var pas = getParkedActivities();
			var activity = pas[startPos];
			pas.splice(startPos, 1);
			if (endPos >= pas.length) {
				pas.push(activity);
			} else {
				pas.splice(endPos, 0, activity);
			}
			
			
			for (var i = 0; i < pas.length; i++) {
				console.log(i + " titel: " + pas[i].title);
			}
			Schedules.update( {"_id": Session.get("currentSchedule")}, {$set: {parkedActivities: pas} });
		}
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
