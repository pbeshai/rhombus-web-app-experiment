define([
	"framework/App",
	"framework/modules/common/Common",
],
function (App, Common) {

	var RecognitionSegments = {};
	RecognitionSegments.config = function () {
		return {
		};
	};

	RecognitionSegments.Instructions = {};
	RecognitionSegments.Instructions.Play = Common.Models.Instructions.extend({
		// buttonConfig: {
		// 	"E": { description: "Select location" },
		// }
	});

	RecognitionSegments.Instructions.Results = RecognitionSegments.Instructions.Play.extend({
		buttonConfig: {}
	});

	return RecognitionSegments;
});