/**
 * Adds an element to the container. Generally, just a shorthand for the
 * standard jQuery function.
 * @param container
 * @param element
 * @param htmlClass
 * @returns {*}
 */
function createElement(container, element, htmlClass) {
    return $(element).appendTo(container).addClass(htmlClass);
}

$.fn.imageUploadForm.getStyles = function() {
    return {
        'header': {
            'container': 'box-header with-border',
            'header': 'box-title',
            'buttonsContainer': 'box-tools pull-right',
            'addImageButton': 'btn btn-primary btn-sm',
        },
        'content': {
            'container': 'box-body',
            'row': 'row',
            'thumb': {
                'container': 'col-lg-3 col-md-6 col-xs-12 iuf-thumb-container',
                'thumbContainer': 'thumbnail no-margin iuf-preview-container',
                'thumb': 'iuf-thumb-image',
                'footerContainer': 'box box-solid no-margin iuf-thumb-footer',
                'footerButtonsContainer': 'box-footer',
                'deleteButton': 'btn btn-danger',
            }
        },
        'footer': {
            'container': 'box-footer',
            'infoBlock': 'help-block'
        }
    }
}

$.fn.imageUploadForm.renderHeader = function(container, settings, uploadImage) {
    var styles = settings.style;

    var header = createElement(container, '<div></div>', styles.header.container);
    createElement(header, '<h3>'+settings.text.formHeader+'</h3>', styles.header.header);
    var headerButtonsContainer = createElement(header, '<div></div>', styles.header.buttonsContainer);
    var uploadButton = createElement(headerButtonsContainer, '<input type="file"></input>', styles.header.addImageButton);
    $(uploadButton).on('change', uploadImage);
    $(uploadButton).data('url', settings.uploadUrl);
}

$.fn.imageUploadForm.renderBody = function(container, settings, deleteImage, preloadImages) {
    var styles = settings.style;
    var serviceVars = $.fn.imageUploadForm.serviceVars;

    var body = createElement(container, '<div></div>', styles.content.container);
    var row = createElement(body, '<div></div>', styles.content.row).addClass(serviceVars.imageContainerClass);

    // Image pattern
        var imagePatternContainer = createElement(row, '<div></div>', styles.content.thumb.container).addClass(serviceVars.imagePatternClass);
        createElement(imagePatternContainer, '<div></div>', styles.content.thumb.thumbContainer).addClass(serviceVars.imageThumbContainer);

        var footerContainer = createElement(imagePatternContainer, '<div></div>', styles.content.thumb.footerContainer);
        var footerButtonsContainer = createElement(footerContainer, '<div></div>', styles.content.thumb.footerButtonsContainer);
        var deleteButton = createElement(footerButtonsContainer, '<button>'+settings.text.deleteButton+'</button>', styles.content.thumb.deleteButton);
        deleteButton.on('click', deleteImage);
        deleteButton.data('url', settings.deleteUrl);
    // !Image pattern

    return body;
}

$.fn.imageUploadForm.renderFooter = function(container, settings) {
    var styles = settings.style;
    var serviceVars = $.fn.imageUploadForm.serviceVars;

    var footer = createElement(container, '<div></div>', styles.footer.container);
    createElement(footer, '<p></p>', styles.footer.infoBlock).addClass(serviceVars.footerHintClass);
    return footer;
}

$.fn.imageUploadForm.renderError = function(container, title, text) {
    var errorContainer = $('<div></div>').prependTo(container).addClass('alert alert-danger alert-dismissible').hide().show('fade');

    var removeErrorMessage = function() {
        $(errorContainer).hide('fade', function() {
            $(errorContainer).remove();
        });
    };
    setTimeout(removeErrorMessage, 3000);

    createElement(errorContainer, '<button>×</button>', 'close').on('click', removeErrorMessage);
    createElement(errorContainer, '<h4><i class="icon fa fa-ban"></i>'+title+'</h4>', '');
    errorContainer.append(text);
}

$.fn.imageUploadForm.addLoadingOverlay = function(container) {
    var overlay = createElement(container, '<div></div>', 'overlay').addClass($.fn.imageUploadForm.serviceVars.overlay);
    createElement(overlay, '<i></i>', 'fa fa-refresh fa-spin');
}