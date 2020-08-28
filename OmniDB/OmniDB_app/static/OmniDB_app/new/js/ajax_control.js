/*
Copyright 2015-2017 The OmniDB Team

This file is part of OmniDB.

OmniDB is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

OmniDB is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with OmniDB. If not, see http://www.gnu.org/licenses/.
*/

//Number of active AJAX calls
var v_calls_count = 0;
var v_is_loading = false;

/**
 * Used to add a loading gif modal above page content.
 */
function startLoading() {
	v_calls_count++;
	if (!v_is_loading) {

		$('#div_loading').fadeIn(100);
		v_is_loading = true;
	}
}

/**
 * Used to remove a loading gif modal above page content.
 */
function endLoading() {
	if(v_calls_count > 0) {
		v_calls_count--;
	}

	if(v_calls_count==0) {
		$('#div_loading').fadeOut(100);
		v_is_loading = false;
	}
}

/**
 * Used to get a cookie value from document, based on cookie name.
 * @param {string} name - the name of the cookie in the document.
 * @returns {string} cookie value, if exists.
 */

function getCookie(name) {
	var cookieValue = null;

	if(document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');

		for(var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);

			// Does this cookie string begin with the name we want?
			if(cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}

	return cookieValue;
}

/**
 * Used to get see if a http request is one of: GET, HEAD, OPTIONS, TRACE.
 * @param {string} method - the method to be checked.
 * @returns {boolean} if the http request is one of GET, HEAD, OPTIONS, TRACE or not.
 */
function csrfSafeMethod(method) {
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var v_ajax_call = null;
var v_cancel_button = document.getElementById('bt_cancel_ajax');

/**
 * Abort last ajax call.
 */
function cancelAjax() {
	if(v_ajax_call != null) {
		v_ajax_call.abort();
	}
}

 /**
  * ## execAjax
  * @desc Used to execute an AJAX call.
  *
	* @param {String} p_url - The url of the view to be executed.
  * @param {Object} p_data - A JavaScript object containing anything you want to pass as parameter to the server. Must be in JSON.stringify format.
  * @param {String} p_successFunc - A callback to be called if AJAX call succeeds.
  * @param {String} p_errorFunc - A callback to be called if AJAX call succeeds but returns with errors.
  * @param {Boolean} p_notifMode - The notification mode of this call.
  * @param {Boolean} p_loading - If this AJAX call should add a loading gif or not.
  * @param {Boolean} p_cancel_button - If the cancel button must be displayed or not.
  * @param {String} p_onAjaxErrorCallBack = false A callback to be called on AJAX error. Ex: connectivity issue.
  * @return {Function} Contextual callback returns based on status cases and returned data.
  */
 function execAjax(p_url,p_data,p_successFunc,p_errorFunc,p_notifMode,p_loading, p_cancel_button, p_onAjaxErrorCallBack = false) {
	// Starting the load animation if requested.
 	if(p_loading==null || p_loading==true) {
 		startLoading();
 	}
	// Showing the cancel button during the ajax if requested.
	if(v_cancel_button !== undefined) {
		v_cancel_button.style.display = 'none';

		if(p_cancel_button != null && p_cancel_button == true) {
			v_cancel_button.style.display = 'block';
		}
	}
	// Setting the token.
 	var csrftoken = getCookie('omnidb_csrftoken');
	// Requesting data with ajax.
 	v_ajax_call = $.ajax({
 		url: v_url_folder + p_url,
 		data: {
 			data: p_data,
 			tab_token: ''
 		},
 		type: "post",
 		dataType: "json",
 		beforeSend: function(xhr, settings) {
 			if(!csrfSafeMethod(settings.type) && !this.crossDomain) {
 				xhr.setRequestHeader("X-CSRFToken", csrftoken);
 			}
 		},
 		success: function(p_return) {
			// Terminating the load animation.
 			if(p_loading==null || p_loading==true) {
 				endLoading();
 			}
			// Intercepting the workflow when the request returns with evaluated server errors.
 			if(p_return.v_error) {
 				if(p_return.v_error_id == 1) {
 					showAlert('Session object was destroyed, click <a href="/login">here</a> to be redirected to login screen or finish what you were doing and reload the page.');
 				}
 				else if(p_errorFunc) {
 					p_errorFunc(p_return);
 				}
 				else {
 					showError(p_return.v_data);
 				}
 			}
			// Resuming the workflow with the success callback function.
 			else {
 				if(p_successFunc != null) {
 					p_successFunc(p_return);
 				}
 			}
 		},
 		error: function(msg) {
			// Calling the optional function assigned as a callback if the ajax request fails.
 			if (p_onAjaxErrorCallBack) {
 				p_onAjaxErrorCallBack(msg);
 			}
			// Terminating the load animation.
 			if(p_loading == null || p_loading == true) {
 				endLoading();
 			}
			// Prompting error messages related to ajax error.
 			if(msg.readyState != 0) {
 				showAlert('Request error.')
 			}
 			else {
 				if(msg.statusText!='abort') {
 					reportOffline();
 				}
 			}
 		}
 	});
 }

/**
 * Reporting that webserver is off.
 */
function reportOffline() {
	showAlert('Webserver was shutdown, please restart it and reload the application.');
	var v_status_img = document.getElementById("ajax_status");
}
