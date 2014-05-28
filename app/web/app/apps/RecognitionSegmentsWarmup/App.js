define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/RecognitionSegmentsWarmup/Module"
],

function (App, StateApp, CommonStateApps, RecognitionSegmentsWarmup) {

	var RecognitionSegmentsWarmupApp = CommonStateApps.BasicApp.extend({
		id: "RecognitionSegmentsWarmup",
		version: "1.0",
		config: RecognitionSegmentsWarmup.config(),
		States: [ RecognitionSegmentsWarmup.States.RepeatedPlay,
							RecognitionSegmentsWarmup.States.Conclusion ],
		prepend: { attendance: false },
		stateOptions: [	{ name:"warmup", userSpeed: 0 } ]
	});

	// description for use in router
	RecognitionSegmentsWarmupApp.app = {
		instantiate: function (attrs) {
			return new RecognitionSegmentsWarmupApp(attrs, { autoAddNew: true, writeLogAtEnd: false });
		},
		AppControlsView: undefined,
		title: "Recognition Warmup"
	};

	return RecognitionSegmentsWarmupApp;
});