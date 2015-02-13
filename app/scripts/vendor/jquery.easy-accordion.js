/*
 * 
 * 
 *
 * Copyright (c) 2015 Mark M. Muskardin
 * Licensed under the MIT license.
 */
(function ($) {
  'use strict';
  // Collection method.
	$.fn.easyAccordion = function (  ) {
		return this.each(function (i) {
			new Accordion( $(this) );
		});
	};

	var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;

		// Evento
		el.on('click', '.link', this.dropdown);
	};

	Accordion.prototype.dropdown = function(e) {
		var $el = $(e.currentTarget),
			$this = $(this),
			$next = $this.next();

		$next.slideToggle();
		$this.parent().toggleClass('open');

		if (!e.currentTarget.multiple) {
			$el.parent().parent().find('.submenu').not($next).slideUp().parent().removeClass('open');
		}
	};

}(jQuery));

