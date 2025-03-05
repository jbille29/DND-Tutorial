import { useState, useEffect } from 'react';
import axios from 'axios';

import featureSquares from '../utils/featureSquares';

const GameStateManager = (gridWidth) => {
    const [board, setBoard] = useState([]);
    const [tilesInPool, setTilesInPool] = useState([]);
    const [validWords, setValidWords] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    
    // Fetches game data when component mounts
    // Checks every minute to see if new day has started
    // If date has changed, it clears stored game data and fetches a new puzzle
    useEffect(() => {
        // Fetch game data on mount
        fetchGameData();
    
        // Function to check if a new day has started
        const checkForNewDay = setInterval(() => {
            const now = new Date();
            const formattedCurrentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
            const storedDate = JSON.parse(localStorage.getItem('gameState'))?.date;
    
            console.log("📅 Checking for new day...", formattedCurrentDate, storedDate);
    
            if (formattedCurrentDate !== storedDate) {
                console.log("🔥 Midnight reached! Refreshing game data.");
                localStorage.removeItem('gameState');
                fetchGameData();
            }
        }, 60000); // Runs every 15 seconds
    
        // Cleanup interval on unmount
        return () => clearInterval(checkForNewDay);
    }, []);
    

    const fetchGameData = async () => {
        // Get local date in YYYY-MM-DD format
        const clientDate = new Date();
        const localDateString = `${clientDate.getFullYear()}-${String(clientDate.getMonth() + 1).padStart(2, '0')}-${String(clientDate.getDate()).padStart(2, '0')}`;
    
        console.log("📅 Client is sending request for local date:", localDateString);
    
        // Retrieve game state from localStorage
        const localData = JSON.parse(localStorage.getItem('gameState'));
    
        // If the stored puzzle is from today, use it instead of refetching
        if (localData && localData.date === localDateString) {
            console.log("✅ Using saved local data.");
            setTilesInPool(localData.tilesInPool);
            setBoard(localData.board);
            setValidWords(localData.validWords);
            setGameOver(false);
            return;
        }
    
        try {
            console.log("🔥 Fetching new game data...");
            
            // Fetch puzzle from server with proper local date
            const response = await axios.get(`https://scrabbleapi.onrender.com/scrabble-setup?date=${encodeURIComponent(localDateString)}`);
            const { letterPool, starterWordObj, validWords } = response.data;
    
            console.log("📜 Received puzzle data:", response.data);
    
            // Set state with new puzzle data
            setTilesInPool(letterPool);
            setValidWords(validWords);
    
            // Initialize board with pre-placed tiles
            const initialBoardState = Array(gridWidth * gridWidth).fill(null).map((_, index) => ({
                tile: starterWordObj.find(t => t.position === index) || null,
                feature: featureSquares[index] || null,
                isValid: false
            }));
    
            setBoard(initialBoardState);
    
            // Store puzzle in localStorage for persistence
            localStorage.setItem('gameState', JSON.stringify({
                date: localDateString,  // Store in correct local format
                tilesInPool: letterPool,
                board: initialBoardState,
                validWords
            }));
    
        } catch (error) {
            console.error("❌ Error fetching game data:", error);
        }
    };

    // Save game state to localStorage only when necessary
    useEffect(() => {
        if (board.length > 0 && tilesInPool.length > 0) {
            const clientDate = new Date().toISOString().split("T")[0];
            saveGameState(clientDate, tilesInPool, board, validWords);
        }
    }, [board, tilesInPool, validWords]);

    useEffect(() => {
        console.log("Checking for game over...", gameOver)
    }, [gameOver]);

    const saveGameState = (date, tiles, boardState, words) => {
        localStorage.setItem('gameState', JSON.stringify({
            date,
            tilesInPool: tiles,
            board: boardState,
            validWords: words
        }));
        console.log("💾 Game state saved.");
    };    

    const handleNextGame = () => {
        console.log("Fetching next game...");
        localStorage.removeItem('gameState');
        fetchGameData();
    };

    const handleSkipPuzzle = async () => {
        console.log("Skipping to the next puzzle...");
        localStorage.removeItem('gameState');
        await fetchGameData();
    };

    const clearGameState = () => {
        localStorage.removeItem('gameState');
        setBoard([]);
        setTilesInPool([]);
        setGameOver(false);
    };

    return {
        board, setBoard,
        tilesInPool, setTilesInPool,
        validWords, fetchGameData,
        handleNextGame, clearGameState, handleSkipPuzzle,
        gameOver, setGameOver
    };
};

export default GameStateManager;
