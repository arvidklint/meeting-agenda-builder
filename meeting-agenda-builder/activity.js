if(Meteor.isClient) {
  Session.set("activityModal", false);

  Template.parkedActivitiesView.helpers({
    parkedActivities: function() {
      return getParkedActivities();
    }
  });

  Template.parkedActivitiesView.events({
    "click #addActivityButton": function() {
      Session.set("activityModal", true);
    }
  });

  Template.parkedActivity.events({
    "click .parkedActivityObject": function(event) {
      event.target.addClass("marked");
    }
  });

  Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("activityModal", false);
		},
		"submit .newActivity": function(event) {
			var n = event.target.name.value;
			var l = event.target.length.value;
			var t = event.target.type.value;
			var d = event.target.description.value;

			var activity = {
				name: n,
				length: l,
				type: t,
				description: d
			}

			Meteor.call("addActivity", activity, null);

			Session.set("activityModal", false);
			return false;
		}
	});

	Template.newActivityView.helpers({
		addActivityModal: function() {
			return Session.get("activityModal");
		}
	});
}
