import React from 'react';

const AvatarSelector = ({ avatars, selectedAvatar, onSelect, onClose }) => {
  const [tempSelected, setTempSelected] = React.useState(selectedAvatar);
  if (!avatars || avatars.length === 0) return null;
  return (
    <div className="pantry-modal-bg">
      <div className="pantry-modal" style={{ maxWidth: '600px', minWidth: '380px', width: '100%', margin: '2.5rem auto', position: 'relative', background: '#fff', padding: '2.5rem 2.5rem' }}>
        {onClose && (
          <button className="pantry-modal-close" onClick={onClose}>×</button>
        )}
        <h3 className="pantry-modal-title">Selecciona tu avatar</h3>
        <div
          className="w-full mb-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '20px',
            justifyItems: 'center',
            alignItems: 'center',
            padding: '0.5rem 0',
          }}
        >
          {avatars.map((avatar, idx) => {
            const isActive = tempSelected === avatar;
            return (
              <button
                key={avatar + idx}
                type="button"
                className={`avatar-list-item flex items-center justify-center rounded-full cursor-pointer group transition ${isActive ? 'ring-4 ring-primary' : ''}`}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: isActive ? '3px solid var(--primary)' : '1px solid var(--primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  background: '#fff',
                  padding: 0,
                }}
                onClick={() => setTempSelected(avatar)}
                aria-pressed={isActive}
              >
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: '0.5rem', width: '100%' }}
          onClick={() => onSelect(tempSelected)}
          disabled={!tempSelected}
        >Actualizar</button>
      </div>
    </div>
  );
};

export default AvatarSelector;
