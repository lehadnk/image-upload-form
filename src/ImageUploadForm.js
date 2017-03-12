/**
 * Created by lehadnk on 04/02/2017.
 */
(function($) {

    /**
     * jQuery function registration
     * @param action
     * @param options
     */
    $.fn.imageUploadForm = function(options){
        var settings = $.extend({
            'maxFiles': 7,
            'style': $.fn.imageUploadForm.getStyles(),
            'text': {
                'formHeader': 'Image Upload',
                'deleteButton': 'Delete',
            },
            'uploadUrl': '',
            'deleteUrl': '',
        }, options);

        render(this, settings);
    }

    /**
     * Container classes for internal usage. Since we're allowing user to change
     * class names for all the entities, we require to have some constants to access
     * it.
     * @type {{imageContainerClass: string, footerHintClass: string, imagePatternClass: string, imageThumbContainer: string, thumbContainer: string, pluginContainer: string, thumb: string, overlay: string}}
     */
    $.fn.imageUploadForm.serviceVars = {
        'imageContainerClass': 'iuf-image-container',
        'footerHintClass': 'iuf-footer-hint',
        'imagePatternClass': 'iuf-image-pattern',
        'imageThumbContainer': 'iuf-image-thumb-container',
        'pluginContainer': 'iuf-plugin-container',
        'overlay': 'iuf-overlay',

        /**
         * @todo These two not just a names, but also contains some css rules. Not a good approach.
         */
        'thumbContainer': 'iuf-thumb-container',
        'thumb': 'iuf-thumb-image'
    }
    var serviceVars = $.fn.imageUploadForm.serviceVars;

    /**
     * Creates a thumbnail card with an image
     * @param container
     * @param image
     */
    $.fn.imageUploadForm.createThumbnail = function(container, image) {
        var newImageContainer = createThumbContainer(container);
        addImageToThumbContainer(newImageContainer, image);
    }

    /**
     * Displays dismissible error flash.
     * @param title
     * @param text
     */
    function displayError(container, title, text) {
        var boxBody = $(getImageContainer(container)).parent();
        $.fn.imageUploadForm.renderError(boxBody, title, text);
    }

    /**
     * Uploads the contents of <input> to a server.
     *
     * A positive response should be a JSON-formatted string with three
     * fields: "status", "src" and "id".
     * First is bool representing a status of the operation, next is the
     * uri of the image (or thumbnail) and last one is an ID which will
     * be sent to server if user will hit the delete button.
     *
     * In case of unsuccessful operation "src" and "id" fields may be not
     * preserved and replaced with "error" field containing a message which
     * will be shown to the user. If no error message provided, default system
     * message will be shown.
     *
     * E.g.:
     * Default positive pesponse:
     * {
     *      "status": true,
     *      "src": "/upload/123.jpg",
     *      "id": 6395
     * }
     *
     * Negative response, default message:
     * {
     *      "status": false
     * }
     *
     * Negative response, a message "Something went wrong!" will be
     * shown:
     * {
     *      "status": false,
     *      "error": "Something went wrong!"
     * }
     *
     */
    function uploadImage() {
        var formData = new FormData();
        formData.append('file', $(this)[0].files[0]);
        formData.append('action', 'upload');

        var url = $(this).data('url');

        var placeholderContainer = createThumbContainer(getImageContainer(this));
        addLoadingOverlay(placeholderContainer);

        $.ajax({
            url : url,
            type : 'POST',
            data : formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success : function(data) {
                if (!data.src || !data.id || !data.status) {
                    if (data.error) {
                        displayError(placeholderContainer, 'Error!', data.error);
                    } else {
                        displayError(placeholderContainer, 'Error!', "It looks like there's something wrong with server response. Please notice server administrator about it.");
                    }
                    removeImage(placeholderContainer);
                }
                removeLoadingOverlay(placeholderContainer);
                addImageToThumbContainer(placeholderContainer, dataToImg(data));
                updateTotalText(placeholderContainer);
            },
            error: function() {
                displayError(placeholderContainer, 'Error!', 'Internal server error.');
                removeImage(placeholderContainer);
            },
            timeout: 15000
        });
    }

    /**
     * Sends a request for removing the image from a server.
     * Server should respond if deletion is allowed or not.
     *
     * Response should be json-formatted string with two
     * fields 'status' and 'error'. First is boolean variable
     * displaying if file should be removed from the GUI, and
     * second is error message should be displayed, if any of
     * it required. These variables could be combined different
     * ways (e.g. we didn't found an image referencing to this
     * on server, so we want to remove it from the GUI too to
     * not confuse the user:
     * {
     *      "status": true,
     *      "error": "No such image exists",
     * }
     *
     * Standard positive answer should be like this:
     * {
     *      "status": true,
     *      "error": false
     * }
     */
    function deleteImage() {
        var id = $($(this).parents('.'+serviceVars.thumbContainer)[0]).find('img').data('id');
        var url = $(this).data('url');

        var container = $(this).parent();
        addLoadingOverlay(container);

        $.ajax({
            url : url,
            type : 'POST',
            data : {
                'action': 'delete',
                'id': id,
            },
            dataType: 'json',
            success : function(data) {
                removeLoadingOverlay(container);
                if (data.error) {
                    displayError(container, 'Error!', data.error);
                }
                if (data.status) {
                    removeImage($(container).parents('.'+serviceVars.thumbContainer));
                }
            },
            error: function() {
                removeLoadingOverlay(container);
                displayError(container, 'Error!', 'Internal server error.');
            },
            timeout: 15000
        });
    }

    /**
     * Removes the image thumbnail from the interface
     * @param container
     */
    function removeImage(container) {
        $(container).hide('fade', function() {
            var parent = container.parent();
            $(container).remove();
            updateTotalText(parent);
        });
    }

    /**
     * Searches through DOM to find an "Image Container" collection.
     * @param element Starting element
     * @returns {*}
     */
    function getImageContainer(element) {
        return $($(element).parents('.'+serviceVars.pluginContainer)[0]).find('.'+serviceVars.imageContainerClass)[0];
    }

    /**
     * Prepares images which was in the container already for further
     * use, then returns them.
     * @param container
     * @returns {*}
     */
    function getPreloadImages(container) {
        var images = $(container).children('img');
        images.each(function (key, image) {
            $(image).hide();
        });
        return images;
    }

    /**
     * Updates the text in a "total" block.
     * @param container
     * @param settings
     * @returns {string}
     */
    function updateTotalText(element) {
        var footerHint = $($(element).parents('.'+serviceVars.pluginContainer)[0]).find('.'+serviceVars.footerHintClass)[0];
        var imagesCnt = $(getImageContainer(element)).children().length - 1;

        $(footerHint).html(imagesCnt + ' images total');
    }

    /**
     * Creates a container for a thumbnail
     * @param container
     * @returns {*}
     */
    function createThumbContainer(container) {
        $(container).parent().show();
        var newImageContainer = $(container).children('.'+serviceVars.imagePatternClass).clone(true);
        newImageContainer.appendTo(container);
        newImageContainer.removeClass(serviceVars.imagePatternClass).hide().fadeIn('slow');

        return newImageContainer;
    }

    /**
     * Adds image to a thumbnail
     * @param container
     * @param image
     */
    function addImageToThumbContainer(container, image) {
        $(image).appendTo($(container).children('.'+serviceVars.imageThumbContainer)[0]);
        $(image).fadeIn('slow');
    }

    /**
     * Adds a loading overlay on top of an element.
     * @param container
     */
    function addLoadingOverlay(container) {
        $.fn.imageUploadForm.addLoadingOverlay(container);
    }

    /**
     * Removes a loading overlay from the top of an element.
     * @param container
     */
    function removeLoadingOverlay(container) {
        $(container).children('.'+$.fn.imageUploadForm.serviceVars.overlay).remove();
    }

    /**
     * Transforms the server response to <img> object
     * @param src
     * @returns {*}
     */
    function dataToImg(data) {
        return $('<img>').attr('src', data.src).data('id', data.id).addClass(serviceVars.thumb).hide();
    }

    /**
     * Transforms a set of preload <img>'s into a set of thumbnails.
     * @param container
     * @param images
     */
    function renderPreloadImages(container, images) {
        var serviceVars = $.fn.imageUploadForm.serviceVars;
        var createThumbnail = $.fn.imageUploadForm.createThumbnail;

        images.each(function(key, image){
            $(image).addClass(serviceVars.thumb);
            createThumbnail(container, image);
        });
    }

    /**
     * Renders the plugin UI
     * @param container
     * @param settings
     */
    function renderUI(container, settings) {
        var preloadImages = getPreloadImages(container);

        var styles = settings.style;

        // <Header>
            $.fn.imageUploadForm.renderHeader(container, settings, uploadImage);
        // </Header>

        // <Body>
            var body = $.fn.imageUploadForm.renderBody(container, settings, deleteImage, preloadImages);

            if (preloadImages.length == 0) {
                $(body).hide();
            } else {
                var imageContainer = getImageContainer(body);
                renderPreloadImages(imageContainer, preloadImages, settings, styles);
            }
        // </Body>

        // <Footer>
            var footer = $.fn.imageUploadForm.renderFooter(container, settings);
            updateTotalText(footer);
        // </Footer>
    }

    /**
     * Renders the plugin
     * @param container
     * @param settings
     */
    function render(container, settings) {
        $(container).addClass(serviceVars.pluginContainer).addClass(settings.style.container);
        renderUI(container, settings);
    }

    function noRendererError() {
        console.error('ImageUploadForm: no renderer set. Please set up the plugin referring to official documentation: https://github.com/lehadnk/image-upload-form#renderers');
    }

    /**
     * This function should the return the JSON structure containing a list of possible
     * styles used by different elements, so user can overload it if needed.
     *
     * This structure should contain 'container' element which will be applied to a
     * plugin container. This field is mandatory.
     *
     * E.g.:
     * return {
     *   'container': 'box box-primary',
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
    $.fn.imageUploadForm.getStyles = noRendererError;

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
    $.fn.imageUploadForm.renderHeader = noRendererError;

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
    $.fn.imageUploadForm.renderBody = noRendererError;

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
    $.fn.imageUploadForm.renderFooter = noRendererError;

    /**
     * This function should render an error message to inform user that something went wrong.
     *
     * @param container A container containing image thumbnail cards. Most likely this is a place where you would like
     * to place the message, but you could traverse the DOM tree from here using classes stored in serviceVars if you want.
     * @param title
     * @param text
     */
    $.fn.imageUploadForm.renderError = noRendererError;

    /**
     * This function should display a loading overlay on top of the provided container.
     *
     * Following serviceVars should be used as an element classes of this block:
     * $.fn.imageUploadForm.serviceVars.overlay: an overlay container element. Will be destroyed when loading is over.
     *
     * @param container
     */
    $.fn.imageUploadForm.addLoadingOverlay = noRendererError;
}(jQuery));