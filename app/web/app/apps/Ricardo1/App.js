define([
	"framework/App",
	"framework/modules/StateApp/Module",
	"framework/modules/common/CommonStateApps",

	"apps/Ricardo1/Module"
],

function (App, StateApp, CommonStateApps, Ricardo1) {

	var Ricardo1App = CommonStateApps.BasicApp.extend({
		id: "Ricardo1",
		version: "1.0",
		config: Ricardo1.config(),
		States: [ Ricardo1.States.RepeatedPlay, Ricardo1.States.BlockComplete,
							Ricardo1.States.RepeatedPlay, Ricardo1.States.BlockComplete,
							Ricardo1.States.RepeatedPlay,
							Ricardo1.States.Conclusion ],
		prepend: { attendance: false },
		stateOptions: [
			{ name: "slow", userSpeed: 0, errorRate: 0.25 }, { block: "slow" },
			{ name: "medium", userSpeed: 1, errorRate: 0.25 }, { block: "medium" },
			{ name: "fast", userSpeed: 2, errorRate: 0.25 }, { block: "fast" } ]
	});

	// description for use in router
	Ricardo1App.app = {
		instantiate: function (attrs) {
			return new Ricardo1App(attrs, { autoAddNew: true });
		},
		AppControlsView: undefined,
		title: "Ricardo1"
	};

	return Ricardo1App;
});