import { ArrowRight, AtSign, Check } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import KitBadge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { User, planVariant, roleVariant } from "../types";
import { Badge } from "./Badge";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  checked: boolean;
  onCheck: () => void;
  onClick: () => void;
}

export function UserCard({
  user,
  isSelected,
  checked,
  onCheck,
  onClick,
}: UserCardProps) {
  return (
    <Card
      hover
      onClick={onClick}
      className={cn("relative cursor-pointer", isSelected && "border-primary ring-2 ring-primary-ring")}
    >
      <div className="absolute right-4 top-4">
        <Checkbox
          aria-label={`Select ${user.name}`}
          checked={checked}
          onChange={onCheck}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="mb-3 flex items-start gap-3 pr-8">
        <Avatar name={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-foreground">{user.name}</span>
            {user.pro && <KitBadge variant="warning" size="sm">PRO</KitBadge>}
          </div>
          <p className="truncate text-[0.8125rem] text-muted-foreground">{user.company}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1.5 truncate text-[0.8125rem] text-secondary-foreground">
        <AtSign size={13} className="shrink-0 text-muted-foreground" /> {user.email}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge status={user.status} />
        <KitBadge variant={roleVariant(user.role)}>{user.role}</KitBadge>
        <KitBadge variant={planVariant(user.plan)}>{user.plan}</KitBadge>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
        {(
          [
            ["msgs",      user.msgs.toLocaleString(), "msgs"],
            ["campaigns", String(user.campaigns),     "camps"],
            ["chatbots",  String(user.chatbots),      "bots"],
          ] as [string, string, string][]
        ).map(([key, val, lbl]) => (
          <div key={key} className="bg-surface px-2 py-2 text-center">
            <div className="text-sm font-semibold tabular-nums text-foreground">{val}</div>
            <div className="text-[0.6875rem] text-muted-foreground">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{user.login}</span>
        <span className="flex items-center gap-1 font-medium text-primary-text">
          {isSelected ? (
            <>
              Selected <Check size={13} />
            </>
          ) : (
            <>
              View Details <ArrowRight size={13} />
            </>
          )}
        </span>
      </div>
    </Card>
  );
}
