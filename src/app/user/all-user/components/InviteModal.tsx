"use client";

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Invite User</div>
            <div className="au-modal__sub">Send an invite to a new user</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>
        {/* TODO: Add invite form fields */}
        <div className="au-modal__actions">
          <button className="au-btn au-btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
