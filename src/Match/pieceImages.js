import * as pieces from './pieces';

async function recolor(piece, color) {
    return new Promise(res => {
        let img = new Image();
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (
                    imageData.data[i] == 255
                    && imageData.data[i+1] == 0
                    && imageData.data[i+2] == 0
                ) {
                    imageData.data[i] = color[0];
                    imageData.data[i+1] = color[1];
                    imageData.data[i+2] = color[2];
                }
            }

            ctx.putImageData(imageData, 0, 0);
            res(canvas.toDataURL());
        };
        img.src = `/pieces/${piece}.png`;
    });
};

async function recolorAll(a, b) {
    let pieceImagesArray = await Promise.all([].concat(...Object.keys(pieces).map(piece => [piece, recolor(piece, a), recolor(piece, b)])));
    let pieceImages = {};
    while (pieceImagesArray.length > 0) {
        let piece = pieceImagesArray[0];
        pieceImages[piece] = [];
        for (let i = 0; i < 2; i++) {
            let promise = new Promise(res => {
                let img = new Image();
                img.onload = () => {
                    res(img);
                    pieceImages[piece][i] = img;
                };
                img.src = pieceImagesArray[i+1];
            });
            pieceImages[piece].push(promise);
        }
        pieceImagesArray.splice(0, 3);
    }
    await Promise.all([].concat(...Object.values(pieceImages)));
    return pieceImages;
}

export default recolorAll;