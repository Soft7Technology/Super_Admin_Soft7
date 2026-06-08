import { User, STATUS_DOT, roleColor, planColor } from "../types";
import { Badge } from "./Badge";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onClick: () => void;
}

export function UserCard({ user, isSelected, onClick }: UserCardProps) {
  return (
    <div
      onClick={onClick}
      className={`au-card ${isSelected ? "au-card--selected" : ""}`}
    >
      <div className="au-card__top">
        <div className="au-card__identity">
          <div className="au-avatar-wrap">
            <div className="au-avatar au-avatar--44" style={{ background: user.av }}>
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div
              className={`au-status-dot au-status-dot--card ${
                STATUS_DOT[user.status] ?? "au-status-dot--other"
              }`}
            />
          </div>
          <div>
            <div className="au-card__name-row">
              <span className="au-card__name">{user.name}</span>
              {user.pro && <span className="au-pro-badge">PRO</span>}
            </div>
            <div className="au-card__company">{user.company}</div>
          </div>
        </div>
        <Badge status={user.status} />
      </div>

      <div className="au-card__email">
        <span className="au-card__email-icon">@</span> {user.email}
      </div>

      <div className="au-card__meta">
        <span
          className="au-chip"
          style={{ background: `${roleColor(user.role)}15`, color: roleColor(user.role) }}
        >
          {user.role}
        </span>
        <span
          className="au-chip"
          style={{ background: `${planColor(user.plan)}15`, color: planColor(user.plan) }}
        >
          {user.plan}
        </span>
      </div>

      <div className="au-card__stats">
        {(
          [
            ["msgs",      user.msgs.toLocaleString(), "msgs"],
            ["campaigns", String(user.campaigns),     "camps"],
            ["chatbots",  String(user.chatbots),      "bots"],
          ] as [string, string, string][]
        ).map(([key, val, lbl]) => (
          <div key={key} className="au-stat-box">
            <div className="au-stat-box__val">{val}</div>
            <div className="au-stat-box__lbl">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="au-card__footer">
        <span className="au-card__login">{user.login}</span>
        <span className={isSelected ? "au-card__cta--sel" : "au-card__cta"}>
          {isSelected ? "Selected ✓" : "View Details →"}
        </span>
      </div>
    </div>
  );
}
