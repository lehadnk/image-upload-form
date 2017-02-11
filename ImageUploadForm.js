/**
 * Created by lehadnk on 04/02/2017.
 */
(function($) {

    function uploadImage() {
        var formData = new FormData();
        formData.append('file', $(this)[0].files[0]);

        var url = $(this).data('url');

        $.ajax({
            url : url,
            type : 'POST',
            data : formData,
            processData: false,
            contentType: false,
            success : function(data) {
                console.log(data);
                alert(data);
            }
        });
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
            var imageContainer = createElement(container, '<div></div>', styles.content.thumb.container);
            var thumbContainer = createElement(imageContainer, '<div></div>', styles.content.thumb.thumbContainer);
            $(image).appendTo(thumbContainer).addClass(styles.content.thumb.thumb).show();

            var footerContainer = createElement(imageContainer, '<div></div>', styles.content.thumb.footerContainer);
            var footerButtonsContainer = createElement(footerContainer, '<div></div>', styles.content.thumb.footerButtonsContainer);
            createElement(footerButtonsContainer, '<button>'+settings.text.deleteButton+'</button>', styles.content.thumb.deleteButton);
        });
    }

    function getTotalText(container, settings) {
        var images = $(container).children('img');
        return images.length+' images total, <b>3.14 Mb</b>';
    }

    function renderUI(container, settings) {
        var preloadImages = getPreloadImages(container);

        var styles = settings.style;

        var header = createElement(container, '<div></div>', styles.header.container);
        createElement(header, '<h3>'+settings.text.formHeader+'</h3>', styles.header.header);
        var headerButtonsContainer = createElement(header, '<div></div>', styles.header.buttonsContainer);
        var uploadButton = createElement(headerButtonsContainer, '<input type="file"></input>', styles.header.addImageButton);
        $(uploadButton).on('change', uploadImage);
        $(uploadButton).data('url', settings.uploadUrl);

        var body = createElement(container, '<div></div>', styles.content.container);
        var row = createElement(body, '<div></div>', styles.content.row).addClass(settings.imageContainerClass);

        if (preloadImages.length == 0) {
            $(body).hide();
        } else {
            renderPreloadImages(row, preloadImages, settings, styles);
        }

        var footer = createElement(container, '<div></div>', styles.footer.container);
        $('<p>'+getTotalText(container, settings)+'</p>').prependTo(footer).addClass(styles.footer.infoBlock).addClass(settings.footerHintClass);
    }

    function render(container, settings) {
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
            'imageContainerClass': 'iuf-image-container',
            'footerHintClass': 'iuf-footer-hint',
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