import React, { useState } from 'react';
import { AuditLog } from '../types';
import { Database, Shield, Filter, Search, Clock, User, Globe, Tag } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'ALL' && log.eventType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.actorRole.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="audit-log-viewer" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
            Security & Compliance Audit Trail
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Single-Database Multi-Tenant Event Logs
          </h2>
          <p className="text-xs text-slate-500">
            Discriminator column: <code className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">tenant_id = 'FLYECLIPSE_CI'</code>. Immutable Spring Security audit log.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search event, actor, or PNR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6d3cc7]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            <option value="SIGNIN">SIGNIN</option>
            <option value="SIGNUP">SIGNUP</option>
            <option value="SIGNOUT">SIGNOUT</option>
            <option value="MFA_VERIFIED">MFA_VERIFIED</option>
            <option value="BOOKING_CREATED">BOOKING_CREATED</option>
            <option value="SEAT_HELD_2H">SEAT_HELD_2H</option>
            <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
            <option value="FLIGHT_SCHEDULE_UPDATED">FLIGHT_SCHEDULE_UPDATED</option>
            <option value="MAINTENANCE_LOG_CREATED">MAINTENANCE_LOG_CREATED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#6d3cc7]" /> MySQL `access_log` Table with Discriminator
          </span>
          <span className="font-mono text-purple-700 font-bold">
            Showing {filteredLogs.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-50/80 transition-colors text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                      log.eventType.includes('SIGN')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : log.eventType.includes('PAYMENT')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.eventType.includes('HOLD')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : log.eventType.includes('MAINTENANCE')
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {log.eventType}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span>IP: {log.ipAddress}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    tenant: {log.tenantId}
                  </span>
                </div>
              </div>

              <p className="text-slate-800 font-semibold text-sm">{log.details}</p>

              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Actor: <strong className="text-slate-700">{log.actorEmail}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                  {log.actorRole}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
