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

Template.newSchedule.events({
	"click .closeNewScheduleModal": function() {
		Session.set("newScheduleModal", false);
	},
	"submit .popupForm": function(event) {
		var position = getNumberOfSchedules(Meteor.user()._id);
		var newSchedule = new Schedule(Meteor.user()._id, position, event.target.scheduleName.value);
		Meteor.call("addSchedule", newSchedule, function(error, scheduleID) {
			Meteor.call("addSeveralDays", scheduleID, event.target.numberOfDays.value);
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