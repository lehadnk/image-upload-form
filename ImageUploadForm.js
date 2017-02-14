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
    };

    /**
     * Uploads the contents of <input> to a server
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
                removeLoadingOverlay(placeholderContainer);
                addImageToThumbContainer(placeholderContainer, srcToImg(data.src));
            }.bind(this)
        });
    }

    /**
     * Sends a request for removing the image from a server.
     * Server should respond if deletion is allowed or not.
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
            success : function(data) {
                removeLoadingOverlay(container);
                removeImage($(container).parents('.'+serviceVars.thumbContainer));
            }.bind(this)
        });
    }

    /**
     * Removes the image thumbnail from the interface
     * @param container
     */
    function removeImage(container) {
        $(container).hide('fade', function() {
            $(container).remove();
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
     * Returns a text for a "total" block.
     * @param container
     * @param settings
     * @returns {string}
     */
    function getTotalText(container, settings) {
        var images = $(container).children('img');
        return images.length+' images total, <b>3.14 Mb</b>';
    }

    /**
     * Creates a container for a thumbnail
     * @param container
     * @returns {*}
     */
    function createThumbContainer(container) {
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
     * Gets the uri of an image, and transforms it into an <img>
     * @param src
     * @returns {*}
     */
    function srcToImg(src) {
        return $('<img>').attr('src', src).hide();
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
            $('<p>'+getTotalText(container, settings)+'</p>').prependTo(footer).addClass(styles.footer.infoBlock).addClass(serviceVars.footerHintClass);
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
                'total': '{0} images total, <b>{1}</b>'
            },
            'uploadUrl': '',
            'deleteUrl': '',
        }, options);

        render(this, settings);
    }
}(jQuery));