if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Template.scheduleTitle.helpers({
		scheduleTitle: function() {
			return getScheduleInfo().scheduleTitle;
		}
	})

	Template.daysView.helpers({
		days: function() {
			days = getDays();
			days = addActivityStartTimes(days);
			days = addDayNumbers(days);
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
			return minutesToHuman(this.startTime);
		},
		dayNumber: function() {
			return this.dayNumber;
		},
		dayLength: function() {
			return minutesToHuman(dayLength(this));
		},
		dayEnd: function() {
			return minutesToHuman(this.startTime + dayLength(this));
		},
		hoursList: function() {
			htmlString = '<option value="jag">jag</option>';

			return htmlString;
		}
	});

	Template.mainFrame.rendered = function() {
		console.log("renderat");
		this.$('#parkedActivities').sortable({
			stop: function(e, ui) {
				el = ui.item.get(0);
				before = ui.item.prev().get(0);
				after = ui.item.next().get(0);

				if (!before) {
					newRank = 0;
				} else {
					newRank = parseInt(Blaze.getData(before).rank);
				}
				oldRank = parseInt(Blaze.getData(el).rank);

				Meteor.call("setActivityRank", oldRank, newRank);
			}
		});
		this.$('#parkedActivities').disableSelection();
	};
}
