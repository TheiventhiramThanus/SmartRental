import { useState, useEffect } from 'react';
import {
  ArrowLeft, Car, Calculator, Receipt, Printer, CheckCircle,
  Zap, TrendingDown, Route, Calendar, Clock, DollarSign, Star, History
} from 'lucide-react';
import { addDocument, getDocuments } from '../../../firebase';

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  model?: string;
  image?: string;
}

interface ManualBillingPageProps {
  vehicle: Vehicle;
  onBack: () => void;
}

interface PricingResult {
  model: string;
  label: string;
  total: number;
  breakdown: string[];
  recommended: boolean;
  tag?: string;
}

export function ManualBillingPage({ vehicle, onBack }: ManualBillingPageProps) {
  // KM Inputs
  const [startKm, setStartKm] = useState('');
  const [endKm, setEndKm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');

  // Pricing Config
  const [baseDayRate, setBaseDayRate] = useState(5000);
  const [extraKmRate, setExtraKmRate] = useState(50);
  const [includedKmPerDay, setIncludedKmPerDay] = useState(100);
  const [perKmRate, setPerKmRate] = useState(75);
  const [fixedBase, setFixedBase] = useState(8000);
  const [fixedIncludedKm, setFixedIncludedKm] = useState(100);
  const [fixedExtraRate, setFixedExtraRate] = useState(60);

  const [results, setResults] = useState<PricingResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingResult | null>(null);
  const [showBill, setShowBill] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [billNo, setBillNo] = useState(`BILL-${Date.now().toString().slice(-8)}`);
  
  const [pastBills, setPastBills] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const allBills = await getDocuments('trip_bills');
        const vehicleBills = allBills
          .filter(b => b.vehicleId === vehicle.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPastBills(vehicleBills);
      } catch (e) {
        console.error('Error fetching bill history:', e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [vehicle.id]);

  const distanceKm = Math.max(0, (parseFloat(endKm) || 0) - (parseFloat(startKm) || 0));

  const getDatetimeMs = (date: string, time: string) => {
    if (!date) return 0;
    return new Date(`${date}T${time}:00`).getTime();
  };

  const startMs = getDatetimeMs(startDate, startTime);
  const endMs = getDatetimeMs(endDate, endTime);
  const durationMs = Math.max(0, endMs - startMs);
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) || 1;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  const calculate = () => {
    if (!startKm || !endKm || !startDate || !endDate) return;
    if (distanceKm <= 0) return;

    const models: PricingResult[] = [];

    // 1. Day-Based
    const dayCharges = baseDayRate * durationDays;
    const totalIncludedKm = includedKmPerDay * durationDays;
    const extraKmDay = Math.max(0, distanceKm - totalIncludedKm);
    const dayTotal = dayCharges + extraKmDay * extraKmRate;
    models.push({
      model: 'day-based',
      label: 'Day-Based + Extra km',
      total: dayTotal,
      breakdown: [
        `${durationDays} day${durationDays > 1 ? 's' : ''} × LKR ${baseDayRate.toLocaleString()} = LKR ${dayCharges.toLocaleString()}`,
        `Included: ${totalIncludedKm} km (${includedKmPerDay} km/day)`,
        extraKmDay > 0 ? `Extra ${extraKmDay.toFixed(1)} km × LKR ${extraKmRate} = LKR ${(extraKmDay * extraKmRate).toLocaleString()}` : 'No extra km charges',
      ],
      recommended: false,
    });

    // 2. Fixed Base + Extra km
    const fixedExtra = Math.max(0, distanceKm - fixedIncludedKm);
    const fixedTotal = fixedBase + fixedExtra * fixedExtraRate;
    models.push({
      model: 'fixed-100km',
      label: `Fixed Base (${fixedIncludedKm} km)`,
      total: fixedTotal,
      breakdown: [
        `Fixed base price: LKR ${fixedBase.toLocaleString()}`,
        `Included: ${fixedIncludedKm} km`,
        fixedExtra > 0 ? `Extra ${fixedExtra.toFixed(1)} km × LKR ${fixedExtraRate} = LKR ${(fixedExtra * fixedExtraRate).toLocaleString()}` : 'No extra km charges',
      ],
      recommended: false,
    });

    // 3. Per KM
    const perKmTotal = distanceKm * perKmRate;
    models.push({
      model: 'per-km',
      label: 'Per Kilometer',
      total: perKmTotal,
      breakdown: [
        `${distanceKm.toFixed(2)} km × LKR ${perKmRate}/km`,
        `Total: LKR ${perKmTotal.toLocaleString()}`,
      ],
      recommended: false,
    });

    // AI Recommendation: lowest total for customer, tag each
    const sorted = [...models].sort((a, b) => a.total - b.total);
    sorted[0].recommended = true;
    sorted[0].tag = '⚡ Best Value';
    if (sorted[1]) sorted[1].tag = '👍 Mid Range';
    if (sorted[2]) sorted[2].tag = '💰 Premium';

    setResults(sorted);
    setSelectedModel(sorted[0]);
    setShowBill(false);
  };

  const handleSaveBill = async () => {
    if (!selectedModel) return;
    setIsSaving(true);
    try {
      const newBillData = {
        billNo,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        startKm: parseFloat(startKm),
        endKm: parseFloat(endKm),
        distanceKm,
        startDatetime: `${startDate} ${startTime}`,
        endDatetime: `${endDate} ${endTime}`,
        durationDays,
        pricingModel: selectedModel.model,
        totalAmount: selectedModel.total,
        createdAt: new Date().toISOString(),
      };
      await addDocument('trip_bills', newBillData);
      
      setPastBills(prev => [newBillData, ...prev]);
      // Generate a new bill number for the next potential bill
      setBillNo(`BILL-${Date.now().toString().slice(-8)}`);
    } catch (e) {
      console.error('Error saving bill:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const canCalculate = startKm && endKm && startDate && endDate && distanceKm > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{vehicle.name}</h1>
          <p className="text-sm text-gray-400">{vehicle.licensePlate} • Manual KM Billing</p>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            <Zap className="w-3.5 h-3.5" />
            AI BILLING
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT FORM */}
        <div className="space-y-4">
          {/* Odometer Reading */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-purple-600" />
              Odometer Readings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Start KM</label>
                <input
                  type="number"
                  value={startKm}
                  onChange={e => setStartKm(e.target.value)}
                  placeholder="e.g. 12500"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-purple-500 transition"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">End KM</label>
                <input
                  type="number"
                  value={endKm}
                  onChange={e => setEndKm(e.target.value)}
                  placeholder="e.g. 12850"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-purple-500 transition"
                  min="0"
                />
              </div>
            </div>
            {distanceKm > 0 && (
              <div className="mt-3 p-3 rounded-lg flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                <span className="text-xs font-bold text-purple-600">Distance Traveled</span>
                <span className="text-xl font-bold text-purple-700">{distanceKm.toFixed(2)} km</span>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Rental Period
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition" />
              </div>
            </div>
            {durationMs > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {durationDays} day{durationDays !== 1 ? 's' : ''}
                  {durationHours > 0 ? ` ${durationHours}h` : ''}
                  {durationMins > 0 ? ` ${durationMins}m` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Pricing Config */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Pricing Rates
            </h2>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Day-Based Model</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Base/day (LKR)', val: baseDayRate, set: setBaseDayRate },
                  { label: 'Included km/day', val: includedKmPerDay, set: setIncludedKmPerDay },
                  { label: 'Extra km rate', val: extraKmRate, set: setExtraKmRate },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] text-gray-500 block mb-1">{f.label}</label>
                    <input type="number" value={f.val} onChange={e => f.set(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-green-400" min="0" />
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Fixed Base Model</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Base price (LKR)', val: fixedBase, set: setFixedBase },
                  { label: 'Included km', val: fixedIncludedKm, set: setFixedIncludedKm },
                  { label: 'Extra km rate', val: fixedExtraRate, set: setFixedExtraRate },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] text-gray-500 block mb-1">{f.label}</label>
                    <input type="number" value={f.val} onChange={e => f.set(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-green-400" min="0" />
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Per KM Rate</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Rate per km (LKR)</label>
                  <input type="number" value={perKmRate} onChange={e => setPerKmRate(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-green-400" min="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            disabled={!canCalculate}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: canCalculate ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#d1d5db' }}
          >
            <Zap className="w-5 h-5" />
            Calculate AI Billing
          </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-500 font-semibold">Enter KM readings &amp; dates</p>
              <p className="text-sm text-gray-400 mt-1">AI will compare all pricing models<br/>and recommend the best option</p>
            </div>
          ) : (
            <>
              {/* AI Summary */}
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5" />
                  <h2 className="font-bold text-lg">AI Billing Analysis</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-white/70">Distance</p>
                    <p className="text-xl font-bold">{distanceKm.toFixed(1)} km</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-white/70">Days</p>
                    <p className="text-xl font-bold">{durationDays}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-white/70">Best Price</p>
                    <p className="text-xl font-bold">LKR {results[0]?.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Model Cards */}
              <div className="space-y-3">
                {results.map((r) => (
                  <button
                    key={r.model}
                    onClick={() => { setSelectedModel(r); setShowBill(false); }}
                    className={`w-full text-left rounded-2xl p-4 border-2 transition ${
                      selectedModel?.model === r.model
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-100 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {r.recommended && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        <span className="font-bold text-gray-800 text-sm">{r.label}</span>
                        {r.tag && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.recommended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>{r.tag}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-700">LKR {r.total.toLocaleString()}</p>
                        {selectedModel?.model === r.model && (
                          <CheckCircle className="w-4 h-4 text-purple-600 ml-auto mt-0.5" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {r.breakdown.map((line, i) => (
                        <p key={i} className="text-xs text-gray-500">{line}</p>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Savings Indicator */}
              {results.length > 1 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">
                    <strong>{results[0].label}</strong> saves customer{' '}
                    <strong>LKR {(results[results.length - 1].total - results[0].total).toLocaleString()}</strong>{' '}
                    vs most expensive option
                  </p>
                </div>
              )}

              {/* Generate Bill */}
              {selectedModel && (
                <button
                  onClick={() => { setShowBill(true); handleSaveBill(); }}
                  className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
                >
                  <Receipt className="w-5 h-5" />
                  Generate Bill — LKR {selectedModel.total.toLocaleString()}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* BILLING HISTORY */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Billing History for {vehicle.name}
        </h2>
        {isLoadingHistory ? (
          <p className="text-gray-500 text-sm py-4 text-center">Loading history...</p>
        ) : pastBills.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No manual bills generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Bill No</th>
                  <th className="px-4 py-3">Distance (KM)</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">AI Model Used</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastBills.map((b, i) => (
                  <tr key={b.id || i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(b.createdAt).toLocaleDateString('en-LK')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{b.billNo}</td>
                    <td className="px-4 py-3 text-gray-700">{b.distanceKm} km</td>
                    <td className="px-4 py-3 text-gray-700">{b.durationDays} day(s)</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">
                        {b.pricingModel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      LKR {b.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVOICE MODAL */}
      {showBill && selectedModel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div id="manual-bill-content" className="p-8">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Smart Car Rental</h1>
                <p className="text-gray-500 mt-1">Trip Invoice</p>
                <p className="text-sm text-gray-400 mt-1">Bill No: {billNo}</p>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{vehicle.name}</p>
                    <p className="text-sm text-gray-500">{vehicle.licensePlate} • {vehicle.model}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup</p>
                  <p className="font-semibold text-gray-700">{startDate} {startTime}</p>
                  <p className="text-sm text-gray-500 mt-1">Odometer: <strong>{parseFloat(startKm).toLocaleString()} km</strong></p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Return</p>
                  <p className="font-semibold text-gray-700">{endDate} {endTime}</p>
                  <p className="text-sm text-gray-500 mt-1">Odometer: <strong>{parseFloat(endKm).toLocaleString()} km</strong></p>
                </div>
              </div>

              {/* Summary Row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Distance</p>
                  <p className="text-xl font-bold text-blue-700">{distanceKm.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-500">km</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Duration</p>
                  <p className="text-xl font-bold text-orange-700">{durationDays}</p>
                  <p className="text-[10px] text-gray-500">day{durationDays !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Model</p>
                  <p className="text-xs font-bold text-purple-700 mt-1 leading-tight">{selectedModel.label}</p>
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="border-t-2 border-gray-200 pt-5 mb-5">
                <h3 className="font-bold text-gray-800 mb-3">Billing Breakdown</h3>
                <div className="space-y-2">
                  {selectedModel.breakdown.map((line, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{line.split('=')[0]}</span>
                      {line.includes('=') && (
                        <span className="font-semibold text-gray-800">{line.split('=')[1]?.trim()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                <span className="text-white font-bold text-lg">Total Amount</span>
                <span className="text-white font-bold text-3xl">LKR {selectedModel.total.toLocaleString()}</span>
              </div>

              <p className="text-center text-sm text-gray-400 mt-5">Thank you for choosing Smart Car Rental</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>
              <button
                onClick={() => setShowBill(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @media print {
              body * { visibility: hidden; }
              #manual-bill-content, #manual-bill-content * { visibility: visible; }
              #manual-bill-content { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
