define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/Warmup/Base"
],
function (App, Common, Warmup) {

	var WarmupViews = {};

	WarmupViews.Play = {};

	WarmupViews.Play.Layout = App.registerView("warmup::play", Backbone.View.extend({
		template: "app/apps/Warmup/templates/grid",

		isSelectMode: function () {
			var mode = this.options.mode;
			return mode === "selectRow" || mode === "selectCol" || mode === "selected";
		},

		beforeRender: function () {
			console.log("@BEFORE", this.$el);
			this.$el.css('opacity', 0);
		},

		afterRender: function () {
			// initialize in the correct state
			var mode = this.options.mode, modeMeta = this.options.modeMeta;
			if (this.isSelectMode()) {
				this.$el.css('opacity', 1);
				this.selectMode();

				if(mode === "selectCol" || mode === "selected") {
					this.selectRow(modeMeta.selectedRow);
				}

				if (mode === "selected") {
					this.selectColumn(modeMeta.selectedCol);
				}
			} else { // initial load -- fade in
				this.$el.animate({opacity: 1}, 500);

			}
		},

		selectMode: function () {
			// make selecter begin just below the column labels
			this.$(".grid-selecter").css('top', this.$(".grid-row-0").position().top - 5);
			this.$(".participant-grid").addClass('select-mode').addClass('select-mode-row');
		},

		update: function (data) {
			console.log("my custom update", data);
			if (data.mode === "selectRow") {
				this.selectMode();
			} else if (data.mode === "selectCol") {
				this.selectRow(data.modeMeta.selectedRow);
			} else if (data.mode === "selected") {
				this.selectColumn(data.modeMeta.selectedCol);
			}
		},

		// row must be selected first.
		selectRow: function (row) {
			$selecter = this.$(".grid-selecter");
			this.$(".participant-grid").addClass("selecting");
			var $selectedRow = this.$(".grid-row-" + row);

			// do not dim these participants
			$selectedRow.children().addClass("selected");

			var selecterTop = $selectedRow.position().top - 5;

			var cellHeight = this.$(".participant").height();
			var selecterHeight = cellHeight + 6;

			$selecter.animate({top: selecterTop, height: selecterHeight });

			// move to column select mode
			this.$(".participant-grid").removeClass('select-mode-row').addClass('select-mode-column');
		},

		// assumes row is selected first
		selectColumn: function (col) {
			$selecter = this.$(".grid-selecter");
			var $selectedCol = this.$(".grid-col-" + col);
			var $selectedCell = this.$(".selected.grid-col-" + col);

			// dim siblings
			$selectedCell.siblings(".participant").removeClass('selected');
			// mark the label as selected
			this.$(".grid-col-label-" + col).addClass("selected");

			var cellWidth = this.$(".participant").width();
			var selecterWidth = cellWidth + 6;

			var selecterLeft = $selectedCol.position().left - 5;
			var $el = this.$el;
			$selecter.animate({left: selecterLeft, width: selecterWidth }, function () {
				// fade out 1s later
				setTimeout(function () {
					$el.animate({opacity: 0});
				}, 1000);
			});

			this.$(".participant-grid").removeClass('select-mode-column');
		},


		serialize: function () {
			return {
				participantReady: this.options.participants.length > 0,
				rows: 5,
				columns: 5,
				participantLocation: this.options.userLocation,
				rowLabels: ["A", "B", "C", "D", "E"],
				columnLabels: ["A", "B", "C", "D", "E"]
			};
		}
	}));


	WarmupViews.Conclusion = App.registerView("warmup::conclusion", Backbone.View.extend({
		template: "app/apps/Warmup/templates/conclusion"
	}));

	return WarmupViews;
});