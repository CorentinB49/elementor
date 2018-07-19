var BaseMultiple = require( 'elementor-controls/base-multiple' );

module.exports = BaseMultiple.extend( {

	onReady: function() {
		var self = this,
			last, cache;

		// Based on /wp-includes/js/tinymce/plugins/wplink/plugin.js.
		this.ui.input.autocomplete( {
			source: function( request, response ) {
				if ( last === request.term ) {
					response( cache );
					return;
				}

				if ( /^https?:/.test( request.term ) || request.term.indexOf( '.' ) !== -1 ) {
					return response();
				}

				// Show Spinner.
				self.ui.input.prev().show();

				$.post( window.ajaxurl, {
					action: 'wp-link-ajax',
					page: 1,
					search: request.term,
					_ajax_linking_nonce: $( '#_ajax_linking_nonce' ).val()
				}, function( data ) {
					cache = data;
					response( data );
				}, 'json' )
					.always( function() {
						// Hide Spinner.
						self.ui.input.prev().hide();
					} );

				last = request.term;
			},
			focus: function( event, ui ) {
				/*
				 * Don't empty the URL input field, when using the arrow keys to
				 * highlight items. See api.jqueryui.com/autocomplete/#event-focus
				 */
				event.preventDefault();
			},
			select: function( event, ui ) {
				self.ui.input.val( ui.item.permalink );
				self.setValue( 'url', ui.item.permalink );
				return false;
			},
			open: function( event  ) {
				jQuery( event.target ).data( 'uiAutocomplete' ).menu.activeMenu.addClass( 'elementor-control-url-autocomplete-menu' );
			},
			minLength: 2,
			position: {
				my: 'left top+2'
			}
		} )
		// The `_renderItem` cannot be override via the arguments.
			.autocomplete( 'instance' )._renderItem = function( ul, item ) {
				var fallbackTitle = ( typeof window.wpLinkL10n !== 'undefined' ) ? window.wpLinkL10n.noTitle : '',
					title = item.title ? item.title : fallbackTitle;

				return $( '<li role="option" id="mce-wp-autocomplete-' + item.ID + '">' )
					.append( '<span>' + title + '</span>&nbsp;<span class="elementor-control-url-autocomplete-item-info">' + item.info + '</span>' )
					.appendTo( ul );
			};
		},

	onBeforeDestroy: function() {
		if ( this.ui.input.data( 'autocomplete' ) ) {
			this.ui.input.autocomplete( 'destroy' );
		}

		this.$el.remove();
	}
} );