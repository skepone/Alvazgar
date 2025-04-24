const { useState } = React;

window.ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, authCode = 'DELETE' }) => {
    const [confirmCode, setConfirmCode] = useState('');
    const [error, setError] = useState('');
    
    if (!isOpen) return null;
    
    const handleConfirm = () => {
        if (confirmCode.toUpperCase() === authCode) {
            onConfirm();
            onClose();
        } else {
            setError('Código incorrecto. Por favor intente de nuevo.');
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="form-group">
                    <label>Ingrese el código de seguridad:</label>
                    <input 
                        type="text" 
                        value={confirmCode} 
                        onChange={(e) => {
                            setConfirmCode(e.target.value);
                            setError('');
                        }}
                        placeholder="Código de seguridad"
                    />
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="button-group">
                    <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn-danger" onClick={handleConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

