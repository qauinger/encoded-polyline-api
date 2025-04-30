import { Router } from 'express';

const router = Router();

router.post('/decode', (req, res) => {
    const encoded = typeof req.body.polyline === 'string' ? req.body.polyline : '';
    const format = typeof req.query.format === 'string' ? req.query.format : 'array';
    if(!['array', 'wkt', 'geojson', 'tuples'].includes(format)) {
        res.send('Unknown format');
        return;
    }

    let coordinates: {lat: number, lon: number}[] = [];

    let index = 0;
    let lat = 0;
    let lon = 0;

    while (index < encoded.length) {
        lat += decodeValue(encoded, index);
        index = decodeValue.lastIndex;
        lon += decodeValue(encoded, index);
        index = decodeValue.lastIndex;
        coordinates.push({lat: lat / 1e5, lon: lon / 1e5});
    }

    if(format == 'array') {
        res.json(coordinates);
    } else if(format == 'wkt') {
        res.send(coordinates.map((v) => v.lat + ',' + v.lon).join(' '));
    } else if(format == 'geojson') {
        res.send({
            "type": "LineString",
            "coordinates": coordinates.map((v) => [v.lat, v.lon])
        });
    } else if(format == 'tuples') {
        res.send(coordinates.map((v) => [v.lat, v.lon]));
    }
});

export default router;

function decodeValue(str: string, start: number): number {
    let result = 0;
    let shift = 0;
    let byte = 0;
    let index = start;

    while (true) {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (byte < 0x20) break;
    }

    decodeValue.lastIndex = index;

    const shouldNegate = result & 1;
    result >>= 1;
    if (shouldNegate) result = ~result;

    return result;
}

decodeValue.lastIndex = 0;

