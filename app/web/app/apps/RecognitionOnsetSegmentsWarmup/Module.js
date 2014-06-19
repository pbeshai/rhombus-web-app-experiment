define([
	"framework/App",

	"apps/RecognitionOnsetSegmentsWarmup/Base",
	"apps/RecognitionOnsetSegmentsWarmup/Views",
	"apps/RecognitionOnsetSegmentsWarmup/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});