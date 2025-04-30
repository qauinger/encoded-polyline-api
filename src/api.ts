require('ejs');

import express from 'express';
import dotenv from 'dotenv';
import encodeRouter from './routes/encode';
import decodeRouter from './routes/decode';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || '';

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(API_BASE, encodeRouter);
app.use(API_BASE, decodeRouter);

app.get(API_BASE, (req, res) => {
    res.render('index', {
        endpoints: [
            {
                method: 'POST',
                path: '/encode',
                description: 'Encodes a list of coordinates into a polyline.',
                body: 'Must be one of the following example formats:',
                body_ex: [
                    '[\n  [38.5, -120.2],\n  [40.7, -120.95],\n  [43.252, -126.453]\n]',
                    '[\n  {"lat": 38.5, "lon": -120.2},\n  {"lat": 40.7, "lon": -120.95},\n  {"lat": 43.252, "lon": -126.453}\n]',
                    '{\n  "type":"LineString",\n  "coordinates":[\n    [38.5,-120.2],\n    [40.7,-120.95],\n    [43.252,-126.453]\n  ]\n}',
                    '[38.5, -120.2, 40.7, -120.95, 43.252, -126.453]'
                ],
                out_ex: '_p~iF~ps|U_ulLnnqC_mqNvxq`@'
            },
            {
                method: 'POST',
                path: '/decode',
                description: 'Decodes a polyline string into coordinates.',
                parameters: ['format (optional): Must be one of the following: "array" (default), "wkt", "geojson", or "tuples"'],
                parameters_ex: "format=wkt",
                body: 'JSON object with a "polyline" field.',
                body_ex: '{\n  \"polyline\": \"_p~iF~ps|U_ulLnnqC_mqNvxq`@\"\n}',
                out_ex: [
                    '[{"lat":38.5,"lon":-120.2},{"lat":40.7,"lon":-120.95},{"lat":43.252,"lon":-126.453}]',
                    '38.5,-120.2 40.7,-120.95 43.252,-126.453',
                    '{"type":"LineString","coordinates":[[38.5,-120.2],[40.7,-120.95],[43.252,-126.453]]}',
                    '[[38.5,-120.2],[40.7,-120.95],[43.252,-126.453]]'
                ]
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${API_BASE}`);
});