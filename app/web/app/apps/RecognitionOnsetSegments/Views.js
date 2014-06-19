define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/RecognitionOnsetSegments/Base",
	"apps/RecognitionSegments/Views"
],
function (App, Common, RecognitionOnsetSegments, RecognitionSegmentsViews) {

	var RecognitionOnsetSegmentsViews = {};

	RecognitionOnsetSegmentsViews.Play = {};

	RecognitionOnsetSegmentsViews.Play.Participant = RecognitionSegmentsViews.Play.Participant.extend({
		beforeRender: function () {
			Common.Views.ParticipantDisplay.prototype.beforeRender.apply(this, arguments);

			this.setView(".message-text", new RecognitionSegmentsViews.Segment({ resetBlank: true, value: this.model.get("choice")}));
		}
	});

	RecognitionOnsetSegmentsViews.Play.Layout = App.registerView("RecognitionOnsetSegments::play",
		RecognitionSegmentsViews.Play.Layout.extend({
			ParticipantView: RecognitionOnsetSegmentsViews.Play.Participant
	}));


	RecognitionOnsetSegmentsViews.Conclusion = App.registerView("RecognitionOnsetSegments::conclusion",
		RecognitionSegmentsViews.Conclusion);

	RecognitionOnsetSegmentsViews.BlockComplete = App.registerView("RecognitionOnsetSegments::block-complete",
		RecognitionSegmentsViews.BlockComplete);

	return RecognitionOnsetSegmentsViews;
});