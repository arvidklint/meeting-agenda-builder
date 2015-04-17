if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Session.set("showPas", true);
	Session.set("addDayModal", false);

	Template.mainFrame.helpers({
		viewAsList: function() {
			return Session.get("viewAsList");
		}
	});

	Template.scheduleTitle.helpers({
		scheduleTitle: function() {
			return getScheduleInfo(Session.get("currentSchedule")).scheduleTitle;
		},
		editScheduleTitle: function() {
			return Session.get("editScheduleTitle");
		},
		viewAsList: function() {
			return Session.get("viewAsList");
		}
	});

	Template.scheduleTitle.events({
		"click #toScheduleChooser": function() {
			Session.set("currentSchedule", null);
		},
		"click #toListView": function() {
			Session.set("viewAsList", true);
		},
		"click #toScheduleView": function() {
			Session.set("viewAsList", false);
		},
		"dblclick #scheduleTitle": function() {
			Session.set("editScheduleTitle", true);
		},
		"submit #scheduleTitleForm": function(event) {
			newName = event.target.scheduleTitle.value;
			Meteor.call("editSchedule", Session.get("currentSchedule"), newName, null);
			Session.set("editScheduleTitle", false);
			return false;
		}
	});

	Template.daysView.helpers({
		days: function() {
			days = getDays(Session.get("currentSchedule"));
			days = addActivityStartTimes(days);
			days = addDayNumbers(days);

			for (var i in days) {
				days[i]["activities"] = addActivityNumbers(days[i]["activities"]);
			}

			return days;
		}
	});

	Template.daysView.events({
		"click #addDay": function() {
			Session.set("addDayModal", true);
		}
	});

	Template.newDayView.helpers({
		addDayModal: function() {
			return Session.get("addDayModal");
		}
	});

	Template.newDayView.events({
		"click #closeModal": function() {
			stopAddingDay();
		},
		"submit #addNewDay": function(event) {
			var title = event.target.dayTitle.value;

			var startTimeH = event.target.lengthH.value;
			var startTimeM = event.target.lengthM.value;

			var startTime = hmToMinutes(startTimeH, startTimeM);

			if(event.target.dateCheckbox.checked) {
				var date = new SimpleDate(event.target.dateYear.value, event.target.dateMonth.value, event.target.dateDay.value);
			} else {
				var date = null;
			}

			console.log(Session.get("currentSchedule"));

			//if (target != "parkedActivities") target--; // the page number is human readable but now index must start at 0

			Meteor.call("addDay", Session.get("currentSchedule"), title, startTime, date);
			//Meteor.call("addActivity", newActivity, target, 0, Session.get("currentSchedule"));

			stopAddingDay();

			Meteor.flush();
			return false;
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
		}
	});

	Template.dateSelectors.events({
		"change .dateCheckbox": function(event) {
			Session.set("addDate", event.target.checked);
		},
	});

	Template.parkedActivitiesView.helpers({
		parkedActivities: function() {
			var pas = getParkedActivities(Session.get("currentSchedule"));
			pas = addActivityNumbers(pas);

			return pas;
		}
	});

	Template.parkedActivitiesView.events({
		"click #addActivityButton": function() {
			Session.set("activityModal", true);
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
		addWeather: function() {
			if(this.date && Session.get("weather")) {
				if(dayInWeatherRange(this.date)) return true;
			}
		},
		date: function() {
			return this.date.year + "-" + this.date.month + "-" + this.date.day;
		},
		addDate: function() {
			if (this.date) 
				return true;
		},
		addDayTitle: function() {
			if (this.dayTitle !== "") return true;
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
			var dayNumber = parseInt(this.dayNumber);
			var newTime = hmToMinutes(event.target.startHours.value, event.target.startMinutes.value);

			Meteor.call("changeStartTime", dayNumber - 1, newTime, Session.get("currentSchedule"));

			return false;
		},
		"dblclick .dayHeader": function() {
			editDay(parseInt(this.dayNumber) - 1);
		},
		"click .editDay": function() {
			editDay(parseInt(this.dayNumber) - 1);
		}
	});

	Template.editDayView.helpers({
		editDayModal: function() {
			return Session.get("editDayModal");
		}, 
		deleteDayModal: function() {
			return Session.get("deleteDayModal");
		},
		day: function() {
			return Session.get("dayBeingEdited");
		},
		dayNumber: function() {
			return Session.get("dayBeingEdited").dayNumber;
		}
	});

	Template.editDayView.events({
		"click .popupHeader_button": function() {
			stopEditingDay();
		},
		"submit .popupForm": function(event) {
			var target = parseInt(Session.get("dayBeingEdited").dayNumber) - 1;
			var dayTitle = event.target.dayTitle.value;
			var startTime = hmToMinutes(event.target.lengthH.value, event.target.lengthM.value);

			if (event.target.dateCheckbox.checked) var date = new SimpleDate(event.target.dateYear.value, event.target.dateMonth.value, event.target.dateDay.value);
			else var date = null;

			Meteor.call("editDayInfo", Session.get("currentSchedule"), target, dayTitle, startTime, date);
			stopEditingDay();
			return false;
		},
		"click #delete1": function() {
			Session.set("deleteDayModal", true);
			return false;
		},
		"click #cancelDelete": function() {
			Session.set("deleteDayModal", false);
			return false;
		},
		"click #delete2": function() {
			Meteor.call("deleteDay", Session.get("currentSchedule"), parseInt(Session.get("dayBeingEdited").dayNumber) - 1);
			stopEditingDay();
			return false;
		}
	});

	Template.weather.helpers({
		temp: function() {
			return getTemp(this.date);
		},
		description: function() {
			return getWeatherDescription(this.date);
		},
		imgref: function() {
			return getWeatherImgRef(this.date);
		}
	});

	Template.hoursList.helpers({
		hours: function() {
			return numberList(0, 23, 1, 2);
		},
		selected: function() {
			// Returns true if this hour should be selected in the menu

			var hour = minutesToHuman(Template.parentData(1).startTime).split(":")[0]; // get the day's selected hour from the parent template
			return (this == hour);
		}
	});

	Template.minutesList.helpers({
		minutes: function() {
			return numberList(0, 59, 5, 2);
		},
		selected: function() {
			// Returns true if this minute should be selected in the menu

			var minute = minutesToHuman(Template.parentData(1).startTime).split(":")[1]; // get the day's selected minute from the parent template
			return (this == minute);
		}
	});

	// Template.activity.rendered = function() {
	// 	this.$(".activityObject").draggable({
	// 		stop: function(e, ui) {
	// 			var leftPos = ui.position.left;
	// 			var topPos = ui.position.top;
	// 			var activityID = $(this).attr('id');
	// 			console.log(activityID);
	// 			var target = "parkedActivities";
	// 			Meteor.call("updateActivityPos", target, activityID, leftPos, topPos);
	// 		}
	// 	});
	// }

	Template.mainFrame.rendered = function() {
		$('.activityList').sortable({
			connectWith: ".connectLists",
			dropOnEmpty: true,
			//placeholder: "activityPlaceholder",
			start: function(e, ui) {
				startPos = ui.item.index();
				startTarget = $(ui.item).parent().attr("id"); //ID från den första listan
				endTarget = startTarget; //endTarget är vid detta tillfälle samma lista, om objektet dras till en annan lista så kommer "receive" att köras och ändra endTarget till den nya listan. "receive" körs innan "stop"
				console.log("start: " + this.id + ", pos: " + startPos);
				startItem = $(ui.item);

				// var counter = 0;
				// $.each(startItem.parent().children(), function(i, val) {
				// 	counter++;
				// 	console.log(val);
				// })
				// counter--;
				// if(ui.item.index() + 1 === counter) {
				// 	console.log("sista elementet");
				// 	lastItem = true;
				// } else {
				// 	lastItem = false;
				// }
				// console.log("counter: " + counter);

				// console.log(ui.item.next().get(0));
				// if(ui.item.next().length === 0) {
				// 	console.log("inget nästa värde");
				// }
			},
			stop: function(e, ui) {
				endPos = ui.item.index();
				endTarget = $(ui.item).parent().attr("id");
				console.log("stop: " + endTarget + ", pos: " + endPos);
				$('.activityList').sortable('cancel');
				console.log("cancel sortable");
				if(startTarget === endTarget) {
					//$('.activityList').sortable('cancel');
					//console.log("cancel sortable");
					console.log(startTarget + ", " + startPos + ", " + endPos);
					Meteor.call("moveActivity", Session.get("currentSchedule"), startTarget, startPos, endPos);
					console.log("Samma lista");
				} 
				else {
					Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
					console.log("Annan lista");
					// if(lastItem) {
					//$(ui.item).remove();
					// }
					// console.log("removing");
				}
				//$(".activityList").empty();
				
			},
			update: function(e, ui) {
				console.log("update");

			}
			// receive: function(e, ui) {
			// 	endTarget = this.id;
			// 	endPos = ui.item.index();
			// 	$('.activityList').sortable('cancel');
			// 	console.log("cancel sortable");
				
			// 	//console.log($(ui.item));
			// 	//console.log("receive: " + this.id + ", pos: " + endPos);
			// 	//$('.activityList').sortable('cancel');
				
			// 	Meteor.call("moveActivityToList", Session.get("currentSchedule"), startTarget, endTarget, startPos, endPos);
			// 	//console.log("Annan lista");
			// }
		});
	 	$('.activityList').disableSelection();
	// 	// this.$('#parkedActivities').sortable({
	// 	// 	stop: function(e, ui) {
	// 	// 		// get the dragged html element and the one before
	// 	// 		//	 and after it
	// 	// 		el = ui.item.get(0)
	// 	// 		before = ui.item.prev().get(0)
	// 	// 		after = ui.item.next().get(0)
	 
	// 	// 		// Here is the part that blew my mind!
	// 	// 		//	Blaze.getData takes as a parameter an html element
	// 	// 		//	and will return the data context that was bound when
	// 	// 		//	that html element was rendered!
	// 	// 		if(!before) {
	// 	// 			//if it was dragged into the first position grab the
	// 	// 			// next element's data context and subtract one from the rank
	// 	// 			newRank = Blaze.getData(after).rank - 1
	// 	// 		} else if(!after) {
	// 	// 			//if it was dragged into the last position grab the
	// 	// 			//	previous element's data context and add one to the rank
	// 	// 			newRank = Blaze.getData(before).rank + 1
	// 	// 		}
	// 	// 		else {
	// 	// 			//else take the average of the two ranks of the previous
	// 	// 			// and next elements
	// 	// 			newRank = (Blaze.getData(after).rank + Blaze.getData(before).rank)/2
	// 	// 		}
	 
	// 	// 		//update the dragged Item's rank
	// 	// 		Meteor.call("updateRank", Blaze.getData(el)._id, newRank);
	// 	// 	}
	// 	// })
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
