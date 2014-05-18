define([
	"framework/App",

	"apps/RecognitionSegments/Base",
	"apps/RecognitionSegments/Views",
	"apps/RecognitionSegments/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});