import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = ({ onClose }) => {
    const { teams, history, fieldConfig } = useAuction();

    const downloadReport = () => {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Using history for report
        const historyData = history.map(h => {
            const row = {
                [fieldConfig?.name?.label || 'Item']: h.player.name,
                'Sold To': h.soldTo ? teams.find(t => t.id === h.soldTo)?.name : 'Unsold',
                'Sold Price': h.price,
                [fieldConfig?.price?.label || 'Base Price']: h.player.basePrice
            };

            // Add dynamic details
            if (h.player.details) {
                Object.entries(h.player.details).forEach(([key, value]) => {
                    row[key] = value;
                });
            }

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, ws, "Auction Results");
        XLSX.writeFile(wb, "auction_results.xlsx");
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-3xl border border-slate-800 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Auction Dashboard</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={downloadReport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export Excel
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <div key={team.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                                    <h3 className="font-bold text-lg text-blue-400">{team.name}</h3>
                                    <span className="text-green-400 font-mono font-bold">₹{team.spent}</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Roster ({team.roster.length})</p>
                                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                                        {team.roster.length === 0 ? (
                                            <p className="text-slate-600 text-sm italic">No players yet</p>
                                        ) : (
                                            team.roster.map((player, idx) => (
                                                <div key={idx} className="flex justify-between text-sm bg-slate-900/50 p-2 rounded">
                                                    <span>{player.name}</span>
                                                    {/* We don't have individual price here easily without modifying context, 
                              but for now just showing names is fine as per request */}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
