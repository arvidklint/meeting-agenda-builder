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
		}
	});

	Template.day.events({
		"change .hoursList": function(event) {
			$(event.target).parent().submit();
		},
		"change .minutesList": function(event) {
			$(event.target).parent().submit();
		},
		"submit .startTime": function(event) {
			dayNumber = parseInt(this.dayNumber);
			newTime = hmToMinutes(event.target.startHours.value, event.target.startMinutes.value);

			Meteor.call("changeStartTime", dayNumber - 1, newTime);

			return false;
		}
	})

	Template.hoursList.helpers({
		hours: function() {
			return numberList(0, 23, 1, 2);
		},
		selected: function() {
			// Returns true if this hour should be selected in the menu

			hour = minutesToHuman(Template.parentData(1).startTime).split(":")[0]; // get the day's selected hour from the parent template
			return (this == hour);
		}
	});

	Template.minutesList.helpers({
		minutes: function() {
			return numberList(0, 59, 5, 2);
		},
		selected: function() {
			// Returns true if this minute should be selected in the menu

			minute = minutesToHuman(Template.parentData(1).startTime).split(":")[1]; // get the day's selected minute from the parent template
			return (this == minute);
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

	Template.day.rendered = function() {
		// this.$('.hoursList').append(numberOptionList(0, 23, 2));
		// console.log(this.startTime);
		// this.$('.hoursList').val(this.startTime);
		// this.$('.minutesList').append(numberOptionList(0, 59, 2));


		// console.log(numberOptionList(0, 23, 2));
		// console.log(numberOptionList(0, 59, 2));
	}
}
