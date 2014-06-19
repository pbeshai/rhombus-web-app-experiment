define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/RecognitionOnsetSegments/Module"
],

function (App, StateApp, CommonStateApps, RecognitionOnsetSegments) {

	var RecognitionOnsetSegmentsApp = CommonStateApps.BasicApp.extend({
		id: "RecognitionOnsetSegments",
		version: "1.0",
		config: RecognitionOnsetSegments.config(),
		States: [ RecognitionOnsetSegments.States.RepeatedPlay, RecognitionOnsetSegments.States.BlockComplete,
							RecognitionOnsetSegments.States.RepeatedPlay, RecognitionOnsetSegments.States.BlockComplete,
							RecognitionOnsetSegments.States.RepeatedPlay,
							RecognitionOnsetSegments.States.Conclusion ],
		prepend: { attendance: false },
		stateOptions: [
			{ name: "slow", userSpeed: 0 }, { block: "slow" },
			{ name: "medium", userSpeed: 1 }, { block: "medium" },
			{ name: "fast", userSpeed: 2 }, { block: "fast" } ]
	});

	// description for use in router
	RecognitionOnsetSegmentsApp.app = {
		instantiate: function (attrs) {
			return new RecognitionOnsetSegmentsApp(attrs, { autoAddNew: true });
		},
		AppControlsView: undefined,
		title: "Onset Recognition Experiment"
	};

	return RecognitionOnsetSegmentsApp;
});