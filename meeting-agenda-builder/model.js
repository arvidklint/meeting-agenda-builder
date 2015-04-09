var ActivityType = ["presentation","group_work","discussion","break"]

Schedules = new Mongo.Collection("schedules");

// Main model functions

queryID = "7brtTuz4yWDtKtS4Z";

getParkedActivities = function() {
	array = Schedules.findOne(queryID).parkedActivities;
	sortedArray = sortArrayByProperty(array, "rank");
	highestRank = parseInt(sortedArray[sortedArray.length-1].rank);
	console.log(highestRank);
	return sortedArray;
}

sortArrayByProperty = function(array, property) {
	return array.sort(dynamicSort(property));
}

function dynamicSort(property) {
	return function (a,b) {
		if (a[property] < b[property])
			return -1;
		if (a[property] > b[property])
			return 1;
		return 0;
	}
}

getDays = function() {
	return Schedules.findOne(queryID).days;
}

getScheduleInfo = function() {
	schedule = Schedules.findOne(queryID);

	var scheduleInfo = {};

	scheduleInfo["id"] = schedule._id;
	scheduleInfo["scheduleTitle"] = schedule.scheduleTitle;
	scheduleInfo["owner"] = schedule.owner;

	return scheduleInfo;
}

makeActivityObject = function(title, name, length, type, description) {
	if(highestRank == null) {
		highestRank = -1;
	}
	return {
		"rank": highestRank + 1,
		"title": title,
		"name": name,
		"activityLength": length,
		"type": type,
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

zeroPadding = function(num, size) {
	while (num.length < size) {
		num = "0" + num;
	}

	return num;
}


Meteor.methods({
	addDay: function(startH, startM) {
		var day = {
			startTime: 0,
			activities: []
		}

		Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $push: {days: day}} )
	},
	addActivity: function(activity, day, position) {
		if (position === null) {
			Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $push: {parkedActivities: activity} } );
		} else {
			pas = getParkedActivities();
			pas.splice(position, 0, activity);
			Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $set: {parkedActivities: pas} });
		}
	},
	removeActivity: function(position) {
		var pas = getParkedActivities();
		pas.splice(position, 1);
		Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $set: {parkedActivities: pas} });
	},
	setActivityRank: function(oldRank, newRank) {
		var pas = getParkedActivities();

		// Eftersom pas redan är sorterad kan vi använda oldRank som index
		var movingElement = pas.splice(oldRank, 1);

		for (var i = oldRank; i < pas.length; i++) {
			pas[i].rank = parseInt(pas[i].rank) - 1;
		}

		pas.splice(newRank, 0, movingElement);

		for (var i = newRank + 1; i < pas.length; i++) {
			pas[i].rank = parseInt(pas[i].rank + 1);
		}

		Schedules.update( {"_id": "7brtTuz4yWDtKtS4Z"}, { $set: {parkedActivities: pas} });
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
