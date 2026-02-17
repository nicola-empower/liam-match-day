import { motion } from 'framer-motion';
import { Shirt, Calendar, MapPin } from 'lucide-react'; // Removed QrCode
import QRCode from 'react-qr-code';

export function MyClubView() {
    return (
        <div className="pb-20 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-falkirk-navy">My Club</h1>
                <p className="text-gray-500">Season Ticket & Schedules</p>
            </header>

            {/* Digital Season Ticket Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden max-w-md mx-auto relative"
            >
                {/* Header Bar */}
                <div className="bg-falkirk-navy text-white p-4 text-center py-6">
                    <h2 className="text-xl font-bold">Member Card</h2>
                </div>

                <div className="p-8 flex flex-col gap-6">
                    {/* Club Header inside card */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Falkirk Football Club</h3>
                        <p className="text-sm text-gray-400 font-medium">Package</p>
                        <p className="text-gray-800 font-semibold">Adult Main Stand Seating</p>
                    </div>

                    {/* Member Details Row */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Name</p>
                            <p className="text-lg font-bold text-falkirk-navy">Liam BERRY</p>

                            <p className="text-sm text-gray-400 font-medium mt-2">Membership No.</p>
                            <p className="text-gray-800 font-mono">FFC91813508</p>
                        </div>
                        {/* Club Logo Placeholder */}
                        <div className="bg-falkirk-navy/10 p-2 rounded-lg">
                            <div className="w-16 h-10 bg-falkirk-navy rounded flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight">
                                YOUR<br />CLUB
                            </div>
                        </div>
                    </div>

                    {/* QR Code Area */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-white p-2">
                            <QRCode
                                value="MCLEZYW652E525F"
                                size={150}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <p className="text-sm text-gray-400 font-medium mt-2">Card Number</p>
                        <p className="font-mono text-gray-600 tracking-wider">MCLEZYW652E525F</p>
                    </div>

                    {/* Footer Details */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm border-t border-gray-100 pt-4">
                        <div className="text-gray-400">Stand</div>
                        <div className="text-right font-bold text-gray-900">Main Stand</div>

                        <div className="text-gray-400">Facility</div>
                        <div className="text-right font-bold text-gray-900">D Main Stand</div>

                        <div className="text-gray-400">Seat</div>
                        <div className="text-right font-bold text-gray-900 text-lg">G95</div>
                    </div>
                </div>
            </motion.div>

            {/* Training Schedule */}
            <section>
                <h2 className="text-xl font-bold text-falkirk-navy mb-4">Training Schedule</h2>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-celtic-green/10 w-12 h-12 rounded-full flex items-center justify-center text-celtic-green">
                        <Shirt size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Monday Night Football</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Mondays, 18:00</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>Training Pitch 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
