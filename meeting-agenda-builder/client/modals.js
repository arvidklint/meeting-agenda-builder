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
		var target = event.target.target.value;
		var description = event.target.description.value;

		var length = hmToMinutes(lengthH, lengthM);

		if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

		var newActivity = new Activity(title, length, type, location, description);
		Meteor.call("addActivity", newActivity, target, null, Session.get("currentSchedule"));

		Session.set("activityModal", false);
		return false;
	}
});

Template.editActivityView.helpers({
	editActivityModal: function() {
		return Session.get("editActivityModal");
	},
	activity: function() {
		var currentActivity = getActivity(Session.get("currentSchedule"), Session.get("activityBeingEdited").day, Session.get("activityBeingEdited").activityIndex);

		// Write some of the info to Session, so that it is accessible by other helpers without having to access the database again
		var activityInfo = Session.get("activityBeingEdited");
		activityInfo["activityLengthHM"] = minutesToHuman(currentActivity.activityLength).split(":");
		activityInfo["type"] = currentActivity.type;
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
		var target = event.target.target.value;
		var description = event.target.description.value;
		var position = Session.get("activityBeingEdited").activityIndex;

		if (target != "parkedActivities") target--;

		modifiedActivity = new Activity(title, length, type, location, description);

		Meteor.call("modifyActivity", modifiedActivity, target, position, Session.get("activityBeingEdited"), Session.get("currentSchedule"));
		stopEditingActivity();

		return false;
	},
	"click #cancel": function() {
		Session.set("deleteActivityModal", false);
		return false;
	}, 
	"click #delete2": function() {
		var activity = Session.get("activityBeingEdited");
		Meteor.call("deleteActivity", activity.day, activity.activityIndex, Session.get("currentSchedule"));
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

		console.log(Session.get("currentSchedule"));

		//if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

		Meteor.call("addDay", Session.get("currentSchedule"), title, startTime, date, displayWeather);
		//Meteor.call("addActivity", newActivity, target, 0, Session.get("currentSchedule"));

		stopAddingDay();

		Meteor.flush();
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
		return Session.get("dayBeingEdited").dayNumber;
	}
});

Template.editDayView.events({
	"click .popupHeader_button": function() {
		stopEditingDay();
	},
	"submit .popupForm": function(event) {
		var target = parseInt(Session.get("dayBeingEdited").dayNumber) - 1;
		var dayTitle = event.target.dayTitle.value;
		var startTime = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);

		if (event.target.dateCheckbox.checked) {
			var date = new SimpleDate(event.target.dateYear.value, event.target.dateMonth.value, event.target.dateDay.value);
			if (event.target.weatherCheckbox.checked) {
				var displayWeather = true;
			} else {
				var displayWeather = false;
			}
		}
		else var date = null;

		Meteor.call("editDayInfo", Session.get("currentSchedule"), target, dayTitle, startTime, date, displayWeather);
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
		Meteor.call("deleteDay", Session.get("currentSchedule"), parseInt(Session.get("dayBeingEdited").dayNumber) - 1);
		stopEditingDay();
		return false;
	}
});