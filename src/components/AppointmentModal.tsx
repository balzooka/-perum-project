'use client';

import React, { useState } from 'react';
import { X, Calendar, User, Phone, MapPin, Video, CheckCircle2, MessageSquare } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  whatsappNumber: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  whatsappNumber,
}) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [surveyType, setSurveyType] = useState<'LOKASI_LANGSUNG' | 'LIVE_ONLINE'>('LOKASI_LANGSUNG');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone || !scheduledDate) return;

    setIsSubmitting(true);

    // Format phone to clean E.164 without '+' for wa.me
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

    const surveyTypeText = surveyType === 'LOKASI_LANGSUNG' ? 'Survey Lokasi Langsung' : 'Live Online Video Call';

    // Auto-formatted WhatsApp Message Builder
    const waMessage = `Halo Marketing, saya *${userName}* ingin menjadwalkan *${surveyTypeText}* untuk perumahan *${propertyName}* pada tanggal *${scheduledDate}*. Mohon konfirmasinya. Terima kasih.`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      window.open(waUrl, '_blank');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Jadwalkan Survey Lokasi</h3>
              <p className="text-[11px] text-slate-400">{propertyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Input Nama */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Lengkap</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-colors"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Input WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nomor WhatsApp Valid</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-colors"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Tipe Survey Radio Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tipe Kunjungan Survey</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSurveyType('LOKASI_LANGSUNG')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  surveyType === 'LOKASI_LANGSUNG'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <MapPin className="w-4 h-4" /> Lokasi Langsung
                </div>
                <span className="text-[10px] text-slate-400">Datang langsung ke perumahan</span>
              </button>

              <button
                type="button"
                onClick={() => setSurveyType('LIVE_ONLINE')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  surveyType === 'LIVE_ONLINE'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Video className="w-4 h-4" /> Live Video Call
                </div>
                <span className="text-[10px] text-slate-400">Virtual tour via WhatsApp Video</span>
              </button>
            </div>
          </div>

          {/* Tanggal Kunjungan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Rencana Tanggal Kunjungan</label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl py-3 px-4 focus:outline-none transition-colors"
            />
          </div>

          {/* WhatsApp Preview Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Preview Pesan WhatsApp:
            </span>
            <p className="text-[11px] italic bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              "Halo Marketing, saya {userName || '[Nama]'} ingin menjadwalkan {surveyType === 'LOKASI_LANGSUNG' ? 'Survey Lokasi Langsung' : 'Live Online Video Call'} untuk {propertyName} pada tanggal {scheduledDate || '[Tanggal]'}..."
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi & Buka WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
