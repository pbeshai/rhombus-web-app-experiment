define([
	"framework/App",

	"apps/RecognitionOnsetSegments/Base",
	"apps/RecognitionOnsetSegments/Views",
	"apps/RecognitionOnsetSegments/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});