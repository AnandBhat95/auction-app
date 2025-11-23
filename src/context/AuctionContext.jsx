import React, { createContext, useContext, useState, useEffect } from 'react';

const AuctionContext = createContext();

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
    // Setup State
    const [isSetup, setIsSetup] = useState(false);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]); // { id, name, roster: [], spent: 0 }
    const [config, setConfig] = useState({
        timerDuration: 20,
        initialBidIncrement: 100,
        baseBid: 100,
    });
    const [fieldConfig, setFieldConfig] = useState(null);

    // Auction State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidder, setCurrentBidder] = useState(null); // teamId
    const [bidIncrement, setBidIncrement] = useState(100);
    const [timer, setTimer] = useState(20);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [history, setHistory] = useState([]); // { player, soldTo, price }

    // Actions
    const initializeAuction = (data) => {
        setPlayers(data.players);
        setTeams(data.teams);
        setConfig(data.config);
        setFieldConfig(data.fieldConfig);
        setBidIncrement(data.config.initialBidIncrement);
        setTimer(data.config.timerDuration);
        setIsSetup(true);
    };

    const startTimer = () => {
        setIsTimerRunning(true);
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimer(config.timerDuration);
    };

    const placeBid = (teamId) => {
        // If no bid yet, start at base price or base bid
        let nextBid = currentBid === 0 ? Math.max(config.baseBid, parseInt(players[currentIndex]?.basePrice || 0)) : currentBid + bidIncrement;

        // If team is already winning, maybe just increase price? Or prevent?
        // Usually auctioneer clicks for the team.
        setCurrentBid(nextBid);
        setCurrentBidder(teamId);
        resetTimer();
        startTimer(); // Auto start timer on bid? Or manual? Let's auto start for flow.
    };

    const customBid = (amount, teamId) => {
        setCurrentBid(amount);
        setCurrentBidder(teamId);
        resetTimer();
        startTimer();
    }

    const sellPlayer = () => {
        if (!currentBidder) return;

        const player = players[currentIndex];
        const updatedTeams = teams.map(t => {
            if (t.id === currentBidder) {
                return { ...t, roster: [...t.roster, player], spent: t.spent + currentBid };
            }
            return t;
        });

        setTeams(updatedTeams);
        setHistory([...history, { player, soldTo: currentBidder, price: currentBid }]);
        nextPlayer();
    };

    const passPlayer = () => {
        setHistory([...history, { player: players[currentIndex], soldTo: null, price: 0 }]);
        nextPlayer();
    };

    const nextPlayer = () => {
        setCurrentIndex(prev => prev + 1);
        setCurrentBid(0);
        setCurrentBidder(null);
        resetTimer();
        // setBidIncrement(config.initialBidIncrement); // Reset increment? Or keep last used? User might want to keep it.
    };

    useEffect(() => {
        let interval;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    return (
        <AuctionContext.Provider value={{
            isSetup,
            players,
            teams,
            config,
            fieldConfig,
            currentIndex,
            currentPlayer: players[currentIndex],
            currentBid,
            currentBidder,
            bidIncrement,
            timer,
            isTimerRunning,
            history,
            initializeAuction,
            startTimer,
            stopTimer,
            resetTimer,
            placeBid,
            customBid,
            setBidIncrement,
            sellPlayer,
            passPlayer
        }}>
            {children}
        </AuctionContext.Provider>
    );
};
