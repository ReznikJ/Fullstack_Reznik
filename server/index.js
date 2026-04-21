const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'auta.json');

const nactiData = () => {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};
const ulozData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

app.get('/api/auta', (req, res) => {
    res.json(nactiData());
});

app.post('/api/auta', (req, res) => {
    const auta = nactiData();
    const noveAuto = {
        id: Date.now(),
        prodano: false,
        ...req.body
    };
    auta.push(noveAuto);
    ulozData(auta);
    res.json(noveAuto);
});

app.delete('/api/auta/:id', (req, res) => {
    const auta = nactiData().filter(a => a.id !== parseInt(req.params.id));
    ulozData(auta);
    res.json({ message: "Smazáno" });
});


app.put('/api/auta/:id', (req, res) => {
    let auta = nactiData();
    const index = auta.findIndex(a => a.id === parseInt(req.params.id));
    if (index !== -1) {
        auta[index] = { ...auta[index], ...req.body, id: auta[index].id };
        ulozData(auta);
        res.json(auta[index]);
    } else {
        res.status(404).send("Auto nenalezeno");
    }
});

app.listen(5000, () => console.log("Backend běží na portu 5000"));