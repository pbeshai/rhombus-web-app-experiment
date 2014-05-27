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
			distractorChoices: ["B","D","E","E","A","A","B","C","A","E","D","E","D","E","C","E","D","A","E","E","C","A","D","B","D","B","A","C","A","C","B","D","C","B","A","C","B","C","A","E","C","A","D","D","B","E","B","D"],
			userChoices: ["B","C","C","A","D","A","B","C","E","B","D","A","A","E","A","E","B","B","C","D","E","D","A","E","D","C","D","E","B","C","D","D","E","C","E","B","A","B","D","B","E","D","A","C","A","C","B","A"],
		};
	};

	return RecognitionSegments;
});