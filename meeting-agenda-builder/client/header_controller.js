Template.header.helpers({
	scheduleTitle: function() {
		return getScheduleInfo(Session.get("currentSchedule")).scheduleTitle;
	},
	editScheduleTitle: function() {
		return Session.get("editScheduleTitle");
	},
	viewAsList: function() {
		return Session.get("viewAsList");
	}
});

Template.header.events({
	"click #toScheduleChooser": function() {
		closeSchedule();
	},
	"click #toListView": function() {
		Session.set("viewAsList", true);
	},
	"click #toScheduleView": function() {
		Session.set("viewAsList", false);
	},
	"dblclick #scheduleTitle": function() {
		Session.set("editScheduleTitle", true);
	},
	"click #editScheduleName": function() {
		Session.set("editScheduleTitle", true);
	},
	"submit #scheduleTitleForm": function(event) {
		var newName = event.target.scheduleTitle.value;
		Meteor.call("editSchedule", Session.get("currentSchedule"), newName, null);
		Session.set("editScheduleTitle", false);
		return false;
	},
	"click #addDay": function() {
		Session.set("addDayModal", true);
	}
});