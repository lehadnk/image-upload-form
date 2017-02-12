/**
 * Created by lehadnk on 04/02/2017.
 */
(function($) {

    var serviceVars = {
        'imageContainerClass': 'iuf-image-container',
        'footerHintClass': 'iuf-footer-hint',
        'imagePatternClass': 'iuf-image-pattern',
        'imageThumbContainer': 'iuf-image-thumb-container',
        'pluginContainer': 'iuf-plugin-container',
    };

    function uploadImage() {
        var formData = new FormData();
        formData.append('file', $(this)[0].files[0]);

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

    function getImageContainer(element) {
        return $($(element).parents('.'+serviceVars.pluginContainer)[0]).find('.'+serviceVars.imageContainerClass)[0];
    }

    function createElement(container, element, htmlClass) {
        return $(element).appendTo(container).addClass(htmlClass);
    }

    function getPreloadImages(container) {
        var images = $(container).children('img');
        images.each(function(key, image){
            $(image).hide();
        });
        return images;
    }

    function renderPreloadImages(container, images, settings, styles) {
        images.each(function(key, image){
            createThumbnail(container, image);
        });
    }

    function getTotalText(container, settings) {
        var images = $(container).children('img');
        return images.length+' images total, <b>3.14 Mb</b>';
    }

    function createThumbContainer(container) {
        var newImageContainer = $(container).children('.'+serviceVars.imagePatternClass).clone();
        newImageContainer.appendTo(container);
        newImageContainer.removeClass(serviceVars.imagePatternClass).hide().fadeIn('slow');

        return newImageContainer;
    }

    function addImageToThumbContainer(container, image) {
        $(image).appendTo($(container).children('.'+serviceVars.imageThumbContainer)[0]);
        $(image).fadeIn('slow');
    }


    function addLoadingOverlay(container) {
        var overlay = createElement(container, '<div></div>', 'overlay');
        createElement(overlay, '<i></i>', 'fa fa-refresh fa-spin');
    }

    function removeLoadingOverlay(container) {
        $(container).children('.overlay').remove();
    }

    function srcToImg(src) {
        return $('<img>').attr('src', src).hide();
    }

    function createThumbnail(container, image) {
        if (typeof image !== 'object') {
            srcToImg(src);
        }
        var newImageContainer = createThumbContainer(container);
        addImageToThumbContainer(newImageContainer, image);
    }

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
                createElement(footerButtonsContainer, '<button>'+settings.text.deleteButton+'</button>', styles.content.thumb.deleteButton);
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