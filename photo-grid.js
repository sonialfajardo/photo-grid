var apiError;
var currentPhotoIndex;
var defaultNumPhotos = 12;
var defaultSearch = "seleccion Colombia mundial";
var flickrKey = "your-flickr-key-here";
var instructions;
var keyCodes = {LEFT_ARROW: 37, RIGHT_ARROW: 39, ESC: 27};
var lightboxContainer;
var noPhotos;
var photosInfo = {};
var resultNumPhotos;
var searchInput;

var updateLightBox = function (direction) {
  var photo;
  var index;

  if ("left" === direction) {
    // If current photo is the first one, and direcion is left, display the
    // last photo next
    index = currentPhotoIndex - 1;
    if (index < 0) {
      index = resultNumPhotos - 1;
    }
  } else {
    // If current photo is the last one, and direction is right, display the
    // first photo next
    index = currentPhotoIndex + 1;
    if (index >= resultNumPhotos) {
      index = 0;
    }
  }

  photo = photosInfo[index];
  showLightbox(photo);
};

var onArrowClick = function (event) {
  event.stopPropagation();
  updateLightBox(event.target.name);
};

var togglePhoto = function (event) {
  event.stopPropagation();
  if (event.which === keyCodes.LEFT_ARROW) {
    updateLightBox("left");
  } else if (event.which === keyCodes.RIGHT_ARROW) {
    updateLightBox("right");
  }
};

var closeLightbox = function (event) {
  event.stopPropagation();
  if(event.target.id == "close" ||
      event.target.id == "lightboxContainer" ||
      event.which == keyCodes.ESC) {
    lightboxContainer.style.display = "none";
  }
};

var showLightbox = function (photo) {
  document.getElementById("photoImage").src = photo.src;
  document.getElementById("photoTitle").innerHTML = photo.title;

  // Update current photo index in lightbox
  currentPhotoIndex = photo.index;
};

var onThumbnailClick = function (event) {
  lightboxContainer.style.display = "block";  
  showLightbox(event.target);
};

var initiThumbnails = function (thumbnailContainer) {
  var thumbnails = thumbnailContainer.childNodes;
  for (var i = 0; i < thumbnails.length; ++i) {
    thumbnails[i].addEventListener("click", onThumbnailClick, false);
  }
};

var buildPhotoUrl = function (photoInfo) {
  return "https://farm" + photoInfo.farm + ".staticflickr.com/" +
    photoInfo.server + "/" + photoInfo.id + "_" + photoInfo.secret + ".jpg";
};

var createThumbnails = function (photos) {
  // Update total number of photos from current search results
  resultNumPhotos = photos.length;
  // Reset photos info object
  photosInfo = {};
  for (var i = 0; i < resultNumPhotos; i++) {
    var thumbnail = document.createElement("LI");
    var thumbnailImage = document.createElement("IMG");
    var title = photos[i].title;
    var src = buildPhotoUrl(photos[i]);

    thumbnail.className = "thumbnail";
    thumbnailImage.id = photos[i].id;
    thumbnailImage.className = "thumbnail_photo";
    thumbnailImage.src = src;
    thumbnailImage.title = title;
    thumbnailImage.index = i;
    thumbnail.appendChild(thumbnailImage);
    thumbnails.appendChild(thumbnail);

    // Add photo info to photos info object
    photosInfo[i] = {title: title, src: src, index: i};
  }
  return thumbnails;
};

var resetThumbnails = function () {
  var thumbnails = document.getElementById("thumbnails");
  while (thumbnails.firstChild) {
      thumbnails.removeChild(thumbnails.firstChild);
  }
};

var displayPhotos = function (data) {
  resetThumbnails();  
  instructions.style.display = "none";
  if (data.stat !== "ok") {
    // API error
    apiError.style.display = "block";
  } else if (data.photos.photo.length === 0) {
    // No photos found with that search criteria
    noPhotos.style.display = "block";
  } else {
    apiError.style.display = "none";
    noPhotos.style.display = "none";

    // Photos successfuly retrieved from the API, so create thumbnails
    var thumbnails = createThumbnails(data.photos.photo);
    initiThumbnails(thumbnails);
    instructions.style.display = "block";
  }
};

var search = function () {
  var searchText = searchInput.value;
  getPhotos(searchText);
};

var getPhotos = function (searchTerm) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = JSON.parse(xmlhttp.responseText);
      displayPhotos(data);
    }
  };
  var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search" +
    "&api_key="+ flickrKey + "&text=" + searchTerm +
    "&page=1&per_page=" + defaultNumPhotos + "&format=json&nojsoncallback=1";
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

var initLightBox = function () {
  lightboxContainer.addEventListener('click', closeLightbox, false);
  document.getElementById("close").addEventListener('click', closeLightbox, false);
  window.addEventListener("keydown", closeLightbox, false);
  window.addEventListener("keydown", togglePhoto, false);

  var arrows = document.querySelectorAll("img.arrow");
  for (var i = 0; i < arrows.length; ++i) {
    arrows[i].addEventListener("click", onArrowClick, false);
  }
};

window.onload = function () {
  // Cache HTML elements that are used more than once
  apiError = document.getElementById("apiError");
  instructions = document.getElementById("thumbnailInstructions");
  lightboxContainer = document.getElementById("lightboxContainer");
  noPhotos = document.getElementById("noPhotos");
  searchInput = document.getElementById("searchInput");

  initLightBox();
  getPhotos(defaultSearch);
};
