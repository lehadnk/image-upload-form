/**
 * Created by lehadnk on 04/02/2017.
 */
(function($) {

    /**
     * Container classes for internal usage. Since we're allowing user to change
     * class names for all the entities, we require to have some constants to access
     * it.
     * @type {{imageContainerClass: string, footerHintClass: string, imagePatternClass: string, imageThumbContainer: string, thumbContainer: string, pluginContainer: string}}
     */
    var serviceVars = {
        'imageContainerClass': 'iuf-image-container',
        'footerHintClass': 'iuf-footer-hint',
        'imagePatternClass': 'iuf-image-pattern',
        'imageThumbContainer': 'iuf-image-thumb-container',
        'thumbContainer': 'iuf-thumb-container',
        'pluginContainer': 'iuf-plugin-container',
        'thumb': 'iuf-thumb-image',
    };

    /**
     * Displays dismissible error flash.
     * @param title
     * @param text
     */
    function displayError(container, title, text) {
        var boxBody = $(getImageContainer(container)).parent();

        var errorContainer = $('<div></div>').prependTo(boxBody).addClass('alert alert-danger alert-dismissible').hide().show('fade');

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
     *      status: true,
     *      src: '/upload/123.jpg',
     *      id: 6395
     * }
     *
     * Negative response, default message:
     * {
     *      status: false
     * }
     *
     * Negative response, a message "Something went wrong!" will be
     * shown:
     * {
     *      status: false,
     *      error: "Something went wrong!"
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
     *      'status': true,
     *      'error': 'No such image exists',
     * }
     *
     * Standard positive answer should be like this:
     * {
     *      'status': true,
     *      'error': false
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
     * Prepares images which was in the container already for further
     * use, then returns them.
     * @param container
     * @returns {*}
     */
    function getPreloadImages(container) {
        var images = $(container).children('img');
        images.each(function(key, image){
            $(image).hide();
        });
        return images;
    }

    /**
     * Transforms a set of preload <img>'s into a thumbnails.
     * @param container
     * @param images
     * @param settings
     * @param styles
     */
    function renderPreloadImages(container, images) {
        images.each(function(key, image){
            createThumbnail(container, image);
        });
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
        var overlay = createElement(container, '<div></div>', 'overlay');
        createElement(overlay, '<i></i>', 'fa fa-refresh fa-spin');
    }

    /**
     * Removes a loading overlay from the top of an element.
     * @param container
     */
    function removeLoadingOverlay(container) {
        $(container).children('.overlay').remove();
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
     * Creates a thumbnail card with an image
     * @param container
     * @param image
     */
    function createThumbnail(container, image) {
        var newImageContainer = createThumbContainer(container);
        addImageToThumbContainer(newImageContainer, image);
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
            var header = createElement(container, '<div></div>', styles.header.container);
            createElement(header, '<h3>'+settings.text.formHeader+'</h3>', styles.header.header);
            var headerButtonsContainer = createElement(header, '<div></div>', styles.header.buttonsContainer);
            var uploadButton = createElement(headerButtonsContainer, '<input type="file"></input>', styles.header.addImageButton);
            $(uploadButton).on('change', uploadImage);
            $(uploadButton).data('url', settings.uploadUrl);
        // </Header>

        // <Body>
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

            if (preloadImages.length == 0) {
                $(body).hide();
            } else {
                renderPreloadImages(row, preloadImages, settings, styles);
            }
        // </Body>

        // <Footer>
            var footer = createElement(container, '<div></div>', styles.footer.container);
            createElement(footer, '<p></p>', styles.footer.infoBlock).addClass(serviceVars.footerHintClass);
            updateTotalText(footer);
        // </Footer>
    }

    /**
     * Renders the plugin
     * @param container
     * @param settings
     */
    function render(container, settings) {
        $(container).addClass(serviceVars.pluginContainer);
        renderUI(container, settings);
    }

    $.fn.imageUploadForm = function(options){
        var settings = $.extend({
            'maxFiles': 7,
            'style': {
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
            },
            'text': {
                'formHeader': 'Image Upload',
                'deleteButton': 'Delete',
            },
            'uploadUrl': '',
            'deleteUrl': '',
        }, options);

        render(this, settings);
    }
}(jQuery));