Session.set("anySchedules", false);

Deps.autorun(function () {
	if (Meteor.user()) Session.set("loggedIn", true);
	else Session.set("loggedIn", false);
});

Template.body.helpers({
	scheduleChosen: function() {
		if (Session.get("currentSchedule")) { // if a current schedule is set
			currentSchedule = Schedules.findOne(Session.get("currentSchedule")); // fetch it
			if (currentSchedule.owner === Meteor.user()._id) return true; // return true if the logged in user owns it
		} 
		else return false; // results in the loginview showing instead of a schedule
	}
});

Template.loginView.rendered = function() {
	Session.set("editSchedules", false);
}

Template.loginView.helpers({
	loggedIn: function() {
		return Session.get("loggedIn");
	},
	newScheduleModal: function() {
		return Session.get("newScheduleModal");
	},
	deleteScheduleModal: function() {
		return Session.get("deleteScheduleModal");
	}
});

Template.loginView.events({
	"click .scheduleListClickable": function() {
		openSchedule(this._id);
	},
	"click #newSchedule": function() {
		Session.set("newScheduleModal", true);
	}, 
	"click #editSchedules": function() {
		Session.set("editSchedules", true);
	},
	"click #stopEditing": function() {
		Session.set("editSchedules", false);
	},
	"click .deleteSchedule": function() {
		Session.set("deleteScheduleModal", true);
		Session.set("scheduleToDelete", this);
	}
});

Template.schedules.helpers({
	schedules: function() {
		var schedules = getSchedules(Meteor.user());
		if (schedules.length > 0) Session.set("anySchedules", true);
		return schedules;
	},
	numberOfDays: function() {
		return this.days.length;
	},
	editSchedules: function() {
		return Session.get("editSchedules");
	},
	anySchedules: function() {
		return Session.get("anySchedules");
	}
});

Template.schedules.onDestroyed(function() {
	logout();
});

Template.newSchedule.events({
	"click .closeNewScheduleModal": function() {
		Session.set("newScheduleModal", false);
	},
	"submit .popupForm": function(event) {
		Meteor.call("addSchedule", Meteor.user()._id, event.target.scheduleName.value, event.target.numberOfDays.value, function(error, scheduleID) {
			openSchedule(scheduleID);
		});
		Session.set("newScheduleModal", false);

		return false;
	}
});

Template.deleteSchedule.helpers({
	scheduleTitle: function() {
		return Session.get("scheduleToDelete").scheduleTitle;
	},
	numDays: function() {
		return Session.get("scheduleToDelete").days.length;
	}
});

Template.deleteSchedule.events({
	"click .closeDeleteScheduleModal": function() {
		stopDeletingSchedule();
		return false;
	},
	"submit .popupForm": function() {
		try {
			Meteor.call("deleteSchedule", Session.get("scheduleToDelete")._id);
			stopDeletingSchedule();
		} catch(e) {
			alert(e.message);
		}

		return false;
	}
});