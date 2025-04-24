const { useState } = React;

window.UserGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay">
            <div className="modal-content user-guide-modal">
                <h2>Guía de Uso - Gestión de Turnos de Descanso</h2>
                
                <div className="guide-section">
                    <h3>1. Solicitar un Descanso</h3>
                    <p>Para solicitar un nuevo descanso:</p>
                    <ul>
                        <li>Ingrese las iniciales del empleado (máximo 4 caracteres)</li>
                        <li>Seleccione la duración del descanso (1, 10, 20 o 25 minutos)</li>
                        <li>Haga clic en "Solicitar Descanso"</li>
                    </ul>
                </div>
                
                <div className="guide-section">
                    <h3>2. Gestionar Descansos Pendientes</h3>
                    <p>Para cada descanso en la cola, puede:</p>
                    <ul>
                        <li><strong>Iniciar:</strong> Comienza el tiempo del descanso</li>
                        <li><strong>Casi listo:</strong> Indica que el empleado terminará pronto lo que está haciendo</li>
                        <li><strong>Pasar Siguiente:</strong> Mueve el descanso después del siguiente en la cola</li>
                        <li><strong>Cancelar:</strong> Elimina la solicitud de descanso</li>
                    </ul>
                </div>
                
                <div className="guide-section">
                    <h3>3. Gestionar Descansos Activos</h3>
                    <p>Para los descansos en curso:</p>
                    <ul>
                        <li><strong>Pausar:</strong> Detiene temporalmente el tiempo del descanso</li>
                        <li><strong>Completar:</strong> Finaliza manualmente el descanso</li>
                        <li><strong>Completar Manual:</strong> Para descansos expirados que requieren finalización</li>
                    </ul>
                </div>
                
                <div className="guide-section">
                    <h3>4. Descansos Completados</h3>
                    <p>El historial muestra todos los descansos finalizados con su tipo de finalización:</p>
                    <ul>
                        <li><strong>Manual:</strong> Completado por el operador antes de expirar</li>
                        <li><strong>Expiró:</strong> El tiempo se agotó y se completó manualmente después</li>
                        <li><strong>Cancelado:</strong> La solicitud fue cancelada antes de iniciarse</li>
                    </ul>
                    <p>Para limpiar el historial, haga clic en "Limpiar historial" e ingrese el código de seguridad.</p>
                </div>
                
                <div className="guide-section">
                    <h3>5. Registros y Logs</h3>
                    <p>Para acceder a los registros del sistema:</p>
                    <ul>
                        <li>Haga clic en la pestaña "Registros y Logs"</li>
                        <li>Ingrese el código de seguridad cuando se solicite</li>
                        <li>Use "Descargar Logs" para exportar los registros en formato JSON</li>
                    </ul>
                </div>
                
                <button className="btn-primary" onClick={onClose}>Cerrar Guía</button>
            </div>
        </div>
    );
};

