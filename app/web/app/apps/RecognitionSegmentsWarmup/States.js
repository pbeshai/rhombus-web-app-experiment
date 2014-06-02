define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/RecognitionSegmentsWarmup/Base",
	"apps/RecognitionSegments/Module"
],
function (App, Common, StateApp, RecognitionSegmentsWarmup, RecognitionSegments) {

	var RecognitionSegmentsWarmupStates = {};

	// To be used in StateApps
	RecognitionSegmentsWarmupStates = {};

	RecognitionSegmentsWarmupStates.Play = RecognitionSegments.States.Play.extend({
		finishDelayTime: 1750,
		viewOptions: function () { // allow time to show distractor feedback
			var viewOpts =  RecognitionSegments.States.Play.prototype.viewOptions.apply(this, arguments);
			viewOpts.delayFinishFade = 750;
			viewOpts.showDistractorFeedback = true;
			return viewOpts;
		}
	})

	RecognitionSegmentsWarmupStates.RepeatedPlay = StateApp.RepeatState.extend({
		name: "repeat",
		State: RecognitionSegmentsWarmupStates.Play,
		numRepeats: 10,
		streakRequired: 4,

		initialize: function () {
			StateApp.RepeatState.prototype.initialize.apply(this, arguments);
			this.correctStreak = 0;
		},

		stateOutput: function (output) {
			var currentIndex = this.currentState.options.stateIndex;
			var trialOutput = _.omit(output, ['participants', 'clone']);
			trialOutput.trial = currentIndex + 1;

			// if we are in the last n where we need to keep track of the streak
			if (currentIndex >= this.numRepeats - this.streakRequired) {
				if (!output.correct) { // output incorrect so decrement streak and add in new states
					this.correctStreak = 0;
					this.setRepeats(1 + currentIndex + this.streakRequired);
				} else { // output correct so increment streak
					this.correctStreak++;
				}
			}

			this.log(this.logTrial(trialOutput), { trial: currentIndex + 1, warmup: true });

			return trialOutput;
		},

		logTrial: function (trialOutput) {
			return {
        trialOutputs: {
          "block": this.name,
          "current": trialOutput,
          "previous": this.stateOutputs.slice()
        }
      };
		}
	});

	RecognitionSegmentsWarmupStates.Conclusion = StateApp.ViewState.extend({
		name: "conclusion",
		view: "RecognitionSegmentsWarmup::conclusion",

		afterRender: function () {
			console.log("CONCLUSION LOGGING");
      this.log(this.logResults(), { warmup: true });
    },

		logResults: function () {
			console.log("@@ log results in CONCLUSION", this.input);
      var logData = {
        warmup:  {
          results: this.input.stateOutputs,
          config: this.config
        }
      };

      return logData;
    }
	});


	return RecognitionSegmentsWarmupStates;
});