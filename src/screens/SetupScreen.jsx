import React, { useState } from 'react';
import { parseExcel } from '../utils/excelParser';
import { useAuction } from '../context/AuctionContext';
import { Upload, Settings, Users, Play } from 'lucide-react';

const SetupScreen = () => {
    const { initializeAuction } = useAuction();
    const [fileData, setFileData] = useState(null);
    const [headers, setHeaders] = useState([]);

    // Dynamic Field Config
    const [fieldConfig, setFieldConfig] = useState({
        name: { label: 'Player Name', key: '' },
        price: { label: 'Base Price', key: '' },
        image: { key: '' },
        details: [] // Array of column names to include
    });

    const [teamCount, setTeamCount] = useState(4);
    const [teams, setTeams] = useState([]);
    const [config, setConfig] = useState({ timerDuration: 20, initialBidIncrement: 100, baseBid: 100 });
    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Teams, 4: Config

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { headers, data } = await parseExcel(file);
                setHeaders(headers);
                setFileData(data);
                setStep(2);
            } catch (err) {
                alert("Error parsing file");
            }
        }
    };

    const toggleDetailField = (column) => {
        setFieldConfig(prev => {
            const exists = prev.details.includes(column);
            return {
                ...prev,
                details: exists
                    ? prev.details.filter(c => c !== column)
                    : [...prev.details, column]
            };
        });
    };

    const handleMapping = () => {
        if (!fieldConfig.name.key) return alert("Please select a column for the Name");
        setStep(3);
        // Initialize teams
        const initialTeams = Array.from({ length: teamCount }, (_, i) => ({
            id: i + 1,
            name: `Team ${i + 1}`,
            roster: [],
            spent: 0
        }));
        setTeams(initialTeams);
    };

    const updateTeamName = (id, name) => {
        setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
    };

    const startAuction = () => {
        // Transform data based on mappings
        const formattedPlayers = fileData.map(row => ({
            name: row[fieldConfig.name.key],
            basePrice: row[fieldConfig.price.key] || config.baseBid,
            image: row[fieldConfig.image.key] || null,
            details: fieldConfig.details.reduce((acc, col) => {
                acc[col] = row[col];
                return acc;
            }, {}),
            originalData: row
        }));

        initializeAuction({
            players: formattedPlayers,
            teams,
            config,
            fieldConfig // Pass the config to context
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Auctioneer Pro
                </h1>

                {step === 1 && (
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <p className="text-lg text-slate-300 max-w-xl mx-auto">
                                The ultimate professional tool for managing live auctions.
                                Perfect for sports leagues, charity events, or asset bidding.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mt-8">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <h3 className="font-bold text-blue-400 mb-2">1. Upload Data</h3>
                                    <p className="text-sm text-slate-400">Import your items or players from any Excel or CSV file.</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <h3 className="font-bold text-green-400 mb-2">2. Customize</h3>
                                    <p className="text-sm text-slate-400">Map your columns, set up teams, and configure auction rules.</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <h3 className="font-bold text-purple-400 mb-2">3. Live Auction</h3>
                                    <p className="text-sm text-slate-400">Run a high-energy bidding war with a live timer and dashboard.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 hover:border-blue-500 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="transform group-hover:scale-105 transition-transform duration-200 text-center">
                                <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                                <p className="text-xl font-bold text-white">Click or Drop your Excel file here</p>
                                <p className="text-slate-400 text-sm mt-2">Supports .xlsx, .csv</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Configure Fields
                        </h2>

                        {/* Primary Identity */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="font-medium text-blue-400 mb-3">1. Main Identity</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Label (e.g. "Player Name")</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm"
                                        value={fieldConfig.name.label}
                                        onChange={(e) => setFieldConfig({ ...fieldConfig, name: { ...fieldConfig.name, label: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Map to Column *</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm"
                                        value={fieldConfig.name.key}
                                        onChange={(e) => setFieldConfig({ ...fieldConfig, name: { ...fieldConfig.name, key: e.target.value } })}
                                    >
                                        <option value="">Select Column</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Price Field */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="font-medium text-green-400 mb-3">2. Pricing</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Label (e.g. "Base Price")</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm"
                                        value={fieldConfig.price.label}
                                        onChange={(e) => setFieldConfig({ ...fieldConfig, price: { ...fieldConfig.price, label: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Map to Column</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm"
                                        value={fieldConfig.price.key}
                                        onChange={(e) => setFieldConfig({ ...fieldConfig, price: { ...fieldConfig.price, key: e.target.value } })}
                                    >
                                        <option value="">Select Column</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Field */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="font-medium text-yellow-400 mb-3">3. Image Source (Optional)</h3>
                            <div className="grid grid-cols-1">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Map to Column (contains Image URLs)</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm"
                                        value={fieldConfig.image.key}
                                        onChange={(e) => setFieldConfig({ ...fieldConfig, image: { ...fieldConfig.image, key: e.target.value } })}
                                    >
                                        <option value="">None (Use Default Icon)</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="font-medium text-purple-400 mb-3">4. Additional Details to Display</h3>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {headers.filter(h => h !== fieldConfig.name.key && h !== fieldConfig.price.key && h !== fieldConfig.image.key).map(h => (
                                    <label key={h} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-800 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={fieldConfig.details.includes(h)}
                                            onChange={() => toggleDetailField(h)}
                                            className="rounded border-slate-600 bg-slate-800 text-blue-500"
                                        />
                                        <span className="truncate">{h}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleMapping}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Next: Setup Teams
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5" /> Setup Teams
                        </h2>
                        <div className="flex items-center gap-4 mb-4">
                            <label>Number of Teams:</label>
                            <input
                                type="number"
                                min="2"
                                max="9"
                                value={teamCount}
                                onChange={(e) => {
                                    const count = Math.min(9, Math.max(2, parseInt(e.target.value) || 2));
                                    setTeamCount(count);
                                    setTeams(Array.from({ length: count }, (_, i) => ({
                                        id: i + 1,
                                        name: teams[i]?.name || `Team ${i + 1}`,
                                        roster: [],
                                        spent: 0
                                    })));
                                }}
                                className="bg-slate-900 border border-slate-700 rounded p-2 w-20 text-center"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                            {teams.map((team) => (
                                <input
                                    key={team.id}
                                    value={team.name}
                                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded p-2"
                                    placeholder={`Team ${team.id} Name`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(4)}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Next: Auction Rules
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Auction Rules
                        </h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Timer Duration (seconds)</label>
                                <input
                                    type="number"
                                    value={config.timerDuration}
                                    onChange={(e) => setConfig({ ...config, timerDuration: parseInt(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Starting Bid Increment</label>
                                <input
                                    type="number"
                                    value={config.initialBidIncrement}
                                    onChange={(e) => setConfig({ ...config, initialBidIncrement: parseInt(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                                />
                            </div>
                        </div>
                        <button
                            onClick={startAuction}
                            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5" /> Start Auction
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetupScreen;
