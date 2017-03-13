/**
 * Created by lehadnk on 12/03/2017.
 *
 * A template for custom renderer for ImageUploadForm plugin.
 * You could clone and re-use it to create your custom renderer.
 */

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

/**
 * This function should the return the JSON structure containing a list of possible
 * styles used by different elements, so user can overload it if needed:
 *
 * E.g.:
 * return {
     *   'header': {
     *       'container': 'box-header with-border',
     *       'header': 'box-title',
     *       'buttonsContainer': 'box-tools pull-right',
     *       'addImageButton': 'btn btn-primary btn-sm',
     *   },
     *
     *  $('#container').imageUploadForm({
     *      'styles': {
     *          'header': {
     *              'container': 'my-header-container-class'
     *          }
     *      }
     *  });
     */
$.fn.imageUploadForm.getStyles = function() {
    return {
        'container': 'panel panel-default',
        'header': {
            'container': 'panel-heading',
            'header': 'iuf-bootstrap-header pull-left',
            'input': 'btn btn-primary btn-sm pull-right'
        },
        'content': {
            'container': 'panel-body',
            'row': 'row',
            'thumb': {
                'container': 'col-lg-3 col-md-6 col-xs-12',
                'thumbContainer': 'thumbnail iuf-bootstrap-card iuf-preview-container',
                'image': 'iuf-thumb-image',
                'footerContainer': 'panel-body iuf-thumb-footer',
                'deleteButton': 'btn btn-danger'
            }
        },
        'footer': {
            'container': 'panel-footer',
            'infoBlock': 'help-block'
        }
    };
}

/**
 * This function should draw a plugin header.
 *
 * Useful constructions:
 * settings.style - JSON array of element styles, available for user to overload them (@see $.fn.imageUploadForm.getStyles)
 * uploadImage - a reference to image upload function. E.g.:
 * $('<input type="file"></input>').appendTo(container).on('change', uploadImage);
 * settings.uploadUrl - an upload URL. Should be a data- property of input element E.g.:
 * $(uploadButton).data('url', settings.uploadUrl);
 *
 * @param container
 * @param settings
 * @param uploadImage
 */
$.fn.imageUploadForm.renderHeader = function(container, settings, uploadImage) {
    var styles = settings.style;

    var header = createElement(container, '<div></div>', styles.header.container);
    var row = createElement(header, '<div></div>', 'row');
    var col = createElement(row, '<div></div>', 'col-sm-12');

    createElement(col, '<h3>'+settings.text.formHeader+'</h3>', styles.header.header);

    var uploadButton = createElement(col, '<input type="file"></input>', styles.header.input);
    $(uploadButton).on('change', uploadImage);
    $(uploadButton).data('url', settings.uploadUrl);
}

/**
 * This function should draw a plugin body.
 *
 * The body container should be returned by this function.
 *
 * Also, a hidden pattern of image thumbnail card should be created as a part of this call. It should be placed
 * in the same container which is used for holding image thumbnails, and have a class declared in
 * $.fn.imageUploadForm.serviceVars.imagePatternClass
 *
 * Following element classes must be present in this block:
 * $.fn.imageUploadForm.serviceVars.imageContainerClass: a container for thumbnail cards
 * $.fn.imageUploadForm.serviceVars.imagePatternClass: hidden thumbnail pattern container.
 * $.fn.imageUploadForm.serviceVars.imageThumbContainer: a container for <img> inside a thumb card
 *
 * @param container
 * @param settings
 * @param deleteImage
 */
$.fn.imageUploadForm.renderBody = function(container, settings, deleteImage) {
    var styles = settings.style;
    var serviceVars = $.fn.imageUploadForm.serviceVars;

    var bodyContainer = createElement(container, '<div></div>', styles.content.container).addClass(serviceVars.imageContainerClass);

    // Image Pattern
        var imagePatternContainer = createElement(bodyContainer, '<div></div>', styles.content.thumb.container).addClass(serviceVars.imagePatternClass);
        createElement(imagePatternContainer, '<div></div>', styles.content.thumb.thumbContainer).addClass(serviceVars.imageThumbContainer);

        var footerContainer = createElement(imagePatternContainer, '<div></div>', styles.content.thumb.footerContainer);
        var deleteButton = createElement(footerContainer, '<button>'+settings.text.deleteButton+'</button>', styles.content.thumb.deleteButton);
        deleteButton.on('click', deleteImage);
        deleteButton.data('url', settings.deleteUrl);
    // !Image Pattern

    return bodyContainer;
}

/**
 * This function should render a plugin footer.
 *
 * The main footer container should be returned by this function.
 *
 * Following serviceVars should be used as an element classes of this block:
 * $.fn.imageUploadForm.serviceVars.footerHintClass: hint block in the footer of the element. Contains an information
 * such as total number of images, e.t.c.
 *
 * @param container
 * @param settings
 * @returns {*}
 */
$.fn.imageUploadForm.renderFooter = function(container, settings) {
    var footerContainer = createElement(container, '<div></div>', settings.style.footer.container);
    createElement(footerContainer, '<p></p>', settings.style.footer.infoBlock).addClass($.fn.imageUploadForm.serviceVars.footerHintClass);

    return footerContainer;
}

/**
 * This function should render an error message to inform user that something went wrong.
 *
 * @param container A container containing image thumbnail cards. Most likely this is a place where you would like
 * to place the message, but you could traverse the DOM tree from here using classes stored in serviceVars if you want.
 * @param title
 * @param text
 */
$.fn.imageUploadForm.renderError = function(container, title, text) {
    var errorContainer = $('<div></div>').prependTo(container).addClass('alert alert-danger alert-dismissible').hide().show('fade');

    var removeErrorMessage = function() {
        $(errorContainer).hide('fade', function() {
            $(errorContainer).remove();
        });
    };
    setTimeout(removeErrorMessage, 3000);

    createElement(errorContainer, '<button>×</button>', 'close').on('click', removeErrorMessage);
    createElement(errorContainer, '<h4><i class="icon fa fa-ban"></i> '+title+'</h4>', '');
    errorContainer.append(text);
}

/**
 * This function should display a loading overlay on top of the provided container.
 *
 * Following serviceVars should be used as an element classes of this block:
 * $.fn.imageUploadForm.serviceVars.overlay: an overlay container element. Will be destroyed when loading is over.
 *
 * @param container
 */
$.fn.imageUploadForm.addLoadingOverlay = function(container, title, text) {
    createElement(container, '<div></div>', 'iuf-spinner').addClass($.fn.imageUploadForm.serviceVars.overlay);
}