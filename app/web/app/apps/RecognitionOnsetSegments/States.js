define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/RecognitionOnsetSegments/Base",
	"apps/RecognitionSegments/States",
	"apps/RecognitionOnsetSegments/Views"
],
function (App, Common, StateApp, RecognitionOnsetSegments, RecognitionSegmentsStates) {

	var NUM_REPEATS = 5;

	var RecognitionOnsetSegmentsStates = {};

	// To be used in StateApps
	RecognitionOnsetSegmentsStates = {};

	RecognitionOnsetSegmentsStates.Play = RecognitionSegmentsStates.Play.extend({
		view: "RecognitionOnsetSegments::play",
	});

	RecognitionOnsetSegmentsStates.RepeatedPlay = RecognitionSegmentsStates.RepeatedPlay.extend({
		State: RecognitionOnsetSegmentsStates.Play,
		numRepeats: NUM_REPEATS,
	});

	RecognitionOnsetSegmentsStates.Conclusion = RecognitionSegmentsStates.Conclusion.extend({
		view: "RecognitionOnsetSegments::conclusion",
	});

	RecognitionOnsetSegmentsStates.BlockComplete = RecognitionSegmentsStates.BlockComplete.extend({
		view: "RecognitionOnsetSegments::block-complete",
	});

	return RecognitionOnsetSegmentsStates;
});