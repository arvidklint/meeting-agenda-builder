console.log("Dokumentet körs");

if (Meteor.isClient) {
	Deps.autorun(function () {
		if (Meteor.user()) Session.set("loggedIn", true);
		else Session.set("loggedIn", false);
	});

	Template.body.helpers({
		scheduleChosen: function() {
			if (Session.get("currentSchedule")) { // if a current schedule is set
				currentSchedule = Schedules.findOne(Session.get("currentSchedule")); // fetch it
				if (currentSchedule.owner == Meteor.user()._id) return true; // return true if the logged in user owns it
			} 
			else return false; // results in the loginview showing instead of a schedule
		}
	});

	Template.loginView.helpers({
		loggedIn: function() {
			return Session.get("loggedIn");
		}
	});

	Template.loginView.events({
		"click .scheduleListItem": function() {
			Session.set("currentSchedule", this._id);
			console.log("Satte currentSchedule till: " + Session.get("currentSchedule"));
		}
	})

	Template.schedules.helpers({
		schedules: function() {
			return getSchedules(Meteor.user());
		}
	})
}

