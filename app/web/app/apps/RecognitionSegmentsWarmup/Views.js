define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/RecognitionSegmentsWarmup/Base"
],
function (App, Common, RecognitionSegmentsWarmup) {

	var RecognitionSegmentsWarmupViews = {};

	RecognitionSegmentsWarmupViews.Conclusion = App.registerView("RecognitionSegmentsWarmup::conclusion", Backbone.View.extend({
		template: "app/apps/RecognitionSegmentsWarmup/templates/conclusion"
	}));

	return RecognitionSegmentsWarmupViews;
});