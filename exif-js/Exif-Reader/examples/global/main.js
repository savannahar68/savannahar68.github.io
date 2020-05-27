/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

(function (window, document) {
    'use strict';

    if (!supportsFileReader()) {
        document.write('<strong>Sorry, your web browser does not support the FileReader API.</strong>');
        return;
    }

    window.addEventListener('load', function () {
        document.getElementById('file').addEventListener('change', handleFile, false);
    }, false);

    function supportsFileReader() {
        return window.FileReader !== undefined;
    }

    function handleFile(event) {
        var files = event.target.files;
        var reader = new FileReader();

        reader.onload = function (readerEvent) {
            try {
                var tags = ExifReader.load(readerEvent.target.result);

                // The MakerNote tag can be really large. Remove it to lower
                // memory usage if you're parsing a lot of files and saving the
                // tags.
                delete tags['MakerNote'];
                if (tags['GPSLatitude']){
                    listTags(tags);
                    popu();
                }
                else {
                    var txt;
                    txt = "no exif data";
                    noexif(txt);
                }


            } catch (error) {
                alert(error);
            }
        };

        reader.readAsArrayBuffer(files[0]);
    }

    function listTags(tags) {
        var tableBody;
        var name;
        var row;

        tableBody = document.getElementById('exif-table-body');
        for (name in tags) {
            row = document.createElement('tr');
            row.innerHTML = '<td>' + name + '</td><td>' + tags[name].description + '</td>';
            tableBody.appendChild(row);
        }
    }

    function noexif(txt){
      var tableBody;
      var name;
      var row;

      tableBody = document.getElementById('exif-table-body');

          row = document.createElement('tr');
          row.innerHTML = '<td> '+txt+'</td><td></td>';
          tableBody.appendChild(row);

    }
    function popu(){
      var txt;
      if (confirm("Exif-GPS Data present, Do you want to strip it off?")) {
        gstrip(file);
      } else {
        txt = "You pressed Cancel!";
        document.getElementById("demo").innerHTML = txt;
      }
    }

    function gstrip(file) {
      console.log("gone into ok");
      // Load the image
      var reader = new FileReader();
      reader.onload = function (readerEvent) {
       var image = new Image();
       image.onload = function (imageEvent) {

           // Resize the image
           var canvas = document.createElement('canvas'),
               max_size = 544,// TODO : pull max size from a site config
               width = image.width,
               height = image.height;
           if (width > height) {
               if (width > max_size) {
                   height *= max_size / width;
                   width = max_size;
               }
           } else {
               if (height > max_size) {
                   width *= max_size / height;
                   height = max_size;
               }
           }
           canvas.width = width;
           canvas.height = height;
           canvas.getContext('2d').drawImage(image, 0, 0, width, height);
           var dataUrl = canvas.toDataURL('image/jpeg');
           var resizedImage = dataURLToBlob(dataUrl);
           $.event.trigger({
               type: "imageResized",
               blob: resizedImage,
               url: dataUrl
           });
       }
       image.src = readerEvent.target.result;
   }
   reader.readAsDataURL(file);
   console.log("end of gstrip");
    }

    var dataURLToBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }



})(window, document);
