openSchedule = function(scheduleID) {
	Session.set("currentSchedule", scheduleID);
}

closeSchedule = function() {
	Session.set("currentSchedule", null);
}

checkClickOfActivityObject = function(target) {
	if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
	else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities
	return target;
}

editActivity = function(target, activityIndex) {
	console.log(target)
	console.log(activityIndex);
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

closeChangePassword = function() {
	Session.set("changePassword", false);
	Session.set("loginError", null);
}

resetLoginForm = function() {
	Session.set("createAccount", false);
	Session.set("loginError", null);
	Session.set("forgotPassword", false);
	Session.set("resetPassword", false);
}

loginError = function(message) {
	Session.set("loginError", message);
}

login = function(email, password) {
	Meteor.loginWithPassword(email, password, function(error) {
		if (error) loginError(error.message);
		else {
			resetLoginForm();
		}
	});
}
		
logout = function() {
	closeSchedule();
	stopEditingSchedules();
	stopDeletingSchedule();
	Session.set("anySchedules", false);
	Session.set("loginError", null);
	Session.set("createAccount", false);
	resetLoginForm();

	Meteor.logout();
}