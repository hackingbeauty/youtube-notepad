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
	$.easyAccordion = function () {
		alert('yea');
		return this.each(function (i) {
			// Do something to each selected element.
			$(this).html('' + i);
		});
	};

  // Static method.

}(jQuery));