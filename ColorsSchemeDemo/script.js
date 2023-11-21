document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const originalImage = document.getElementById('originalImage');
    const copiedImageCanvas = document.getElementById('copiedImage');
    const copiedImageContext = copiedImageCanvas.getContext('2d');

    imageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            originalImage.src = e.target.result;
            originalImage.onload = function () {
                copiedImageCanvas.width = originalImage.width;
                copiedImageCanvas.height = originalImage.height;
                copiedImageContext.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
                applyHSVConversion();
            };
        };

        reader.readAsDataURL(file);
    });

    function applyHSVConversion() {
        const imageData = copiedImageContext.getImageData(0, 0, copiedImageCanvas.width, copiedImageCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const hsv = RGBtoHSV(data[i], data[i + 1], data[i + 2]);
            const rgb = HSVtoRGB(hsv.h, hsv.s, hsv.v);

            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
        }

        copiedImageContext.putImageData(imageData, 0, 0);
    }

    function RGBtoHSV(r, g, b) {
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }

    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
});
