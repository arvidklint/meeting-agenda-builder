if (Meteor.isClient) {
	Session.set("activityModal", false);

	Template.newActivityView.helpers({
		addActivityModal: function() {
			return Session.get("activityModal");
		}
	});	

	Template.activityTypeSelector.helpers({
		activityTypes: function() {
			return activityTypes;
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
	});

	Template.placementSelector.events({
		"change target": function() {
			//
		}
	})

	Template.orderSelector.helpers({
		items: function() {
			if (Session.get("activityModal")) {
				if (Session.get("chosenTarget") === "parkedActivities") {
					var length = getParkedActivities(Session.get("currentSchedule")).length;
				}
				// console.log(numberList(1, length + 1, 1));
				return numberList(1, length + 1, 1);
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

			var length = hmToMinutes(lengthH, lengthM);

			if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

			var newActivity = new Activity(title, length, type, location, description);
			Meteor.call("addActivity", newActivity, target, null, Session.get("currentSchedule"));

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
		"click .editActivity": function() {
			var target = Template.parentData(1);
			if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
			else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

			var activityIndex = parseInt(this.activityNumber) - 1;

			editActivity(target, activityIndex);
		},
		"dblclick .activityObject": function() {
			var target = Template.parentData(1);
			if (target) target = parseInt(target.dayNumber) - 1; // If any parent data exists, we are inside a day. The target is then the dayIndex (dayNumber - 1)
			else target = "parkedActivities"; // If no parent data exists, we are inside of parkedActivities

			var activityIndex = parseInt(this.activityNumber) - 1;

			editActivity(target, activityIndex);
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
			stopEditingActivity();
		},
		"submit .popupForm": function(event, ui) {
			var title = event.target.title.value;
			var location = event.target.location.value;
			var length = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);
			var type = event.target.type.value;
			var target = event.target.target.value;
			var description = event.target.description.value;
			var position = Session.get("activityBeingEdited").activityIndex;

			if (target != "parkedActivities") target--;

			modifiedActivity = new Activity(title, length, type, location, description);

			Meteor.call("modifyActivity", modifiedActivity, target, position, Session.get("activityBeingEdited"), Session.get("currentSchedule"));
			stopEditingActivity();

			return false;
		}
	})
}
