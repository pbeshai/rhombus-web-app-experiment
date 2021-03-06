define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/Warmup/Module"
],

function (App, StateApp, CommonStateApps, Warmup) {

	var WarmupApp = CommonStateApps.BasicApp.extend({
		id: "warmup",
		version: "1.0",
		config: Warmup.config(),
		States: [ Warmup.States.RepeatedPlay, Warmup.States.Conclusion ],
		prepend: { attendance: false }
	});

	// description for use in router
	WarmupApp.app = {
		instantiate: function (attrs) {
			return new WarmupApp(attrs, { autoAddNew: true });
		},
		AppControlsView: undefined,
		title: "Selection Experiment Warmup"
	};

	return WarmupApp;
});