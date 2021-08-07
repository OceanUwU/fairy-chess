function mouseCanvasLocation(event, size) {
    let r = event.target.getBoundingClientRect();

    if (event.touches) {
        if (event.touches.length > 0)
            event = event.touches[0];
        else
            event = event.changedTouches[0];
        event.layerX = event.clientX - r.left;
        event.layerY = event.clientY - r.top;
    }

    let canvasBoxRatio = r.width / r.height; //gives width:height ratio of THE CANVAS' CONTAINER in format x:1
    let canvasRatio = size[0] / size[1]; //gives width:height ratio of THE ACTUAL EDITABLE AREA OF THE CANVAS in format x:1
    let full = canvasRatio > canvasBoxRatio ? 'x' : 'y'; //which axises of the container and the editable area have the same dimensions
    let fullDimension = full == 'x' ? 'width' : 'height';
    let partiallyFull = full == 'x' ? 'y' : 'x';
    let dimension = partiallyFull == 'x' ? 'width' : 'height'; //convert axis name to dimension name
    let padding = (r[dimension] - ((partiallyFull == 'x' ? canvasRatio / canvasBoxRatio : canvasBoxRatio / canvasRatio) * r[dimension])) / 2; //the distance between (the sides of the canvas which don't touch the canvas' container) and (the edge of the canvas' container)
    let location = {
        x: event.layerX,
        y: event.layerY,
    };
    location[partiallyFull] -= padding;
    location[fullDimension] = r[fullDimension];
    location[dimension] = r[dimension] - (padding * 2);
    if (location[partiallyFull] < 0 || location[partiallyFull] > location[dimension])
        return null;
    else {
        [['x', 'width'], ['y', 'height']].forEach(i => location[i[0]] = Math.max(0, Math.min(location[i[0]], location[i[1]]-1)));
        return location;
    }
}

function canvasPos(mouseLocation, size, squareSize) {
    return [
        mouseLocation.x / mouseLocation.width * squareSize * size[0] - squareSize / 2,
        mouseLocation.y / mouseLocation.height * squareSize * size[1] - squareSize / 2,
    ];
}

function mouseGridLocation(event, size, black=false) {
    let mouseLocation = mouseCanvasLocation(event, size);
    if (mouseLocation == null)
        return null;
    else {
        let location = {
            x: Math.floor(mouseLocation.x / mouseLocation.width * size[0]),
            y: Math.floor(mouseLocation.y / mouseLocation.height * size[1]),
        };
        if (black) {
            location.x = size[0]-location.x-1;
            location.y = size[1]-location.y-1;
        }
        return location;
    }
}

export {
    mouseCanvasLocation,
    canvasPos,
    mouseGridLocation
};