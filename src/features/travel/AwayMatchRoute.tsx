import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export function AwayMatchRoute() {
    // Fallback map embed for Celtic Park
    // Fallback for no API key:
    const fallbackMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2239.544159516709!2d-4.2055!3d55.8497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4888414421d0a521%3A0xe54c165034c442c5!2sCeltic%20Park!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk";

    return (
        <div className="flex flex-col h-full pb-20">
            <h1 className="text-3xl font-bold text-falkirk-navy mb-6">Away Day Travel</h1>

            {/* Map Container */}
            <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden shadow-md relative min-h-[300px]">
                <iframe
                    src={fallbackMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                />

                {/* Overlay Info */}
                <motion.div
                    className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-celtic-green text-white p-3 rounded-full">
                            🚌
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Team Bus (X37)</h3>
                            <p className="text-sm text-gray-600">Departs: <span className="font-bold text-black">10:45 AM</span> • Main Street</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scouting Report */}
            <section className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Scouting Report: Glasgow</h2>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 flex-shrink-0">
                            <Lightbulb size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-falkirk-navy mb-1">Did you know?</h3>
                            <p className="text-gray-600 text-sm">
                                Celtic Park is colloquially known as "Paradise" by Celtic fans. It is the largest football stadium in Scotland!
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
