import { useEffect, useState } from 'react'

function App() {
    const [auta, setAuta] = useState([]);
    // Stavy pro formulář
    const [znacka, setZnacka] = useState('');
    const [model, setModel] = useState('');
    const [cena, setCena] = useState('');

    // 1. Načtení aut (GET)
    const nactiAuta = () => {
        fetch('http://localhost:5000/api/auta')
            .then(res => res.json())
            .then(data => setAuta(data))
            .catch(err => console.error("Chyba při načítání:", err));
    };

    useEffect(() => {
        nactiAuta();
    }, []);

    // 2. Přidání auta (POST)
    const pridejAuto = (e) => {
        e.preventDefault(); // Zamezí znovunačtení stránky

        // Jednoduchá validace (bod ze zadání: "pokročilé věci")
        if (!znacka || !model || !cena) {
            alert("Vyplň všechna pole!");
            return;
        }

        const noveAuto = { znacka, model, cena: Number(cena) };

        fetch('http://localhost:5000/api/auta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noveAuto)
        })
            .then(() => {
                nactiAuta(); // Refresh seznamu
                setZnacka(''); setModel(''); setCena(''); // Vymazání formuláře
            });
    };

    // 3. Smazání auta (DELETE)
    const smazAuto = (id) => {
        fetch(`http://localhost:5000/api/auta/${id}`, { method: 'DELETE' })
            .then(() => nactiAuta());
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>🚗 Evidence Aut</h1>

            {/* Formulář pro přidání */}
            <form onSubmit={pridejAuto} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Přidat nové auto</h3>
                <input placeholder="Značka" value={znacka} onChange={e => setZnacka(e.target.value)} />
                <input placeholder="Model" value={model} onChange={e => setModel(e.target.value)} />
                <input placeholder="Cena" type="number" value={cena} onChange={e => setCena(e.target.value)} />
                <button type="submit">Uložit auto</button>
            </form>

            {/* Seznam aut */}
            <div>
                {auta.map(auto => (
                    <div key={auto.id} style={{ borderBottom: '1px solid #ddd', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>{auto.znacka} {auto.model}</strong> - {auto.cena} Kč
                        </div>
                        <button onClick={() => smazAuto(auto.id)} style={{ color: 'red' }}>Smazat</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App