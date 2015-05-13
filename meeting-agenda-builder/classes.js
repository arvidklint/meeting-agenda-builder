Activity = function(scheduleID, position, parentList, title, length, type, location, description) {
	this.scheduleID = scheduleID;
	this.title = title;
	this.activityLength = length;
	this.type = type;
	this.location = location;
	this.description = description;
	this.position = position;
	this.parentList = parentList;
}

Schedule = function(userID, position, title) {
	this.owner = userID;
	this.scheduleTitle = title;
	this.position = position;
}

emptySchedule = function() {
	this.scheduleTitle = "";
	this.owner = "";
}

Day = function(scheduleID, position, title, startTime, date, displayWeather) {
	position = typeof position !== 'undefined' ? position : getNewDayPosition(scheduleID);
	title = typeof title !== 'undefined' ? title : "";
	startTime = typeof startTime !== 'undefined' ? startTime : 540;
	date = typeof date !== 'undefined' ? date : null;
	displayWeather = typeof displayWeather !== 'undefined' ? displayWeather : false;

	this.scheduleID = scheduleID;
	this.position = position;
	this.dayTitle = title;
	this.startTime = startTime;
	this.date = date;
	this.displayWeather = displayWeather;
}

SimpleDate = function(year, month, day) {
	this.year = year;
	this.month = month;
	this.day = day;
}