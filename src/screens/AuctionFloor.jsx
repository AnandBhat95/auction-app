import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gavel, Users, SkipForward, Trophy, Minus, Plus, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import Dashboard from './Dashboard';

const AuctionFloor = () => {
    const {
        currentPlayer,
        currentIndex,
        players,
        timer,
        isTimerRunning,
        currentBid,
        currentBidder,
        teams,
        placeBid,
        sellPlayer,
        passPlayer,
        bidIncrement,
        setBidIncrement,
        startTimer,
        stopTimer,
        resetTimer,
        fieldConfig
    } = useAuction();

    const [showDashboard, setShowDashboard] = useState(false);

    // Confetti on Sold
    const handleSold = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
        sellPlayer();
    };

    if (!currentPlayer) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Auction Completed!</h1>
                    <p className="text-slate-400 mb-8">All players have been processed.</p>
                    <button
                        onClick={() => setShowDashboard(true)}
                        className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        View Final Results
                    </button>
                    {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
                </div>
            </div>
        );
    }

    const currentTeamName = teams.find(t => t.id === currentBidder)?.name || "No Bids";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 px-4 py-3 bg-slate-900/50 rounded-xl backdrop-blur-sm border border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Gavel className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Auctioneer Pro
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-slate-400 font-mono">
                        {fieldConfig?.name?.label || 'Item'} {currentIndex + 1} / {players.length}
                    </div>
                    <button
                        onClick={() => setShowDashboard(true)}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                        title="View Dashboard"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-6 mb-6">
                {/* Left: Player Card */}
                <div className="col-span-4 flex flex-col">
                    <motion.div
                        key={currentPlayer.name}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex-1 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
                            <div className="w-48 h-48 bg-slate-800 rounded-full mb-8 flex items-center justify-center border-4 border-slate-700 shadow-inner overflow-hidden">
                                {currentPlayer.image ? (
                                    <img src={currentPlayer.image} alt={currentPlayer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-20 h-20 text-slate-600" />
                                )}
                            </div>

                            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">{currentPlayer.name}</h2>

                            <div className="space-y-3 w-full max-w-xs">
                                {/* Dynamic Details */}
                                {Object.entries(currentPlayer.details || {}).map(([key, value]) => (
                                    <div key={key} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <p className="text-sm text-slate-400 uppercase tracking-wider text-xs mb-1">{key}</p>
                                        <p className="font-semibold text-lg text-blue-400">{value || "N/A"}</p>
                                    </div>
                                ))}

                                {/* Base Price */}
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                    <p className="text-sm text-slate-400 uppercase tracking-wider text-xs mb-1">{fieldConfig?.price?.label || 'Base Price'}</p>
                                    <p className="font-semibold text-lg text-green-400">₹ {currentPlayer.basePrice}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Center: Auction Control */}
                <div className="col-span-8 flex flex-col gap-6">
                    {/* Timer & Bid Display */}
                    <div className="grid grid-cols-2 gap-6 h-48">
                        {/* Timer */}
                        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className={clsx(
                                "text-7xl font-black font-mono tabular-nums transition-colors duration-300",
                                timer <= 5 ? "text-red-500 animate-pulse" : "text-white"
                            )}>
                                {timer}s
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={isTimerRunning ? stopTimer : startTimer} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                    {isTimerRunning ? "Pause" : "Start"}
                                </button>
                                <button onClick={resetTimer} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Current Bid */}
                        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Current Bid</p>
                            <div className="text-6xl font-black text-green-400 tabular-nums">
                                ₹ {currentBid.toLocaleString()}
                            </div>
                            <div className="mt-2 px-4 py-1 bg-slate-800 rounded-full text-blue-400 font-semibold border border-slate-700">
                                {currentTeamName}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col">
                        {/* Increment Adjuster */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                onClick={() => setBidIncrement(prev => Math.max(0, prev - 50))}
                                className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <div className="text-center min-w-[120px]">
                                <p className="text-xs text-slate-400 uppercase mb-1">Bid Increment</p>
                                <div className="flex items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-500 mr-1">₹</span>
                                    <input
                                        type="number"
                                        value={bidIncrement}
                                        onChange={(e) => setBidIncrement(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="text-2xl font-bold bg-transparent text-left w-24 focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setBidIncrement(prev => prev + 50)}
                                className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Team Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6 flex-1 overflow-y-auto">
                            {teams.map((team) => (
                                <button
                                    key={team.id}
                                    onClick={() => placeBid(team.id)}
                                    className={clsx(
                                        "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center relative group",
                                        currentBidder === team.id
                                            ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                            : "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750"
                                    )}
                                >
                                    <span className="font-bold text-lg mb-1 group-hover:scale-105 transition-transform">{team.name}</span>
                                    <span className="text-xs text-slate-400">Spent: ₹{team.spent}</span>
                                    {currentBidder === team.id && (
                                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                                            <Gavel className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button
                                onClick={passPlayer}
                                className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <SkipForward className="w-5 h-5" /> Pass Player
                            </button>
                            <button
                                onClick={handleSold}
                                disabled={!currentBidder}
                                className="py-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Trophy className="w-5 h-5" /> SOLD
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
        </div>
    );
};

export default AuctionFloor;
