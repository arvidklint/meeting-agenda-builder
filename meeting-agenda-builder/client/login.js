Session.set("anySchedules", false);

Deps.autorun(function () {
	if (Meteor.user()) Session.set("loggedIn", true);
	else Session.set("loggedIn", false);
});

Template.body.helpers({
	scheduleChosen: function() {
		if (Session.get("currentSchedule")) { // if a current schedule is set
			var currentSchedule = Schedules.findOne(Session.get("currentSchedule")); // fetch it
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
		return false;
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
	},
	"click #logOut": function() {
		logout();
		return false;
	},
	"click #changePassword": function() {
		Session.set("changePassword", true);
	}
});

Template.loginForm.rendered = function() {
	resetLoginForm();

	if (Accounts._resetPasswordToken) {
		Session.set("resetPassword", Accounts._resetPasswordToken);
	} 
}

Template.loginForm.helpers({
	loginError: function() {
		return Session.get("loginError");
	},
	loginMessage: function() {
		return Session.get("loginMessage");
	},
	createAccount: function() {
		return Session.get("createAccount");
	},
	forgotPassword: function() {
		return Session.get("forgotPassword");
	},
	resetPassword: function() {
		return Session.get("resetPassword");
	},
	newPassword: function() {
		return Session.get("newPassword");
	}
});

Template.loginForm.events({
	"submit #loginForm": function(event) {
		var email = trimInput(event.target.email.value);
		var password = event.target.password.value;
		login(email, password);

		return false;
	},
	"click #createAccount": function() {
		Session.set("createAccount", true);
		Session.set("loginError", null);
		return false;
	},
	"click #toLogin": function() {
		resetLoginForm();
		return false;
	},
	"click #forgotPassword": function() {
		Session.set("forgotPassword", true);
		Session.set("loginError", null);
		return false;
	},
	"click #cancel": function() {
		resetLoginForm();
		return false;
	},
	"submit #createAccountForm": function(event) {
		var email = trimInput(event.target.email.value);
		var password = event.target.password.value;

		try {
			validateEmail(email);
			validatePassword(password);
			createUser(email, password);
		} catch(error) {
			loginError(error);
		}

		return false;
	},
	"submit #forgotPasswordForm": function(event) {
		var email = trimInput(event.target.email.value);

		try {
			validateEmail(email);
			forgotPassword(email);
		} catch(error) {
			loginError(error);
		}

		return false;
	},
	"submit #resetPasswordForm": function(event) {
		var newPw = event.target.newPassword.value;

		try {
			validatePassword(newPw);
			resetPassword(Session.get("resetPassword"), newPw);
		} catch(error) {
			loginError(error);
		}

		return false;
	}
});

Template.schedules.helpers({
	user: function() {
		console.log(getUserEmail());
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
		return this.days.length;
	},
	editSchedules: function() {
		return Session.get("editSchedules");
	},
	anySchedules: function() {
		return Session.get("anySchedules");
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