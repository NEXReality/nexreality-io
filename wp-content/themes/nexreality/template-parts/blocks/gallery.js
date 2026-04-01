var $masonry;

function loadGalleryBlock(id) {
  console.log("loadGalleryBlock for id: " + id);

  $masonryBlock = jQuery('#' + id).masonry({
    // options
    //itemSelector: '.gallery-item',
    percentPosition: true,
    gutter: 0,
  });

  if (typeof initPhotoSwipeFromDOM !== 'undefined') {
    initPhotoSwipeFromDOM('#' + id);
  }
}