if (Meteor.isClient) {
	// counter starts at 0
	Session.setDefault('counter', 0);

	Template.hello.helpers({
		counter: function () {
			return Session.get('counter');
		}
	});

	Template.hello.events({
		'click button': function () {
			// increment the counter when button is clicked
			Session.set('counter', Session.get('counter') + 1);
		}
	});

	Template.test.events({
			"click #testButton": function() {
					test_schedule = {
						parkedActivities: [],
						days: [],
						owner: 'Henrik'
					}

					test_activity1= {
						name: "Mats",
						length: "60",
						type: "Presentation",
						description: "Mats ska berätta om föroreningar orsakade av AlGore"
					}

					test_activity2 = {
						name: "Hans",
						length: "45",
						type: "Group Work",
						description: "Hans visar sin fisk"
					}

					test_day = {
						start: "480",
						activities: []
					}

					test_schedule.parkedActivities.push(test_activity1);
					test_schedule.days.push(test_day);
					test_schedule.days[0].activities.push(test_activity2);

					Schedules.insert(test_schedule);
			},

			"click #button2": function() {
					allSchedules = Schedules.find({});

					console.log(allSchedules);
			}
	});

	Template.funktionstest.helpers({
		utskrivningsstest: function() {
			return Schedules.find({});
		}
	})
}

// test_schedule = {
// 	parkedActivities: 	[{}, 
// 						{}],
// 	days: 	[{},
// 			{}]
// 	owner: 'Mats'
// }

// test_activity = {
// 	name: "Mats",
// 	length: "60",
// 	type: "Presentation",
// 	description: "Mats ska berätta om föroreningar orsakade av AlGore"
// }

// test_day = {
// 	start: "480",
// 	activities: []
// }






if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
