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

