# image-upload-form
[Demo page](https://lehadnk.github.io/image-upload-form/)

Responsive jQuery-powered multiple image upload form for various css frameworks.

# Prerequisites
* jQuery 1.7+

# CSS Framework Integration
* [AdminLTE](https://almsaeedstudio.com/themes/AdminLTE/index2.html)
* [Bootstrap 3](http://getbootstrap.com)
* (TBD) [Semantic UI](http://semantic-ui.com)

You could refer to [Renderers](#renderers) section of this guide for detailed information.

# Installation guide
You could install the package via bower package manager:
```
bower install image-upload-form
```
Or just download the files manually from the build/ folder and place them whenever you want.

# Usage example
```html
<script type="text/javascript" src="build/ImageUploadForm.js"></script>
<script type="text/javascript" src="build/ImageUploadFormAdminLTE.min.js"></script>
<link type="text/css" href="build/ImageUploadForm.css"></script>

<script>
    $(function() {
        $('#uploadForm').imageUploadForm({
            'uploadUrl': '/file/upload/',
            'deleteUrl': '/file/delete/',
        });
    });
</script>

<div id="uploadForm"></div>
```

# API
image-upload-form uses only two requests: upload and delete. You should implement them both for the correct work of the plugin.
### Upload
URL configuration parameter: uploadUrl

An upload request is a typical jqXHR request:
```text
POST uploadUrl
Accept: "application/json"
Cache-Control: "no-cache"
Content-Disposition: form-data;
name="file"; filename="Screen Shot 2017-02-11 at 2.15.10 AM.png"
Content-Type: image/png
...
Content-Disposition: form-data; name="action"

upload
```
Two only parameters in this request are "file" representing the contents of the file, and "action" which is always "upload" so you could bind both requests to the same url if you want.

A positive response should be a JSON-formatted string with three fields: "status", "src" and "id". First is bool representing a status of the operation, next is the uri of the image (or thumbnail) and the last one is an ID which will be sent to server if user will hit the delete button.

In case of unsuccessful operation "src" and "id" fields may be not preserved and replaced with "error" field containing a message which will be shown to the user. If no error message provided, the default system message will be shown.

E.g.:
Default positive pesponse:
```json
{
    "status": true,
    "src": "/upload/123.jpg",
    "id": 6395
}
```

Negative response, default message:
```json
{
     "status": false
}
```

Negative response, an error message "Something went wrong!" will be shown:
```json
{
     "status": false,
     "error": "Something went wrong!"
}
```

## Delete
URL configuration parameter: deleteUrl

Request example:
```
POST deleteUrl
Accept: "application/json"
Cache-Control: "no-cache"
action=delete
id=56
```

Delete request provides you an action name ("action"), allowing you to use the same URL for both actions, and also id parameter, which is the system identifier for the image.

The response should be json-formatted string with two fields 'status' and 'error'. First is a boolean variable displaying if file should be removed from the GUI, and the second is error message should be displayed, if any of it required. These variables could be combined in different ways (e.g. we didn't find an image referencing to this on server, so we want to remove it from the GUI too to not confuse the user):
```json
{
    "status": true,
    "error": "No such image exists",
}
```

Standard positive response should be like this:
```json
{
     "status": true,
     "error": false
}
```

# Pre-load images
You're able to pre-fill the form with some images which was already uploaded to a server:
```html
<div class="myForm">
    <img src="/img/123.jpg" data-id="4">
    <img src="/img/photo.jpg" data-id="8">
    <img src="/img/photo2.jpg" data-id="15">
    <img src="/img/myimg.png" data-id="16">
    <img src="/img/2194182312.jpeg" data-id="23">
    <img src="/img/photo_old.gif" data-id="42">
</div>

<script type="text/javascript">
    $(function() {
        $('#myForm').imageUploadForm({
            'uploadUrl': '/file/upload/',
            'deleteUrl': '/file/delete/',
        });
    });
</script>
```

# Renderers
ImageUploadForm has a "renderers" feature which is allowing you to pick a design matching the CSS framework you use by simply including a renderer file suiting your needs:
```html
<!-- AdminLTE -->
<script type="text/javascript" src="build/ImageUploadForm.min.js"></script>
<script type="text/javascript" src="build/ImageUploadFormAdminLTE.min.js"></script>

<!-- Bootstrap -->
<script type="text/javascript" src="build/ImageUploadForm.min.js"></script>
<script type="text/javascript" src="build/ImageUploadFormBootstrap.min.js"></script>

<!-- Any other custom renderer created by you -->
<script type="text/javascript" src="build/ImageUploadForm.min.js"></script>
<script type="text/javascript" src="/js/ImageUploadFormMyRenderer.js"></script>
```
**!RENDERER FILE SHOULD BE PLACED ONLY AFTER THE MAIN PLUGIN FILE!**

## Custom renderers
You could clone `src\renderers\_RendererTemplate.js` to create a custom renderer to change the way plugin looks, or to provide a support of a CMS or Framework you use.

All the details, renderer skeleton and code snippets are available in `_RendererTemplate.js`.

# Server script example
Here's an example of a simple PHP server script which could be used to handle image-upload-form requests:
```php
<?php

$targetDir = 'img/';

if ($_POST['action'] == 'upload') {
    try {
        $file = array_shift($_FILES);
        $name = $targetDir.$file['name'];
        move_uploaded_file($file['tmp_name'], $name);
        
        echo json_encode([
            'status' => true,
            'src' => 'http://test-server.local/'.$name,
            'id' => $file['name'],
        ]);
    } catch (Exception $e) {
        echo json_encode(['status' => false]);
    }
}

if ($_POST['action'] == 'delete') {
    try {
        $file = $_POST['id'];
        
        if (file_exists($targetDir.$file)) {
            unlink($targetDir.$file);
            echo json_encode(['status' => true]);
        } else {
            echo json_encode([
                'status' => true,
                'error' => 'Unable to find this image',
            ]);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => false]);
    }
}
```
**!ATTENTION! NEVER USE THIS SCRIPT IN PRODUCTION ENVIRONMENT. IT IS EXTREMELY UNSAFE AND FOR TESTING PURPOSES ONLY!**

# Framework Support
image-upload-form is also available as extension:
* [Yii2](https://github.com/lehadnk/yii2-image-upload-form)
* Symfony (TBD)