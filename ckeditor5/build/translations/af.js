(function(n) {
  const a = (n["af"] = n["af"] || {});
  a.dictionary = Object.assign(a.dictionary || {}, {
    "Block quote": "Blok-aanhaling",
    Bold: "Vetgedruk",
    Cancel: "Kanselleer",
    Italic: "Skuinsgedruk",
    Save: "Berg",
  });
  a.getPluralForm = function(n) {
    return n != 1;
  };
})(window.CKEDITOR_TRANSLATIONS || (window.CKEDITOR_TRANSLATIONS = {}));
