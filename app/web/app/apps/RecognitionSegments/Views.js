define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/RecognitionSegments/Base"
],
function (App, Common, RecognitionSegments) {

	var RecognitionSegmentsViews = {};

	RecognitionSegmentsViews.Play = {};

	RecognitionSegmentsViews.Play.Participant = Common.Views.ParticipantDisplay.extend({
		mainText: function (model) { },

		cssClass: function (model) { return "br-corner-message"; },

		overlay: function (model) {
			var classes = "fast-transition ";
			if (model.get("feedback")) {
				return classes + "green";
			} else if (model.get("feedback") === false) {
				return classes + "red";
			}
			return classes + "transparent";
		},


		beforeRender: function () {
			Common.Views.ParticipantDisplay.prototype.beforeRender.apply(this, arguments);

			this.setView(".message-text", new RecognitionSegmentsViews.Segment({ value: this.model.get("choice")}));
		}
	});

	/*
		_   top
   |_|  upper left, middle, upper right
   |_|  lower left, bottom, lower right
	*/
	RecognitionSegmentsViews.Segment = App.BaseView.extend({
		template: "app/apps/RecognitionSegments/templates/segment",
		valueToSegments: {
			"A": {
				top: true,
				middle: true,
				bottom: false,
				upperLeft: true,
				upperRight: true,
				lowerLeft: true,
				lowerRight: true
			},
			"B": {
				top: false,
				middle: true,
				bottom: true,
				upperLeft: true,
				upperRight: false,
				lowerLeft: true,
				lowerRight: true
			},
			"C": {
				top: true,
				middle: false,
				bottom: true,
				upperLeft: true,
				upperRight: false,
				lowerLeft: true,
				lowerRight: false
			},
			"D": {
				top: false,
				middle: true,
				bottom: true,
				upperLeft: false,
				upperRight: true,
				lowerLeft: true,
				lowerRight: true
			},
			"E": {
				top: true,
				middle: true,
				bottom: true,
				upperLeft: true,
				upperRight: false,
				lowerLeft: true,
				lowerRight: false
			}
		},

		serialize: function () {
			return {
				segments: this.segments
			};
		},

		resetSegments: function (showSegments) {
			showSegments = showSegments || !this.options.resetBlank;
			this.segments = {
				top: showSegments,
				middle: showSegments,
				bottom: showSegments,
				upperLeft: showSegments,
				upperRight: showSegments,
				lowerLeft: showSegments,
				lowerRight: showSegments
			};

			return this; // for chaining
		},

		segmentsFromValue: function (value) {
			this.resetSegments();
			_.extend(this.segments, this.valueToSegments[value]);
			return this; // for chaining
		},

		initialize: function (options) {
			if (this.options.resetBlank === undefined) {
				this.options.resetBlank = false;
			}
			this.resetSegments();
			if (this.options.value) {
				this.segmentsFromValue(this.options.value);
			}
		}
	});

	RecognitionSegmentsViews.Play.Layout = App.registerView("RecognitionSegments::play", App.BaseView.extend({
		template: "app/apps/RecognitionSegments/templates/grid",
		numRows: 5,
		numCols: 5,
		ParticipantView: RecognitionSegmentsViews.Play.Participant,

		beforeRender: function () {
			this.$el.css('opacity', 0);

			if (!this.participants || this.participants.length === 0) return;
			var userLocation = this.options.userRow * this.numRows + this.options.userCol;
			var distractorLocation = this.options.distractorRow * this.numRows + this.options.distractorCol;
			for (var i = 0; i < this.numRows * this.numCols; i++) {
				if (i !== userLocation) {
					var userModel = new Backbone.Model({ alias: this.options.aliases[i]});
					var view = new this.ParticipantView({ model: userModel });

					if (i === distractorLocation) {
						this.distractor = userModel;
						this.distractorView = view;
					}

					this.insertView(".grid-cell-" + i, view);
				} else {
					this.userView = new this.ParticipantView({ model: this.participants.at(0) });
					this.insertView(".grid-cell-" + i, this.userView);
				}
			}
		},

		afterRender: function () {
			// initialize in the correct state
			var mode = this.options.mode, modeMeta = this.options.modeMeta;
			// TODO: render differently depending on value of mode
			// initial load -- fade in
			this.$el.animate({opacity: 1}, 800);
		},

		update: function (data) {

			var user = this.participants.at(0), distractor = this.distractor;

			if (data.mode === "revealChoices") {

				// user.set("choice", this.options.userChoice);
				// distractor.set("choice", this.options.distractorChoice);
				var userSegment = this.userView.views[".message-text"];
				userSegment.segmentsFromValue(this.options.userChoice).render();
				var distractorSegment = this.distractorView.views[".message-text"];
				distractorSegment.segmentsFromValue(this.options.distractorChoice).render();

				this.userStart = performance.now();
				this.distractorStart = performance.now();
				var userStart = performance.now();
				var distractorStart = performance.now();

				var userTime = data.modeMeta.userTime, distractorTime = data.modeMeta.distractorTime;

				console.log("user time = ", userTime, "distractor time = ", distractorTime);
				if (userTime === distractorTime) {
					console.log("same times");
					setTimeout(function () {
						userSegment.resetSegments().render();
						distractorSegment.resetSegments().render();
						console.log("user visible for", performance.now() - userStart);
						console.log("distractor visible for", performance.now() - distractorStart);
						App.viewer.appController.updateController({
							userRevealTime: performance.now() - userStart,
							distractorRevealTime: performance.now() - userStart
						});

					}, userTime);
				} else {
					setTimeout(function () {
						userSegment.resetSegments().render();
						console.log("user visible for", performance.now() - userStart);
						App.viewer.appController.updateController({
							userRevealTime: performance.now() - userStart
						});
					}, userTime);

					setTimeout(function () {
						distractorSegment.resetSegments().render();
						console.log("distractor visible for", performance.now() - distractorStart);
						App.viewer.appController.updateController({
							distractorRevealTime: performance.now() - userStart
						});
					}, distractorTime);
				}
			} else {
				if (user) {
					distractor.set("choice", null);
					user.set("choice", null);
				}

				if (data.mode === "finished") {
					if (this.options.showDistractorFeedback) {
						distractor.set("feedback", data.modeMeta.distractorCorrect);
					}

					if (this.options.delayFinishFade) {
						setTimeout(function () { this.$el.animate({opacity: 0}, 400); }.bind(this), this.options.delayFinishFade);
					} else {
						this.$el.animate({opacity: 0}, 400);
					}
				}
			}
		},

		serialize: function () {
			return {
				participantReady: this.options.participants.length > 0,
				rows: this.numRows,
				columns: this.numCols
			};
		}
	}));


	RecognitionSegmentsViews.Conclusion = App.registerView("RecognitionSegments::conclusion", Backbone.View.extend({
		template: "app/apps/RecognitionSegments/templates/conclusion"
	}));

	RecognitionSegmentsViews.BlockComplete = App.registerView("RecognitionSegments::block-complete", Backbone.View.extend({
		template: "app/apps/RecognitionSegments/templates/block_complete",

		// this was unnecessary and made participants feel rushed.
		// beforeRender: function () {
		// 	this.setView(".big-timer", new Common.Views.Countdown({ endTime: this.options.endTime }));
		// }
	}));

	return RecognitionSegmentsViews;
});