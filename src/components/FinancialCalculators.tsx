'use client';

import React, { useState } from 'react';
import { Property } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator, Percent, Calendar, ShieldCheck, Wallet } from 'lucide-react';

interface FinancialCalculatorsProps {
  property: Property;
}

export const FinancialCalculators: React.FC<FinancialCalculatorsProps> = ({ property }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'kpr' | 'cash'>('kpr');

  // KPR Simulator States
  const [dpAmount, setDpAmount] = useState<number>(property.min_dp || property.price * 0.1);
  const [interestRate, setInterestRate] = useState<number>(5.0); // 5% default fixed rate
  const [tenorYears, setTenorYears] = useState<number>(15);

  // Cash Bertahap Simulator States
  const [cashTenorMonths, setCashTenorMonths] = useState<number>(
    property.max_cash_installment_months || 24
  );

  // Calculation Formulas
  const loanPrincipal = Math.max(0, property.price - dpAmount);

  // KPR Monthly Annuity Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalMonths = tenorYears * 12;
  let kprMonthlyInstallment = 0;

  if (loanPrincipal > 0 && monthlyInterestRate > 0 && totalMonths > 0) {
    kprMonthlyInstallment =
      (loanPrincipal *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths))) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  }

  // Cash Bertahap Monthly (0% Interest)
  const cashMonthlyInstallment = loanPrincipal / cashTenorMonths;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: property.currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('finCalcTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('finCalcSubtitle')}
          </p>
        </div>
      </div>

      {/* Scheme Tab Selector */}
      <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('kpr')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'kpr'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('kprTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cash'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>{t('cashTab')}</span>
        </button>
      </div>

      {/* Tab 1: KPR Annuity Simulator */}
      {activeTab === 'kpr' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* DP Slider Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">{t('dpLabel')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(dpAmount)}</span>
            </div>
            <input
              type="range"
              min={property.min_dp || 0}
              max={property.price * 0.5}
              step={1000000}
              value={dpAmount}
              onChange={(e) => setDpAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{t('minDpBound').replace('{val}', formatCurrency(property.min_dp || 0))}</span>
              <span>{t('maxDpBound').replace('{val}', formatCurrency(property.price * 0.5))}</span>
            </div>
          </div>

          {/* Tenor Slider Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">{t('tenorLabel')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tenorYears} {t('yearsLabel')}</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={tenorYears}
              onChange={(e) => setTenorYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5 {t('yearsLabel')}</span>
              <span>25 {t('yearsLabel')}</span>
            </div>
          </div>

          {/* Calculation Output Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
            <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
              {t('monthlyEstimate')}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
              {formatCurrency(kprMonthlyInstallment)}
              <span className="text-xs font-normal text-slate-500"> / {t('monthShort')}</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {t('kprInterestFootnote').replace('{rate}', String(interestRate))}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Cash Bertahap 0% Interest */}
      {activeTab === 'cash' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{t('cashSchemeNote')}</span>
          </div>

          {/* Cash Tenor Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
              {t('cashTenorTitle')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setCashTenorMonths(m)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    cashTenorMonths === m
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {m} {t('monthsLabel')}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Monthly Output */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
            <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
              {t('monthlyEstimate')} (0% Bunga)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 block tracking-tight">
              {formatCurrency(cashMonthlyInstallment)}
              <span className="text-xs font-normal text-slate-500"> / {t('monthShort')}</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {t('cashFlatNote').replace('{count}', String(cashTenorMonths))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
