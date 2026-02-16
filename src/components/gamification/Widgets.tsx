import { useGameStore } from "../../store/useGameStore";
import { CloudSun, Trophy, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from "react";

export function FormGuideWidget() {
    const { history } = useGameStore();
    // Padding mock data if empty
    const displayHistory = history.length > 0 ? history : [
        { date: '1', points: 25 }, { date: '2', points: 15 }, { date: '3', points: 30 }, { date: '4', points: 10 }, { date: '5', points: 0 }
    ];

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
                <Trophy size={16} />
                <span>Current Form</span>
            </div>
            <div className="flex gap-1">
                {displayHistory.map((day, i) => {
                    let bg = 'bg-gray-200';
                    let text = 'L';
                    if (day.points >= 20) { bg = 'bg-green-500'; text = 'W'; }
                    else if (day.points >= 10) { bg = 'bg-yellow-400'; text = 'D'; }

                    return (
                        <div key={i} className={`h-8 w-8 rounded-md ${bg} text-white font-black flex items-center justify-center text-xs`}>
                            {text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { getWeather } from "../../services/weatherApi";

export function WeatherWidget() {
    const [weather, setWeather] = useState<{ temp: number, condition: string, description: string } | null>(null);

    useEffect(() => {
        getWeather().then(data => {
            if (data) setWeather(data);
        });
    }, []);

    if (!weather) return null; // Or a loading state

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
                <CloudSun size={16} />
                <span>Pitch Conditions</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-800">{weather.temp}°C</span>
                <span className="text-sm font-medium text-gray-500 mb-1">{weather.condition}</span>
            </div>
            <div className="text-xs text-gray-400 capitalize">{weather.description}</div>
        </div>
    );
}

export function TeamTalkWidget() {
    const quotes = [
        "Head in the game, Liam! Focus on the next pass.",
        "Champions aren't made in the gym, they're made in the kitchen! (Eat your veg)",
        "Keep the clean sheet! (Tidy your room)",
        "Play for the badge on the front of the shirt!",
        "100% effort, 100% of the time."
    ];
    const [quote, setQuote] = useState("");

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-falkirk-navy text-white p-4 rounded-xl shadow-lg relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 opacity-10 p-2 transform rotate-12">
                <MessageCircle size={64} />
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold uppercase text-blue-300 mb-1">Manager's Team Talk</h3>
                <p className="font-bold text-lg italic">"{quote}"</p>
            </div>
        </motion.div>
    );
}
