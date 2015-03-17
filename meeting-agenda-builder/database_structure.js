// Database structure

function databaseStructureExample() {
	test_schedule = {
		parkedActivities: 	[{},
							{}],
		days: 	[{},
				{}],
		owner: 'Mats'
	};

	test_activity = {
		name: "Mats",
		length: "60",
		type: "Presentation",
		description: "Mats ska berätta om föroreningar orsakade av Al Gore"
	};

	test_day = {
		start: "480",
		activities: []
	};
}

if (Meteor.isClient) {
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
			};

			test_activity1 = {
				name: "Mats",
				length: "60",
				type: "Presentation",
				description: "Mats ska berätta om föroreningar orsakade av Al Gore"
			};

			test_activity2 = {
				name: "Hans",
				length: "45",
				type: "Group Work",
				description: "Hans visar sin fisk"
			};

			test_day = {
				start: "480",
				activities: []
			};

			test_schedule.parkedActivities.push(test_activity1);
			test_schedule.days.push(test_day);
			test_schedule.days[0].activities.push(test_activity2);

			Meteor.call("addSchedule", test_schedule);
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
	});

	Template.body.helpers({
		view: function() {
			return Session.get("page");
		}
	});

	Template.body.events({
		"click #runTemplate": function() {
			console.log("runTemplate");
			Session.set("page", "test");
		}
	});
}
