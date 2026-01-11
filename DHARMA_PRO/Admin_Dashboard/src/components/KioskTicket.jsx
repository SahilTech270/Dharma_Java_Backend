import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const KioskTicket = ({ booking, onClose, onRegisterNew }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Darshan-Ticket-${booking.bookingId}`,
        removeAfterPrint: true,
    });

    // Calculate total participants (Primary + any others if available)
    // Assuming booking object structure from API response + context
    // Adapt fields based on your actual booking object structure
    const participants = booking.participants || [];

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Action Header - Hidden when printing */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center no-print">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                    <CheckCircle size={20} />
                    <span>Booking Confirmed</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Printer size={16} />
                        Print Ticket
                    </button>
                    <button
                        onClick={onRegisterNew}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        New Booking
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Ticket Preview Section */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100/50">

                {/* ACTUAL TICKET CONTENT */}
                <div
                    ref={componentRef}
                    className="w-full max-w-[400px] bg-white p-6 shadow-xl rounded-none text-slate-900 border-t-8 border-orange-600 print-container"
                    style={{ minHeight: '500px' }}
                >
                    {/* Ticket Header */}
                    <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                        <h1 className="text-2xl font-extrabold text-orange-700 uppercase tracking-wider mb-1">Dharma Darshan</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Official Entry Ticket</p>

                        <div className="mt-4 inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-lg font-mono font-bold">
                            #{booking.bookingId}
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                            <span className="text-sm font-bold text-slate-900">{formatDate(booking.bookingDate || booking.date)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Slot Time</span>
                            {/* Try to show slot time if available, otherwise Slot ID */}
                            <span className="text-sm font-bold text-slate-900">
                                {booking.slotTime || `Slot #${booking.slotId}`}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Temple ID</span>
                            <span className="text-sm font-bold text-slate-900">{booking.templeId}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Visitors</span>
                            <span className="text-sm font-bold text-slate-900">{booking.numberOfParticipants || 1}</span>
                        </div>
                    </div>

                    {/* Participants List */}
                    {participants.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2 mb-2">Devotees</h3>
                            <ul className="space-y-2">
                                {participants.map((p, idx) => (
                                    <li key={idx} className="text-sm font-medium flex justify-between items-center">
                                        <span>{idx + 1}. {p.name} <span className="text-slate-400 text-xs">({p.age}/{p.gender ? p.gender[0] : ''})</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* QR Code */}
                    <div className="border-2 border-slate-900 rounded-xl p-2 w-32 h-32 mx-auto mb-4 flex items-center justify-center bg-white">
                        <QRCodeSVG
                            value={JSON.stringify({
                                id: booking.bookingId,
                                date: booking.bookingDate,
                                slot: booking.slotId,
                                count: booking.numberOfParticipants
                            })}
                            size={110}
                            level="M"
                        />
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t-2 border-dashed border-slate-200">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Generated via Kiosk Mode</p>
                        <p className="text-[10px] text-slate-300">{new Date().toLocaleString()}</p>
                    </div>

                    <style>
                        {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-container, .print-container * {
                            visibility: visible;
                        }
                        .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                            border: none;
                            box-shadow: none;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
                    </style>
                </div>
            </div>
        </div>
    );
};

export default KioskTicket;
