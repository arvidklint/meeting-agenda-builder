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
	date = typeof date !== 'undefined' ? date : null;

	this.dayTitle = title;
	this.startTime = startTime;
	this.activities = [];
	this.date = date;
}

SimpleDate = function(year, month, day) {
	this.year = year;
	this.month = month;
	this.day = day;
}

activityTypes = [
	{"value": "presentation", "name": "Presentation"},
	{"value": "group_work", "name": "Group work"},
	{"value": "discussion", "name": "Discussion"},
	{"value": "break", "name": "Break"}
];