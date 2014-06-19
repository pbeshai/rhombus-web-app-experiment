define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/RecognitionOnsetSegmentsWarmup/Module"
],

function (App, StateApp, CommonStateApps, RecognitionOnsetSegmentsWarmup) {

	var RecognitionOnsetSegmentsWarmupApp = CommonStateApps.BasicApp.extend({
		id: "RecognitionOnsetSegmentsWarmup",
		version: "1.0",
		config: RecognitionOnsetSegmentsWarmup.config(),
		States: [ RecognitionOnsetSegmentsWarmup.States.RepeatedPlay,
							RecognitionOnsetSegmentsWarmup.States.Conclusion ],
		prepend: { attendance: false },
		stateOptions: [	{ name:"warmup", userSpeed: 0 } ]
	});

	// description for use in router
	RecognitionOnsetSegmentsWarmupApp.app = {
		instantiate: function (attrs) {
			return new RecognitionOnsetSegmentsWarmupApp(attrs, { autoAddNew: true, writeLogAtEnd: false });
		},
		AppControlsView: undefined,
		title: "Onset Recognition Warmup"
	};

	return RecognitionOnsetSegmentsWarmupApp;
});