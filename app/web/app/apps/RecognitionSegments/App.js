define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/RecognitionSegments/Module"
],

function (App, StateApp, CommonStateApps, RecognitionSegments) {

	var WarmupApp = CommonStateApps.BasicApp.extend({
		id: "RecognitionSegments",
		version: "1.0",
		config: RecognitionSegments.config(),
		States: [ RecognitionSegments.States.RepeatedPlay, RecognitionSegments.States.Conclusion ],
		prepend: { attendance: false }
	});

	// description for use in router
	WarmupApp.app = {
		instantiate: function (attrs) {
			return new WarmupApp(attrs, { autoAddNew: true });
		},
		AppControlsView: undefined,
		title: "Recognition (Segmented Display)"
	};

	return WarmupApp;
});