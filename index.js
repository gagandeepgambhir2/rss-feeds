$(document).ready(function () {
	// Initialize variables
	var bbc = [];
	var buzzfeed = [];
	var fliplet = [];
	var feeds = [];
	var ft = [];
	var selectedPage = 1;

	var source = $("#feed-template").html();
	var element = $(".rssfeedd a[ data-type=bbc]");
	let elementUrl = element.attr("data-url");
	// Initially load feeds
	getRssFeed(elementUrl, "bbc");
	var template = Handlebars.compile(source);
	// Handles feed click
	$(".rssfeedd a").on("click", function () {
		var url = $(this).attr("data-url");
		let feedType = $(this).attr("data-type");
		$(".loader").show();
		var isClassExists = $(".rssfeedd a").hasClass("btn-primary");
		if (isClassExists) {
			$(".rssfeedd a").removeClass("btn-primary");
			$(".rssfeedd a").addClass("btn-outline-secondary");
		}
		getRssFeed(url, $(this).attr("data-type"));
		$(this).removeClass("btn-outline-secondary");
		$(this).addClass("btn-primary");
	});

	// Gets RSS feeds
	function getRssFeed(url, selectedfeedType) {
		var items = [];
		if (selectedfeedType == "bbc" && bbc.length > 0) {
			$(".row-cols-1").html(template(bbc.slice(0, 5)));
			$(".loader").hide();
			$(".error").hide();
			feeds = bbc;
			handlepagination(bbc);
		} else if (selectedfeedType == "buzzfeed" && buzzfeed.length > 0) {
			$(".row-cols-1").html(template(buzzfeed.slice(0, 5)));
			$(".loader").hide();
			$(".error").hide();
			feeds = buzzfeed;
			handlepagination(buzzfeed);
		} else if (selectedfeedType == "fliplet" && fliplet.length > 0) {
			$(".row-cols-1").html(template(fliplet.slice(0, 5)));
			$(".loader").hide();
			$(".error").hide();
			feeds = fliplet;
			handlepagination(fliplet);
		} else {
			$.get(url, function (xml) {
				if (!isXML(xml)) {
					$(".error").show();
					$(".loader").hide();
					$(".row-cols-1").html(template([]));
					$(".pagination").hide();
				} else {
					var json = $.xml2json(xml);
					items = json.channel.item;
					if (selectedfeedType == "bbc") {
						bbc = items;
					} else if (selectedfeedType == "buzzfeed") {
						buzzfeed = items;
					} else if (selectedfeedType == "fliplet") {
						fliplet = items;
					} else if (ft) {
						ft = items;
					}
					feeds = items;
					$(".row-cols-1").html(template(items.slice(0, 5)));
					$(".loader").hide();
					$(".error").hide();
					handlepagination(feeds);
				}
			}).fail(function () {
				$(".error").show();
				$(".loader").hide();
				$(".row-cols-1").html("");
				items = [];
			});
		}
	}

	// Checks if valid XML
	function isXML(xml) {
		try {
			xmlDoc = $.parseXML(xml); //is valid XML
			return true;
		} catch (err) {
			// was not XML
			return false;
		}
	}

	var pages = [];
	let pageCount = 0;
	// Generates pagination
	function handlepagination(data) {
		$(".pagination").show();
		pageCount = Math.floor(data.length / 5);
		selectedPage = 1;
		var pagination = "";
		for (var i = 1; i <= pageCount; i++) {
			pagination += `<li data-value=${i} class="page-item ${
				i == selectedPage ? "active" : ""
			}">`;
			pagination += `<a data-value=${i} class="page-link" href="javascript:;">${i}</a></li>`;
		}
		$(".paginationlist").html(pagination);
	}

	// Handle page click
	$(document).on("click", ".paginationlist li", function () {
		let value = $(this).attr("data-value");
		selectedPage = value;
		let offset = value * 5 - 5;
		$(".row-cols-1").html(template(feeds.slice(offset, 5 * value)));
		$(".paginationlist li").removeClass("active");
		$(".paginationlist li[ data-value=" + selectedPage + "]").addClass(
			"active",
		);
	});

	// Handles next page click
	$(document).on("click", ".prev", function () {
		if (selectedPage == 1) {
			return;
		}
		selectedPage = +selectedPage - 1;
		let offset = selectedPage * 5 - 5;
		$(".paginationlist li").removeClass("active");
		$(".paginationlist li[ data-value=" + selectedPage + "]").addClass(
			"active",
		);
		$(".row-cols-1").html(template(feeds.slice(offset, 5 * selectedPage)));
	});

	// Handles previous page click
	$(document).on("click", ".next", function () {
		if (selectedPage == pageCount) {
			return;
		}
		selectedPage = +selectedPage + 1;
		let offset = selectedPage * 5 - 5;
		$(".paginationlist li").removeClass("active");
		$(".paginationlist li[ data-value=" + selectedPage + "]").addClass(
			"active",
		);
		$(".row-cols-1").html(template(feeds.slice(offset, 5 * selectedPage)));
	});

	// Executes strip scripts
	(function () {
		Handlebars.registerHelper("stripScripts", function (param) {
			var regex = /(<([^>]+)>)/gi;
			return param.replace(regex, "");
		});
        Handlebars.registerHelper("prettifyDate", function(timestamp) {
            return moment(new Date(timestamp)).format('MMM DD,  YYYY');
        });
	})();

    
});
