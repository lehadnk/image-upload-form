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
        'container': ''
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
 * @param preloadImages
 */
$.fn.imageUploadForm.renderBody = function(container, settings, deleteImage, preloadImages) {
    // .addClass($.fn.imageUploadForm.serviceVars.imageContainerClass);
    // .addClass($.fn.imageUploadForm.serviceVars.imagePatternClass);
    // .addClass($.fn.imageUploadForm.serviceVars.imageThumbContainer);

    // if (preloadImages.length == 0) {
    //     $(body).hide();
    // } else {
    //     $.fn.imageUploadForm.renderPreloadImages(row, preloadImages, settings, styles);
    // }

    // return bodyContainer;
}

/**
 * This function should render a plugin footer.
 *
 * The main footer container should be returned by this function.
 *
 * Following serviceVars should be used as an element classes of this block:
 * $.fn.imageUploadForm.serviceVars.imagePatternClass: hint block in the footer of the element. Contains an information
 * such as total number of images, e.t.c.
 *
 * @param container
 * @param settings
 * @returns {*}
 */
$.fn.imageUploadForm.renderFooter = function(container, settings) {
    // .addClass($.fn.imageUploadForm.serviceVars.imagePatternClass)

    // return footerContainer;
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
    // var removeErrorMessage = function() {
    //     $(errorContainer).hide('fade', function() {
    //         $(errorContainer).remove();
    //     });
    // };
    // setTimeout(removeErrorMessage, 3000);
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
    // addClass($.fn.imageUploadForm.serviceVars.overlay);
}