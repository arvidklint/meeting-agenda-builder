var ActivityType = ["Presentation","Group Work","Discussion","Break"]

Schedules = new Mongo.Collection("schedules");

// Main model functions

getParkedActivities = function() {
	return Schedules.findOne("7brtTuz4yWDtKtS4Z").parkedActivities;
}

addDay = function(startH,startM) {
	var day;
	if(startH){
		day = new Day(startH,startM);
	} else {
		day = new Day(8,0);
	}
	this.days.push(day);
};

Meteor.methods({
	asdf: function(villkor) {
		console.log(villkor);
	}
});

