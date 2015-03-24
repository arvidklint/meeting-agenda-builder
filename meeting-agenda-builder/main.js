if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.daysView.helpers({
		days: function() {
			days = getDays();
			days = addActivityStartTimes(days);
			return days;
		}
	});

	Template.daysView.events({
		"click #addDay": function() {
			Meteor.call("addDay");
		}
	});

	Template.day.helpers({
		startTimeHuman: function() {
			return this.startTime + 10;
		}
	});

	Template.mainFrame.rendered = function() {
		console.log("renderat");
		this.$('#parkedActivities').sortable({
			start: function(e, ui) {
				startIndex = ui.item.index();
			},
			stop: function(e, ui) {
				endIndex = ui.item.index();
				console.log("StartIndex: " + startIndex);
				console.log("EndIndex: " + endIndex);
				el = ui.item.get(0);

				activity = Blaze.getData(el);

				// if(startIndex < endIndex) {
				// 	endIndex -= 1;
				// }

				Meteor.call("removeActivity", startIndex);
				Meteor.call("addActivity", activity, null, endIndex);
			}
		});
		this.$('#parkedActivities').disableSelection();
	};
}
