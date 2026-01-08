"use client";

import { cn } from "@/lib/utils";
import { EntityGovernance } from "@/types/extraction";
import { User, Building2, Users } from "lucide-react";

interface BoardManagersCardProps {
  governance: EntityGovernance;
  className?: string;
}

export function BoardManagersCard({
  governance,
  className,
}: BoardManagersCardProps) {
  const { board_members, administrator, shareholder_name, shareholder_jurisdiction } =
    governance;

  const hasContent =
    board_members.length > 0 ||
    administrator ||
    shareholder_name;

  if (!hasContent) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg p-4 border border-slate-700",
        className
      )}
    >
      <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Entity Governance
      </h3>

      <div className="space-y-4">
        {/* Board Members */}
        {board_members.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Board of Managers
            </p>
            <div className="space-y-2">
              {board_members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 bg-slate-900/50 rounded-lg"
                >
                  <div className="p-1.5 bg-slate-700 rounded-full">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {member.name}
                    </p>
                    {member.role && (
                      <p className="text-xs text-slate-400">{member.role}</p>
                    )}
                    {member.address && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {member.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Administrator */}
        {administrator && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Administrator
            </p>
            <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
              <div className="p-1.5 bg-blue-500/20 rounded-full">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <p className="text-sm text-slate-200">{administrator}</p>
            </div>
          </div>
        )}

        {/* Shareholder */}
        {shareholder_name && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Shareholder
            </p>
            <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
              <div className="p-1.5 bg-purple-500/20 rounded-full">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-200">{shareholder_name}</p>
                {shareholder_jurisdiction && (
                  <p className="text-xs text-slate-400">
                    {shareholder_jurisdiction}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
