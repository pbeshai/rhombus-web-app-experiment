define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/RecognitionSegments/Module"
],

function (App, StateApp, CommonStateApps, RecognitionSegments) {

	var RecognitionSegmentsApp = CommonStateApps.BasicApp.extend({
		id: "RecognitionSegments",
		version: "1.0",
		config: RecognitionSegments.config(),
		States: [ RecognitionSegments.States.RepeatedPlay,
							RecognitionSegments.States.RepeatedPlay,
							RecognitionSegments.States.RepeatedPlay,
							RecognitionSegments.States.Conclusion ],
		prepend: { attendance: false },
		stateOptions: [ { name:"slow", userSpeed: 0 }, { name: "medium", userSpeed: 1 }, { name: "fast", userSpeed: 2 } ]
	});

	// description for use in router
	RecognitionSegmentsApp.app = {
		instantiate: function (attrs) {
			return new RecognitionSegmentsApp(attrs, { autoAddNew: true });
		},
		AppControlsView: undefined,
		title: "Recognition (Segmented Display)"
	};

	return RecognitionSegmentsApp;
});