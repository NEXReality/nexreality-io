// Car configurator — UI: circular color selection at bottom

document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.bottom-bar');
    if (!bar) return;

    var colorGroup = bar.querySelector('[data-group="color"]');
    if (!colorGroup) return;

    colorGroup.querySelectorAll('.circle-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var index = parseInt(btn.getAttribute('data-index'), 10);
            colorGroup.querySelectorAll('.circle-option').forEach(function (b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            if (window.carViewer) window.carViewer.setCarColor(index);
        });
    });
});
