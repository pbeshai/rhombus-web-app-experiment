define([
	"framework/App",

	"apps/Warmup/Base",
	"apps/Warmup/Views",
	"apps/Warmup/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});