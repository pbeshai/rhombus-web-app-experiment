define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/RecognitionOnsetSegmentsWarmup/Base",
	"apps/RecognitionSegmentsWarmup/Views"
],
function (App, Common, RecognitionOnsetSegmentsWarmup, RecognitionSegmentsWarmupViews) {

	var RecognitionOnsetSegmentsWarmupViews = {};

	RecognitionOnsetSegmentsWarmupViews.Conclusion = App.registerView("RecognitionOnsetSegmentsWarmup::conclusion",
		RecognitionSegmentsWarmupViews.Conclusion);

	return RecognitionOnsetSegmentsWarmupViews;
});