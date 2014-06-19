define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/RecognitionOnsetSegmentsWarmup/Base",
	"apps/RecognitionSegmentsWarmup/States"
],
function (App, Common, StateApp, RecognitionOnsetSegmentsWarmup, RecognitionSegmentsWarmupStates) {

	var RecognitionOnsetSegmentsWarmupStates = {};

	// To be used in StateApps
	RecognitionOnsetSegmentsWarmupStates = {};

	RecognitionOnsetSegmentsWarmupStates.Play = RecognitionSegmentsWarmupStates.Play.extend({
		view: "RecognitionOnsetSegments::play",
	});

	RecognitionOnsetSegmentsWarmupStates.RepeatedPlay = RecognitionSegmentsWarmupStates.RepeatedPlay.extend({
		State: RecognitionOnsetSegmentsWarmupStates.Play,
	});

	RecognitionOnsetSegmentsWarmupStates.Conclusion = RecognitionSegmentsWarmupStates.Conclusion.extend({
		view: "RecognitionOnsetSegmentsWarmup::conclusion",
	});


	return RecognitionOnsetSegmentsWarmupStates;
});