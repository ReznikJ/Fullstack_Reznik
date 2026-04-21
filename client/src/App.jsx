import { useEffect, useState, useCallback } from 'react';
import './App.css';

const ZNACKY = ['Všechny', 'BMW', 'Audi', 'Mercedes-Benz', 'Porsche', 'Lamborghini', 'Ferrari'];
const PALIVA = ['Všechna', 'Benzín', 'Nafta', 'Hybrid', 'Elektro'];
const PREVODOVKY = ['Všechny', 'Automat', 'Manuál'];
const KAROSERIE = ['Všechny', 'Sedan', 'SUV', 'Coupe', 'Kombi'];

const DEFAULT_FILTERS = {
    znacka: 'Všechny',
    palivo: 'Všechna',
    prevodovka: 'Všechny',
    karoserie: 'Všechny',
    cenaMin: '',
    cenaMax: '',
    kwMin: '',
    kwMax: '',
    najetoMax: '',
};

function App() {
    const [auta, setAuta] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    const [form, setForm] = useState({
        znacka: '', model: '', cena: '', kw: '', foto: '', najeto: '',
        palivo: 'Benzín', prevodovka: 'Automat', barva: '', vaha: '', spotreba: '', karoserie: 'Sedan'
    });

    const nactiAuta = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/auta');
            const data = await res.json();
            setAuta(data);
        } catch (err) { console.error("Chyba načítání:", err); }
    };

    useEffect(() => { nactiAuta(); }, []);

    // Počítání aktivních filtrů
    useEffect(() => {
        let count = 0;
        if (filters.znacka !== 'Všechny') count++;
        if (filters.palivo !== 'Všechna') count++;
        if (filters.prevodovka !== 'Všechny') count++;
        if (filters.karoserie !== 'Všechny') count++;
        if (filters.cenaMin) count++;
        if (filters.cenaMax) count++;
        if (filters.kwMin) count++;
        if (filters.kwMax) count++;
        if (filters.najetoMax) count++;
        setActiveFilterCount(count);
    }, [filters]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') { setIsLoggedIn(true); setPassword(''); }
        else { alert("Špatné heslo!"); }
    };

    const odeslatNovy = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/auta', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        setForm({ znacka: '', model: '', cena: '', kw: '', foto: '', najeto: '', palivo: 'Benzín', prevodovka: 'Automat', barva: '', vaha: '', spotreba: '', karoserie: 'Sedan' });
        nactiAuta();
    };

    const aktualizovatAuto = async (id, data) => {
        try {
            const res = await fetch(`http://localhost:5000/api/auta/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const upravene = await res.json();
                setAuta(prevAuta => prevAuta.map(a => a.id === id ? upravene : a));
                setEditId(null);
            }
        } catch (err) {
            console.error("Chyba:", err);
        }
    };

    const smazat = async (id) => {
        if (confirm("Opravdu smazat tento skvost?")) {
            await fetch(`http://localhost:5000/api/auta/${id}`, { method: 'DELETE' });
            nactiAuta();
        }
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const filtrovanaAuta = auta.filter(a => {

        if (search && !(a.znacka + " " + a.model).toLowerCase().includes(search.toLowerCase())) return false;

        if (filters.znacka !== 'Všechny' && a.znacka !== filters.znacka) return false;
        if (filters.palivo !== 'Všechna' && a.palivo !== filters.palivo) return false;
        if (filters.prevodovka !== 'Všechny' && a.prevodovka !== filters.prevodovka) return false;
        if (filters.karoserie !== 'Všechny' && a.karoserie !== filters.karoserie) return false;

        const cena = Number(a.cena);
        const kw = Number(a.kw);
        const najeto = Number(a.najeto);

        if (filters.cenaMin && cena < Number(filters.cenaMin)) return false;
        if (filters.cenaMax && cena > Number(filters.cenaMax)) return false;
        if (filters.kwMin && kw < Number(filters.kwMin)) return false;
        if (filters.kwMax && kw > Number(filters.kwMax)) return false;
        if (filters.najetoMax && najeto > Number(filters.najetoMax)) return false;

        return true;
    });

    return (
        <div className="container">
            <header className="main-header">
                <h1 className="logo">PREMIUM<span>BAZAR</span></h1>

                {!isLoggedIn ? (
                    <form onSubmit={handleLogin} className="login-box">
                        <input type="password" placeholder="Admin heslo" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="submit">LOGIN</button>
                    </form>
                ) : (
                    <div className="admin-info">
                        <span>ADMIN REŽIM</span>
                        <button onClick={() => setIsLoggedIn(false)} className="logout-btn">ODHLÁSIT</button>
                    </div>
                )}
            </header>


            <div className="search-section">
                <input
                    className="main-search"
                    placeholder="Hledat vůz snů..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className={`filter-toggle-btn ${filtersOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                    onClick={() => setFiltersOpen(prev => !prev)}
                    aria-label="Otevřít filtry"
                >
                    <span className="filter-icon">⚙</span>
                    <span>Filtry</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-badge">{activeFilterCount}</span>
                    )}
                </button>
            </div>


            <div className={`filter-panel ${filtersOpen ? 'open' : ''}`}>
                <div className="filter-panel-header">
                    <h2>🔍 Filtrovat vozidla</h2>
                    {activeFilterCount > 0 && (
                        <button className="reset-filters-btn" onClick={resetFilters}>
                            ✕ Zrušit filtry ({activeFilterCount})
                        </button>
                    )}
                </div>

                <div className="filter-form">

                    <div className="filter-group">
                        <label className="filter-label">Značka</label>
                        <select
                            value={filters.znacka}
                            onChange={e => setFilters({ ...filters, znacka: e.target.value })}
                            className="filter-select"
                        >
                            {ZNACKY.map(z => <option key={z}>{z}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Palivo</label>
                        <select
                            value={filters.palivo}
                            onChange={e => setFilters({ ...filters, palivo: e.target.value })}
                            className="filter-select"
                        >
                            {PALIVA.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Převodovka</label>
                        <select
                            value={filters.prevodovka}
                            onChange={e => setFilters({ ...filters, prevodovka: e.target.value })}
                            className="filter-select"
                        >
                            {PREVODOVKY.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Karoserie</label>
                        <select
                            value={filters.karoserie}
                            onChange={e => setFilters({ ...filters, karoserie: e.target.value })}
                            className="filter-select"
                        >
                            {KAROSERIE.map(k => <option key={k}>{k}</option>)}
                        </select>
                    </div>


                    <div className="filter-group filter-group-wide">
                        <label className="filter-label">Cena (Kč)</label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                placeholder="Od (Kč)"
                                value={filters.cenaMin}
                                onChange={e => setFilters({ ...filters, cenaMin: e.target.value })}
                                className="filter-input"
                                min="0"
                            />
                            <span className="range-separator">—</span>
                            <input
                                type="number"
                                placeholder="Do (Kč)"
                                value={filters.cenaMax}
                                onChange={e => setFilters({ ...filters, cenaMax: e.target.value })}
                                className="filter-input"
                                min="0"
                            />
                        </div>
                    </div>


                    <div className="filter-group filter-group-wide">
                        <label className="filter-label">Výkon (kW)</label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                placeholder="Od (kW)"
                                value={filters.kwMin}
                                onChange={e => setFilters({ ...filters, kwMin: e.target.value })}
                                className="filter-input"
                                min="0"
                            />
                            <span className="range-separator">—</span>
                            <input
                                type="number"
                                placeholder="Do (kW)"
                                value={filters.kwMax}
                                onChange={e => setFilters({ ...filters, kwMax: e.target.value })}
                                className="filter-input"
                                min="0"
                            />
                        </div>
                    </div>


                    <div className="filter-group filter-group-wide">
                        <label className="filter-label">Max. nájezd (km)</label>
                        <input
                            type="number"
                            placeholder="Maximálně km"
                            value={filters.najetoMax}
                            onChange={e => setFilters({ ...filters, najetoMax: e.target.value })}
                            className="filter-input"
                            min="0"
                        />
                    </div>
                </div>


                <div className="filter-results-info">
                    Zobrazeno <strong>{filtrovanaAuta.length}</strong> z <strong>{auta.length}</strong> vozidel
                </div>
            </div>

            {isLoggedIn && (
                <section className="admin-panel">
                    <h2>➕ Nové vozidlo</h2>
                    <form onSubmit={odeslatNovy} className="admin-form">
                        <input placeholder="Značka" value={form.znacka} onChange={e => setForm({ ...form, znacka: e.target.value })} required />
                        <input placeholder="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
                        <input placeholder="Cena (Kč)" type="number" value={form.cena} onChange={e => setForm({ ...form, cena: e.target.value })} required />
                        <input placeholder="Najeto (km)" value={form.najeto} onChange={e => setForm({ ...form, najeto: e.target.value })} />
                        <input placeholder="Výkon (kW)" value={form.kw} onChange={e => setForm({ ...form, kw: e.target.value })} />
                        <input placeholder="Váha (kg)" value={form.vaha} onChange={e => setForm({ ...form, vaha: e.target.value })} />
                        <input placeholder="Spotřeba" value={form.spotreba} onChange={e => setForm({ ...form, spotreba: e.target.value })} />
                        <input placeholder="Barva" value={form.barva} onChange={e => setForm({ ...form, barva: e.target.value })} />
                        <select value={form.palivo} onChange={e => setForm({ ...form, palivo: e.target.value })}>
                            <option>Benzín</option><option>Nafta</option><option>Hybrid</option><option>Elektro</option>
                        </select>
                        <select value={form.prevodovka} onChange={e => setForm({ ...form, prevodovka: e.target.value })}>
                            <option>Automat</option><option>Manuál</option>
                        </select>
                        <select value={form.karoserie} onChange={e => setForm({ ...form, karoserie: e.target.value })}>
                            <option>Sedan</option><option>SUV</option><option>Coupe</option><option>Kombi</option>
                        </select>
                        <input placeholder="URL URL Fotky" className="full-width" value={form.foto} onChange={e => setForm({ ...form, foto: e.target.value })} />
                        <button className="submit-btn">ULOŽIT DO DATABÁZE</button>
                    </form>
                </section>
            )}

            <main className="car-grid">
                {filtrovanaAuta.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>Žádná vozidla nenalezena</h3>
                        <p>Zkuste upravit filtry nebo vyhledávání</p>
                        {activeFilterCount > 0 && (
                            <button className="reset-filters-btn-alt" onClick={resetFilters}>
                                Zrušit všechny filtry
                            </button>
                        )}
                    </div>
                ) : (
                    filtrovanaAuta.map(auto => (
                        <article key={auto.id} className={`car-card ${auto.prodano ? 'sold' : ''}`}>
                            <div className="image-container">
                                {auto.prodano && <div className="sold-overlay">PRODÁNO</div>}
                                <img src={auto.foto || 'https://via.placeholder.com/800x500'} alt="auto" />
                            </div>

                            <div className="car-content">
                                {isLoggedIn && editId === auto.id ? (
                                    <div className="edit-view">
                                        <input value={editForm.znacka} onChange={e => setEditForm({ ...editForm, znacka: e.target.value })} placeholder="Značka" />
                                        <input value={editForm.model} onChange={e => setEditForm({ ...editForm, model: e.target.value })} placeholder="Model" />
                                        <input value={editForm.cena} onChange={e => setEditForm({ ...editForm, cena: e.target.value })} placeholder="Cena" />
                                        <input value={editForm.najeto} onChange={e => setEditForm({ ...editForm, najeto: e.target.value })} placeholder="Najeto (km)" />
                                        <input value={editForm.barva} onChange={e => setEditForm({ ...editForm, barva: e.target.value })} placeholder="Barva" />
                                        <input value={editForm.kw} onChange={e => setEditForm({ ...editForm, kw: e.target.value })} placeholder="Výkon (kW)" />
                                        <input value={editForm.vaha} onChange={e => setEditForm({ ...editForm, vaha: e.target.value })} placeholder="Váha (kg)" />

                                        <div className="edit-actions">
                                            <button
                                                type="button"
                                                className="save-btn"
                                                onClick={() => {
                                                    console.log("Ukládám data:", editForm);
                                                    aktualizovatAuto(auto.id, editForm);
                                                }}
                                            >
                                                ULOŽIT ZMĚNY
                                            </button>
                                            <button type="button" onClick={() => setEditId(null)} className="cancel-btn">ZRUŠIT</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="car-header">
                                            <span className="body-type">{(auto.karoserie || 'Vůz').toUpperCase()}</span>
                                            <h2>{auto.znacka} {auto.model}</h2>
                                        </div>

                                        <div className="specs">
                                            <div className="spec-item">⚙️ {auto.prevodovka}</div>
                                            <div className="spec-item">🛣️ {Number(auto.najeto).toLocaleString()} km</div>
                                            <div className="spec-item">⚡ {auto.kw} kW</div>
                                            <div className="spec-item">⚖️ {auto.vaha || '---'} kg</div>
                                            <div className="spec-item">⛽ {auto.palivo}</div>
                                            <div className="spec-item">🎨 {auto.barva}</div>
                                        </div>

                                        <div className="price-box">
                                            <span className="price">{Number(auto.cena).toLocaleString()} Kč</span>
                                        </div>

                                        <div className="client-actions">
                                            {!auto.prodano ? (
                                                <button className="interest-btn" onClick={() => {
                                                    const email = prompt("Zadejte Váš e-mail pro zaslání nabídky:");
                                                    if (email) alert("Poptávka odeslána! Brzy se Vám ozveme.");
                                                }}>MÁM ZÁJEM</button>
                                            ) : (
                                                <button className="disabled-btn" disabled>PRODÁNO</button>
                                            )}
                                        </div>

                                        {isLoggedIn && (
                                            <div className="admin-controls">
                                                {editId !== auto.id && (
                                                    <>
                                                        <button className="edit-btn" onClick={() => { setEditId(auto.id); setEditForm(auto) }}>Upravit</button>
                                                        <button className="status-btn" onClick={() => aktualizovatAuto(auto.id, { ...auto, prodano: !auto.prodano })}>
                                                            {auto.prodano ? 'Aktivovat' : 'Prodat'}
                                                        </button>
                                                        <button className="delete-btn" onClick={() => smazat(auto.id)}>Smazat</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </main>
        </div>
    );
}

export default App;