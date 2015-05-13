Template.messageBox.helpers({
	message: function() {
		return Session.get("message");
	},
	messageTitle: function() {
		return Session.get("message").messageTitle;
	},
	messageDescription: function() {
		return Session.get("message").messageDescription;
	}
});

Template.messageBox.events({
	"click .closeMessageBox": function() {
		closeMessageBox();
		return false;
	}
});