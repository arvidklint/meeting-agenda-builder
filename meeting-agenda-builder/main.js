if (Meteor.isClient) {
	Meteor.subscribe("schedules");

	Session.set("showPas", true);

	Template.scheduleTitle.helpers({
		scheduleTitle: function() {
			return getScheduleInfo().scheduleTitle;
		}
	});

	Template.scheduleTitle.events({
		"click #toScheduleChooser": function() {
			Session.set("currentSchedule", null);
		}
	});

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
			// placeholder: "activityPlaceholder",
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
				//$('.activityList').sortable('cancel');
				//console.log("cancel sortable");
				if(startTarget === endTarget) {
					$('.activityList').sortable('cancel');
					console.log("cancel sortable");
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
