define([
	"framework/App",
	"framework/modules/common/Common",
],
function (App, Common) {

	var RecognitionOnsetSegmentsWarmup = {};
	RecognitionOnsetSegmentsWarmup.config = function () {
		return {
			distractorLocations: [ 15, 11, 12, 5, 14, 7, 1, 10, 0, 8, 6, 4, 3, 13, 2, 9, 11, 5, 7, 10, 8, 4, 13, 9, 15, 12, 14, 1, 0, 6, 3, 2, 12, 7, 0, 4, 2, 11, 14, 10, 6, 13, 15, 5, 1, 8, 3, 9 ],
			distractorSpeeds: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			distractorChoices: {
				warmup: ["E","A","D","E","C","C","D","D","B","C","E","D","A","D","B","D","B","A","A","C","B","B","C","B","C","A","E","E","E","C","B","E","A","D","D","C","E","A","B","E","D","B","A","A","B","D","C","A"],
			},
			userChoices: {
				warmup: ["D","A","C","E","B","D","E","B","C","D","A","A","D","A","B","E","C","B","C","D","C","B","A","A","B","C","A","E","B","D","E","E","C","D","B","D","D","C","A","B","A","E","D","B","B","A","E","C"],
			}
		};
	};

	/*

	["C","A","E","E","A","E","B","A","C","E","E","B","B","D","D","A","B","E","B","C","C","B","D","C","C","A","C","D","C","E","B","A","A","D","A","A","D","B","E","A","B","D","D","B","D","C","D","E"]
	["A","B","D","B","C","E","C","C","D","A","A","D","B","B","C","E","A","D","A","E","D","D","E","A","E","C","D","E","A","C","E","A","B","D","E","B","A","B","B","E","D","D","B","C","E","C","C","A"]

	["B","A","E","B","C","B","B","A","E","C","D","A","A","C","C","D","C","D","C","A","B","A","E","B","A","B","D","E","E","D","B","D","C","E","A","E","E","D","A","D","C","D","E","C","B","E","A","B"]
	["E","B","C","A","B","B","D","C","D","B","D","C","E","B","C","D","E","D","A","A","D","E","B","C","B","C","D","A","A","E","D","A","E","A","E","B","E","B","C","A","A","D","B","C","E","C","E","D"]

	*/

	return RecognitionOnsetSegmentsWarmup;
});