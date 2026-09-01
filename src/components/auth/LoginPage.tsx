import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Building2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (officerName: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [officerNameInput, setOfficerNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const name = officerNameInput.trim() || (email ? email.split('@')[0] : 'Procurement Officer');
      onLoginSuccess(name);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      {/* Tricolor Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      {/* Top Banner */}
      <div className="bg-blue-900 text-white py-3 px-6 shadow-sm border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <div className="font-bold text-sm tracking-wide">GOVERNMENT OF INDIA • GeM PROCUREMENT PORTAL</div>
              <div className="text-[11px] text-blue-200">Ministry of Petroleum & Natural Gas | Chennai Petroleum Corporation Limited</div>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded font-semibold border border-amber-400/30">
              SIH 2026 • SIH26100
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-700 mb-3 border border-blue-100 shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Procurement Officer Login
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              AI-Powered Integrated Bid Compliance & Statutory Verification System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Name / Full Name
              </label>
              <input
                id="login-officer-name"
                type="text"
                required
                value={officerNameInput}
                onChange={(e) => setOfficerNameInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800"
                placeholder="e.g. Shri Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email ID / Government ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800"
                  placeholder="officer.name@cpcl.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                <span>Remember on this terminal</span>
              </label>
              <span className="text-blue-700 font-medium">NIC 2FA Secured</span>
            </div>

            {/* Submit Button */}
            <button
              id="submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as Officer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Smart India Hackathon 2026 • Ministry of Petroleum & Natural Gas (CPCL) • Problem Statement SIH26100
      </footer>
    </div>
  );
};
