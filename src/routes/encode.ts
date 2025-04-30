import { Router } from 'express';

const router = Router();

router.post('/encode', (req, res) => {
    try {
        const coords = normalizeInput(req.body);

        let output = '';
        let previousLat = 0;
        let previousLon = 0;

        for(const [lat, lon] of coords) {
            output += encodeValue(lat, previousLat);
            output += encodeValue(lon, previousLon);
            previousLat = lat;
            previousLon = lon;
        }

        res.send(output);
    } catch (err: any) {
        res.status(400).send({ error: err.message });
    }
});

export default router;

function encodeValue(value: number, previousValue: number) {
    let integerValue = Math.round(value * 1e5);
    let delta = integerValue - Math.round(previousValue * 1e5);

    let binary = delta << 1;
    if (delta < 0)
        binary = ~binary;

    const chunks: number[] = [];
    while (binary >= 0x20) {
        chunks.push((binary & 0x1f) | 0x20);
        binary >>= 5;
    }
    chunks.push(binary);

    return chunks.map(c => String.fromCharCode(c + 63)).join('');
}

type Coord = [number, number];

function normalizeInput(input: any): Coord[] {
    // [[num, num], [num, num], ...]
    if (Array.isArray(input) && input.every(p => Array.isArray(p) && p.length === 2)) {
        return input as Coord[];
    }

    // [{lat: num, lon: num}, ...]
    if (Array.isArray(input) && input.every(p => typeof p.lat === 'number' && typeof p.lon === 'number')) {
        return input.map(p => [p.lat, p.lon]);
    }

    // [num, num, num, num, ...]
    if (Array.isArray(input) && input.every(p => typeof p === 'number') && input.length % 2 === 0) {
        const coords: Coord[] = [];
        for (let i = 0; i < input.length; i += 2)
            coords.push([input[i], input[i + 1]]);
        return coords;
    }

    // {"type": "LineString", "coordinates": [[num, num], ...]}
    if (
        typeof input === 'object' &&
        input.type === 'LineString' &&
        Array.isArray(input.coordinates) &&
        input.coordinates.every((p: [number, number][]) => Array.isArray(p) && p.length === 2)
    ) {
        return input.coordinates;
    }

    throw new Error('Invalid body format');
}
