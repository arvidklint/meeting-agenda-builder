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
});

Template.timeSelectors.helpers({
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
			if (this == Session.get("activityBeingEdited").activityLengthHM[0]) return true;
		} else if (Session.get("addDayModal")) {
			if (this == "09") return true;
		} else if (Session.get("editDayModal")) {
			if (this == Session.get("dayBeingEdited").startTimeHM[0]) return true;
		}
	},
	selectedMinute: function() {
		if (Session.get("activityModal")) {
			if (this == "45") return true;
		} else if (Session.get("editActivityModal")) {
			if (this == Session.get("activityBeingEdited").activityLengthHM[1]) return true;
		} else if (Session.get("addDayModal")) {
			if (this == "00") return true;
		} else if (Session.get("editDayModal")) {
			if (this == Session.get("dayBeingEdited").startTimeHM[1]) return true;
		}
	}
});

Template.dateSelectors.helpers({
	years: function() {
		return numberList(1899, getCurrentYear(), 1, 4);
	},
	months: function() {
		return numberList(1, 12, 1, 2);
	},
	days: function() {
		return numberList(1, 31, 1, 2);
	},
	selectedYear: function() {
		if (Session.get("activityModal") || Session.get("addDayModal")) { // in edit activity modal and in add day modal
			if (this == getCurrentYear()) return true; // select current year
		} else if (Session.get("editDayModal")) { // in edit day modal
			if (Session.get("dayBeingEdited").date) { // if the day currently has a date
				if (this == Session.get("dayBeingEdited").date.year) return true // select it
			} else {
				if (this == getCurrentYear()) return true; // select current year
			}
		}
	},
	selectedMonth: function() {
		if (Session.get("activityModal") || Session.get("addDayModal")) {
			if (this == getCurrentMonth()) return true;
		}  else if (Session.get("editDayModal")) {
			if (Session.get("dayBeingEdited").date) { // if the day currently has a date
				if (this == Session.get("dayBeingEdited").date.month) return true
			} else {
				if (this == getCurrentMonth()) return true;
			}
		}
	},
	selectedDay: function() {
		if (Session.get("activityModal") || Session.get("addDayModal")) {
			if (this == getCurrentDay()) return true;
		} else if (Session.get("editDayModal")) {
			if (Session.get("dayBeingEdited").date) {
				if (this == Session.get("dayBeingEdited").date.day) return true
			} else {
				if (this == getCurrentDay()) return true;
			}
		}
	},
	addDate: function() {
		return Session.get("addDate");
	},
	displayWeather: function() {
		return Session.get("dayBeingEdited").displayWeather;
	}
});

Template.dateSelectors.events({
	"change .dateCheckbox": function(event) {
		Session.set("addDate", event.target.checked);
	},
	"change weatherCheckbox": function(event) {
		Session.set("addWeather", event.target.checked);
	}
});