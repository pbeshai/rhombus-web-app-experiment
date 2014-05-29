define([
	"framework/App",
	"framework/modules/common/Common",
],
function (App, Common) {

	var RecognitionSegments = {};
	RecognitionSegments.config = function () {
		return {
			distractorLocations: [ 1, 8, 2, 10, 13, 9, 5, 6, 0, 11, 3, 14, 7, 4, 12, 15, 8, 10, 9, 6, 11, 14, 4, 15, 1, 2, 13, 5, 0, 3, 7, 12, 2, 9, 0, 14, 12, 8, 13, 6, 3, 4, 1, 10, 5, 11, 7, 15 ],
			distractorSpeeds: [ 2, 1, 0, 1, 2, 0, 0, 1, 2, 1, 2, 0, 2, 1, 0, 1, 0, 2, 1, 2, 0, 1, 1, 2, 0, 2, 0, 1, 0, 2, 1, 2, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 1, 2, 1, 0, 2, 0 ],
			distractorChoices: {
					slow: ["D","B","E","E","A","A","B","C","A","E","D","E","D","E","C","E","D","A","E","E","C","A","D","B","D","B","A","C","A","C","B","D","C","B","A","C","B","C","A","E","C","A","D","D","B","E","B","D"],
					medium: ["C","A","A","E","E","D","B","A","C","E","E","B","B","E","D","A","B","E","B","C","C","B","D","C","C","A","C","D","C","E","B","A","A","D","A","A","D","B","E","A","B","D","D","B","D","C","D","E"],
					fast: ["B","A","E","B","C","B","B","A","E","C","D","A","A","C","C","D","C","D","C","A","B","A","E","B","A","B","D","E","E","D","B","D","C","E","A","E","E","D","A","D","C","D","E","C","B","E","A","B"]
				},

			userChoices: {
					slow: ["B","C","C","A","D","A","B","C","E","B","D","A","A","E","A","E","B","B","C","D","E","D","A","E","D","C","D","E","B","C","D","D","E","C","E","B","A","B","D","B","E","D","A","C","A","C","B","A"],
					medium: ["A","B","D","B","C","E","C","C","D","A","A","D","B","B","C","E","A","D","A","E","D","D","E","A","E","C","D","E","A","C","E","A","B","D","E","B","A","B","B","E","D","D","B","C","E","C","C","A"],
					fast: ["E","B","C","A","B","B","D","C","D","B","D","C","E","B","C","D","E","D","A","A","D","E","B","C","B","C","D","A","A","E","D","A","E","A","E","B","E","B","C","A","A","D","B","C","E","C","E","D"]
				}
		};
	};

	return RecognitionSegments;
});