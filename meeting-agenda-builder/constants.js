MARGIN_BETWEEN_ACTIVITIES = 5;
MARGIN_ACTIVITY_LEFT = 15;
TOO_SHORT = 40;
HEADER_HEIGHT = 50;
DAY_HEADER_HEIGHT = 100;
DAY_WIDTH = 250 + 20;
STANDARD_SPACE = 10;

ActivityType = ["presentation","group_work","discussion","break"];
emailSyntax = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

activityTypes = [
	{"value": "presentation", "name": "Presentation"},
	{"value": "group_work", "name": "Group work"},
	{"value": "discussion", "name": "Discussion"},
	{"value": "break", "name": "Break"}
];