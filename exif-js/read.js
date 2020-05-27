$("input").change(function() {
var file = this.files[0];
    fr   = new FileReader;

fr.onloadend = function() {
    var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));

    alert(exif.Make);
};

fr.readAsBinaryString(file);
});
