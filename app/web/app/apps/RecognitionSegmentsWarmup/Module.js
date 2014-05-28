define([
	"framework/App",

	"apps/RecognitionSegmentsWarmup/Base",
	"apps/RecognitionSegmentsWarmup/Views",
	"apps/RecognitionSegmentsWarmup/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});