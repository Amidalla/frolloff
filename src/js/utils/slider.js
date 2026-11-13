// Один слайд — листать нечего: помечаем корень слайдера классом .slider-single
// (CSS прячет внутри него стрелки и пагинацию) и сообщаем, что Swiper не нужен.
export function isSingleSlide(root, slider = root) {
    const single = slider.querySelectorAll(".swiper-slide").length < 2;
    root.classList.toggle("slider-single", single);
    return single;
}
