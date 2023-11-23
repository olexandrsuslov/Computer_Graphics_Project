document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const originalImage = document.getElementById('originalImage');
    const copiedImageCanvas = document.getElementById('copiedImage');
    const copiedImageContext = copiedImageCanvas.getContext('2d');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const blueSaturationSlider = document.getElementById('blueSaturationSlider');
    const blueSaturationValue = document.getElementById('blueSaturationValue');
    const startXInput = document.getElementById('startX');
    const startYInput = document.getElementById('startY');
    const endXInput = document.getElementById('endX');
    const endYInput = document.getElementById('endY');
    const colorModeSelector = document.getElementById('colorModeSelector');
    const saveToFileBtn = document.getElementById('saveToFileBtn');

    let originalImageData;
    let brightnessChange = 0;
    let blueSaturationChange = 0;
    let selectedRegion = null;
    let applyChangesFunction = applyHSVChanges; // Default to HSV mode

    imageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            //const originalImage = new Image();
            originalImage.src = e.target.result;

            originalImage.onload = function () {
                copiedImageCanvas.width = originalImage.width;
                copiedImageCanvas.height = originalImage.height;

                copiedImageContext.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
                originalImageData = copiedImageContext.getImageData(0, 0, copiedImageCanvas.width, copiedImageCanvas.height);

                applyChanges();
            };
        };

        reader.readAsDataURL(file);
    });

    copiedImageCanvas.addEventListener('mousemove', function (event) {
        const x = event.offsetX;
        const y = event.offsetY;

        const pixelData = copiedImageContext.getImageData(x, y, 1, 1).data;

        // Вивід значень RGB у блок pixelInfo
        document.getElementById('rgbValues').textContent = `${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;
    });

    saveToFileBtn.addEventListener('click', saveCanvasToFile);

    function saveCanvasToFile() {
        const canvas = document.getElementById('copiedImage');
        const dataURL = canvas.toDataURL(); // Отримати URL-адресу у форматі base64

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'ColorSchemeImage.png'; // Ім'я файлу для завантаження
        link.click();
    }

    brightnessSlider.addEventListener('input', function () {
        brightnessValue.textContent = this.value;
        brightnessChange = parseInt(this.value);
        applyChanges();
    });

    blueSaturationSlider.addEventListener('input', function () {
        blueSaturationValue.textContent = this.value;
        blueSaturationChange = parseInt(this.value);
        applyChanges();
    });

    startXInput.addEventListener('input', function () {
        applyChanges();
    });

    startYInput.addEventListener('input', function () {
        applyChanges();
    });

    endXInput.addEventListener('input', function () {
        applyChanges();
    });

    endYInput.addEventListener('input', function () {
        applyChanges();
    });

    colorModeSelector.addEventListener('change', function () {
        const selectedMode = colorModeSelector.value;
        resetImageChanges();

        switch (selectedMode) {
            case 'hsv':
                applyChangesFunction = applyHSVChanges;
                break;
            case 'cmyk':
                applyChangesFunction = applyCMYKChanges;
                break;
            default:
                applyChangesFunction = applyHSVChanges;
                break;
        }

        applyChanges();
    });
    
    function applyChanges() {
        const imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
        const data = imageData.data;

        const startX = parseInt(startXInput.value) || 0;
        const startY = parseInt(startYInput.value) || 0;
        const endX = Math.min(parseInt(endXInput.value) || copiedImageCanvas.width, copiedImageCanvas.width);
        const endY = Math.min(parseInt(endYInput.value) || copiedImageCanvas.height, copiedImageCanvas.height);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const i = (y * copiedImageCanvas.width + x) * 4;

                if (!selectedRegion || (x >= selectedRegion.startX && x <= selectedRegion.endX && y >= selectedRegion.startY && y <= selectedRegion.endY)) {
                    applyChangesFunction(data, i);
                }
            }
        }

        copiedImageContext.putImageData(imageData, 0, 0);
    }

    function applyHSVChanges(data, i) {
        const hsv = RGBtoHSV(data[i], data[i + 1], data[i + 2]);

        hsv.v += brightnessChange / 100;

        if (hsv.h >= 0.5 && hsv.h <= 0.6667) {
            hsv.s += blueSaturationChange / 100;
        }

        const rgb = HSVtoRGB(hsv.h, hsv.s, hsv.v);

        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
    }

    function applyCMYKChanges(data, i) {
        const rgb = { r: data[i], g: data[i + 1], b: data[i + 2] };
        let cmyk = RGBtoCMYK(rgb.r / 255, rgb.g / 255, rgb.b / 255);
    
        // Apply changes to CMYK values here
        cmyk.k -= brightnessChange / 100; // Зміна яскравості
        
       // console.log("M "+cmyk.m);

        if (cmyk.c > 0.15 && cmyk.m > 0.05) {
            // Застосування змін до насиченості синього (можна змінювати умову за потребою)
            (cmyk.c + blueSaturationChange / 100) > 1 ? cmyk.c =1 : cmyk.c += blueSaturationChange / 100;
            (cmyk.m + blueSaturationChange / 100) > 1 ? cmyk.m =1 : cmyk.m += blueSaturationChange / 100;
       }

        const newRGB = CMYKtoRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
    
        data[i] = newRGB.r;
        data[i + 1] = newRGB.g;
        data[i + 2] = newRGB.b;
    }

    function resetImageChanges() {
        brightnessSlider.value = 0;
        blueSaturationSlider.value = 100;
        brightnessChange = 0;
        blueSaturationChange = 0;
        selectedRegion = null;

        originalImage.src = '';
        imageInput.value = '';
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

    function RGBtoCMYK(r, g, b) {
        const k = Math.min(1 - r, 1 - g, 1 - b);
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
    
        return { c, m, y, k };
    }
    
    function CMYKtoRGB(c, m, y, k) {
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);
    
        return { r, g, b };
    }
});
