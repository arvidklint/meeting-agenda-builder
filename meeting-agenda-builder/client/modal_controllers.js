Template.newActivityView.helpers({
	addActivityModal: function() {
		return Session.get("activityModal");
	}
});

Template.newActivityView.events({
	"click #closeModal": function() {
		Session.set("activityModal", false);
	},
	"submit .newActivity": function(event) {
		var title = event.target.title.value;
		var location = event.target.location.value;
		var lengthH = event.target.lengthH.value;
		var lengthM = event.target.lengthM.value;
		var type = event.target.type.value;
		var parentList = event.target.target.value;
		var description = event.target.description.value;
		var length = hmToMinutes(lengthH, lengthM);

		var position = getNewActivityPosition(Session.get("currentSchedule"), parentList);

		//scheduleID, position, parentList, title, length, type, location, description
		var newActivity = new Activity(Session.get("currentSchedule"), position, parentList, title, length, type, location, description);
		Meteor.call("addActivity", newActivity);

		Session.set("activityModal", false);
		return false;
	}
});

Template.editActivityView.helpers({
	editActivityModal: function() {
		return Session.get("editActivityModal");
	},
	activity: function() {
		var currentActivity = Session.get("activityBeingEdited");

		// Write some of the info to Session, so that it is accessible by other helpers without having to access the database again
		var activityInfo = currentActivity;
		activityInfo["activityLengthHM"] = minutesToHuman(currentActivity.activityLength).split(":");
		Session.set("activityBeingEdited", activityInfo);

		return currentActivity;
	},
	deleteActivityModal: function() {
		return Session.get("deleteActivityModal");
	}
});

Template.editActivityView.events({
	"click .popupHeader_button": function() {
		stopEditingActivity();
	},
	"click #delete1": function() {
		Session.set("deleteActivityModal", true);
		return false;
	},
	"submit #editActivityForm": function(event, ui) {
		var title = event.target.title.value;
		var location = event.target.location.value;
		var length = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);
		var type = event.target.type.value;
		var parentList = event.target.target.value;
		var description = event.target.description.value;
		var position = Session.get("activityBeingEdited").position;

		var modifiedActivity = new Activity(Session.get("currentSchedule"), position, parentList, title, length, type, location, description);

		Meteor.call("modifyActivity", Session.get("activityBeingEdited")._id, modifiedActivity);
		stopEditingActivity();

		return false;
	},
	"click #cancel": function() {
		Session.set("deleteActivityModal", false);
		return false;
	}, 
	"click #delete2": function() {
		var activityID = Session.get("activityBeingEdited")._id;
		Meteor.call("deleteActivity", activityID, function(err, data) {
			var parentList = $('#' + activityID).parent().attr('id');
			updateActivitiesPosition(parentList);
		});
		stopEditingActivity();
		return false;
	},
	"submit #deleteForm": function() {
		return false;
	}
});

Template.newDayView.helpers({
	addDayModal: function() {
		return Session.get("addDayModal");
	}
});

Template.newDayView.events({
	"click #closeModal": function() {
		stopAddingDay();
	},
	"submit #addNewDay": function(event) {
		var title = event.target.dayTitle.value;

		var startTimeH = event.target.lengthH.value;
		var startTimeM = event.target.lengthM.value;

		var startTime = hmToMinutes(startTimeH, startTimeM);

		if(event.target.dateCheckbox.checked) {
			var date = new SimpleDate(event.target.dateYear.value, event.target.dateMonth.value, event.target.dateDay.value);
			if (event.target.weatherCheckbox.checked) {
				var displayWeather = true;
			} else {
				var displayWeather = false;
			}
		} else {
			var date = null;
		}

		var position = getNewDayPosition(Session.get("currentSchedule"));
		console.log("position" + position);

		var newDay = new Day(Session.get("currentSchedule"), position, title, startTime, date, displayWeather);

		Meteor.call("addDay", newDay);

		stopAddingDay();

		return false;
	}
});

Template.editDayView.helpers({
	editDayModal: function() {
		return Session.get("editDayModal");
	}, 
	deleteDayModal: function() {
		return Session.get("deleteDayModal");
	},
	day: function() {
		return Session.get("dayBeingEdited");
	},
	dayNumber: function() {
		return Session.get("dayBeingEdited").position + 1;
	}
});

Template.editDayView.events({
	"click .popupHeader_button": function() {
		stopEditingDay();
	},
	"submit .popupForm": function(event) {
		var dayID = Session.get("dayBeingEdited")._id;
		var dayTitle = event.target.dayTitle.value;
		var startTime = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);
		var position = Session.get("dayBeingEdited").position;

		if (event.target.dateCheckbox.checked) {
			var date = new SimpleDate(event.target.dateYear.value, event.target.dateMonth.value, event.target.dateDay.value);
			if (event.target.weatherCheckbox.checked) {
				var displayWeather = true;
			} else {
				var displayWeather = false;
			}
		} else {
			var date = null;
		}

		var modifiedDay = new Day(Session.get("currentSchedule"), position, dayTitle, startTime, date, displayWeather);

		Meteor.call("updateDay", dayID, modifiedDay);
		stopEditingDay();
		return false;
	},
	"click #delete1": function() {
		Session.set("deleteDayModal", true);
		return false;
	},
	"click #cancelDelete": function() {
		Session.set("deleteDayModal", false);
		return false;
	},
	"click #delete2": function() {
		Meteor.call("deleteDay", Session.get("dayBeingEdited")._id, function(err, data) {
			updateDaysPosition();
		});
		stopEditingDay();
		return false;
	}
});

Template.changePasswordView.rendered = function() {
	Session.set("loginError", null);
}

Template.changePasswordView.helpers({
	loginError: function() {
		return Session.get("loginError");
	}
});

Template.changePasswordView.events({
	"click .popupHeader_button": function() {
		closeChangePassword();
	},
	"submit #changePasswordForm": function(event) {
		var oldPassword = event.target.oldPassword.value;
		var newPassword1 = event.target.newPassword1.value;
		var newPassword2 = event.target.newPassword2.value;
		Session.set("loginError", null);

		try {
			if (!(newPassword1 === newPassword2)) throw "The new passwords do not match";
			validatePassword(newPassword1);
			changePassword(oldPassword, newPassword1);
		} catch(error) {
			loginError(error);
		}

		return false;
	}
});

Template.diagramExplanationModal.helpers({
	diagramExplanation: function() {
		return Session.get("diagramExplanation");
	}
});

Template.diagramExplanationModal.events({
	"click .closeExplanation": function() {
		closeDiagramExplanation();
		return false;
	}
});