if (Meteor.isClient) {
	Session.set("activityModal", false);

	Template.newActivityView.helpers({
		addActivityModal: function() {
			return Session.get("activityModal");
		}
	});

	Template.lengthSelectors.helpers({
		hours: function() {
			return numberList(0, 23, 1, 2);
		},
		minutes: function() {
			return numberList(0, 59, 5, 2);
		},
		selectedHour: function() {
			if (Session.get("activityModal")) {
				if (this == "00") return true;
			} else if (Session.get("editActivityModal")) {
				if (this == Session.get("activityBeingEdited").activityLengthHM[0]) return true
			}
		},
		selectedMinute: function() {
			if (Session.get("activityModal")) {
				if (this == "45") return true;
			} else if (Session.get("editActivityModal")) {
				if (this == Session.get("activityBeingEdited").activityLengthHM[1]) return true;
			}
		}
	});

	Template.activityTypeSelector.helpers({
		activityTypes: function() {
			return [
				{"value": "presentation", "name": "Presentation"},
				{"value": "group_work", "name": "Group work"},
				{"value": "discussion", "name": "Discussion"},
				{"value": "break", "name": "Break"}
			];
		},
		selectedType: function() {
			if (Session.get("activityModal")) {
				if (this.value == "presentation") return true;
			} else if (Session.get("editActivityModal")) {
				if (this.value == Session.get("activityBeingEdited").type) return true;
			}
		}
	});

	Template.placementSelector.helpers({
		days: function() {
			var days = getDays(Session.get("currentSchedule"));
			var days = addDayNumbers(days);
			return days;
		},
		selectedPlacement: function() {
			if (Session.get("activityModal")) {
				return false;
			} else if (Session.get("editActivityModal")) {
				if (this.dayNumber == (parseInt(Session.get("activityBeingEdited").day) + 1)) return true;
			}
		}
	})

	Template.newActivityView.events({
		"click #closeModal": function() {
			Session.set("activityModal", false);
		},
		"submit .newActivity": function(event) {
			var title = event.target.title.value;
			var location = event.target.location.value;
			var lengthH = event.target.lengthH.value;
			var lengthM = event.target.lengthM.value;
			var type = event.target.type.value;
			var target = event.target.target.value;
			var description = event.target.description.value;

			// var biggestID = getBiggestValueID(target);
			// var newID = biggestID + 1;

			// var listPos = getListPos(target);
			// var topPos = removeActivity(target) + listPos.top;
			// var leftPos = listPos.left + MARGIN_ACTIVITY_LEFT;

			var length = hmToMinutes(lengthH, lengthM);

			if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

			var newActivity = new Activity(title, length, type, location, description);
			Meteor.call("addActivity", newActivity, target, 0, Session.get("currentSchedule"));

			Session.set("activityModal", false);
			return false;
		}
	});

	Template.activity.helpers({
		startTimeHuman: function() {
			return minutesToHuman(this.activityStart);
		},
		activityHeight: function() {
			return getActivityHeight(this);
		},
		tooShort: function() {
			if (this.activityLength < 30) {
				return "tooShort";
			}
		},
		activityStartSet: function() {
			if (this.activityStart != null) return true;
			else return false;
		},
		leftPos: function() {
			return this.leftPos;
		},
		topPos: function() {
			return this.topPos;
		},
		activityID: function() {
			return this.activityID;
		},
		target: function() {
			return this.targetList;
		}
	});

	Template.activity.events({
		"hover .activityObject": function(event) {
			// Här är det tänkt att jag ska implementera att redigera knappen bara visas när man pekar på en aktivitet
		},
		"click .editActivity": function(event, ui) {
			var day = event.target.parentElement.parentElement.parentElement.id;

			if (day !== "parkedActivities") {
				day = parseInt(day.substr(4)) - 1; // convert "day_<dayNumber>" into day index
			}

			var activityIndex = parseInt(this.activityNumber) - 1;

			Session.set("editActivityModal", true);
			Session.set("activityBeingEdited", {"day": day, "activityIndex": activityIndex});
		}
	});

	Template.editActivityView.helpers({
		editActivityModal: function() {
			return Session.get("editActivityModal");
		},
		activity: function() {
			var currentActivity = getActivity(Session.get("currentSchedule"), Session.get("activityBeingEdited").day, Session.get("activityBeingEdited").activityIndex);

			// Write some of the info to Session, so that it is accessible by other helpers without having to access the database again
			var activityInfo = Session.get("activityBeingEdited");
			activityInfo["activityLengthHM"] = minutesToHuman(currentActivity.activityLength).split(":");
			activityInfo["type"] = currentActivity.type;
			Session.set("activityBeingEdited", activityInfo);

			return currentActivity;
		}
	});

	Template.editActivityView.events({
		"click .popupHeader_button": function() {
			Session.set("editActivityModal", false);
			Session.set("activityBeingEdited", null);
		},
		"submit .popupForm": function(event, ui) {
			var title = event.target.title.value;
			var location = event.target.location.value;
			var length = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);
			var type = event.target.type.value;
			var target = event.target.target.value;
			var description = event.target.description.value;

			if (target != "parkedActivities") target--;

			modifiedActivity = new Activity(title, length, type, location, description);

			Meteor.call("modifyActivity", modifiedActivity, Session.get("activityBeingEdited"), Session.get("currentSchedule"));

			return false;
		}
	})
}
