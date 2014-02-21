define([
	"framework/App",
	"framework/modules/common/Common",
],
function (App, Common) {

	var Warmup = {};
	Warmup.config = function () {
		return {
		};
	};

	Warmup.Instructions = {};
	Warmup.Instructions.Play = Common.Models.Instructions.extend({
		buttonConfig: {
			"E": { description: "Select location" },
		}
	});

	Warmup.Instructions.Results = Warmup.Instructions.Play.extend({
		buttonConfig: {}
	});

	return Warmup;
});