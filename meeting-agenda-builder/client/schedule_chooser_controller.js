Template.schedules.rendered = function() {
	$('#scheduleList tbody').sortable({
		helper: function(e, ui) {
			ui.children().each(function() {
				$(this).width($(this).width());
			});
			return ui;
		},
		update: function(event, ui) {
			var $this = $(this);
			var schedules = $this.sortable('toArray');

			_.each(schedules, function(scheduleID, index) {
				Meteor.call("updateSchedulePos", scheduleID, index);
			});
		}
	}).disableSelection();
};

Template.schedules.helpers({
	user: function() {
		return getUserEmail();
	},
	schedules: function() {
		if (Session.get("loggedIn")) {
			var schedules = getSchedules(Meteor.user());
			if (schedules.length > 0) Session.set("anySchedules", true);
			return schedules;
		}
	},
	numberOfDays: function() {
		return getDays(this._id).length;
	},
	numberOfActivities: function() {
		return getNumberOfActivities(this._id);
	},
	changePassword: function() {
		return Session.get("changePassword");
	}
});

Template.schedules.events({
	"click .scheduleListClickable": function() {
		openSchedule(this._id);
		return false;
	},
	"click #newSchedule": function() {
		Session.set("newScheduleModal", true);
	},
	"click .deleteSchedule": function() {
		Session.set("deleteScheduleModal", true);
		Session.set("scheduleToDelete", this);
	},
	"click #logOut": function() {
		logout();
		return false;
	},
	"click #changePassword": function() {
		Session.set("changePassword", true);
	}
});

Template.newSchedule.helpers({
	newScheduleModal: function() {
		return Session.get("newScheduleModal");
	}
});

Template.newSchedule.events({
	"click .closeNewScheduleModal": function() {
		Session.set("newScheduleModal", false);
	},
	"submit .popupForm": function(event) {
		var scheduleName = event.target.scheduleName.value;

		if (!(scheduleName === "")) {
			var position = getNumberOfSchedules(Meteor.user()._id);
			var newSchedule = new Schedule(Meteor.user()._id, position, event.target.scheduleName.value);
			try {
				if (event.target.numberOfDays.value > 99) throw new Message("Error", "Maximum number of days is 99.");

				Meteor.call("addSchedule", newSchedule, function(error, scheduleID) {
					Meteor.call("addSeveralDays", scheduleID, event.target.numberOfDays.value);
					openSchedule(scheduleID);
					if (error) throw new Message("Error", error.message);
				});

				Session.set("newScheduleModal", false);
			} catch(error) {
				messageBox(error);
			}
		} else {
			messageBox(new Message("Title required", "Schedules are required to have a title."));
		}
		
		return false;
	}
});

Template.deleteSchedule.helpers({
	deleteScheduleModal: function() {
		return Session.get("deleteScheduleModal");
	},
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
		} catch(error) {
			messageBox(error);
		}

		return false;
	}
});