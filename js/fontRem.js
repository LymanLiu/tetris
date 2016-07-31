(function (doc, win) {
    var docEl = doc.documentElement,
        rate  = 0,
        resizeEvt = "orientationchange" in window ? "orientationchange" : "resize",
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            if (clientWidth<640){
                rate = 20 * (clientWidth / 320);
                docEl.style.fontSize = 20 * (clientWidth / 320) + 'px';
               // console.log(12 * (clientWidth / 320) + "px");
            }else{
                //docEl.style.fontSize = "12px";
                rate = 20 *  ( 640 / 320);
                docEl.style.fontSize = 20 *  ( 640 / 320) + 'px';
            }
             window._rate = rate;
        };


    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    recalc();
    // doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);