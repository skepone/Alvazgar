// Destructure React hooks at the top of the file
const { useState, useEffect, useRef, useMemo } = React;

// Access components from window object
const { SaveIndicator, BreakRequestForm, ActiveBreaks, PendingBreaks, CompletedBreaks, LogsView, ConfirmationModal, UserGuideModal } = window;

// Inicializar WebsimSocket para la persistencia de datos
const room = new WebsimSocket();

const App = () => {
    const [activeTab, setActiveTab] = useState('breaks');
    const [saveStatus, setSaveStatus] = useState({ state: 'idle', lastSaved: null });
    const [sessionId] = useState(window.generateUUID());
    const [modalOpen, setModalOpen] = useState(false);
    const [logsAuthModalOpen, setLogsAuthModalOpen] = useState(false);
    const [isLogsAuthenticated, setIsLogsAuthenticated] = useState(false);
    const [userGuideOpen, setUserGuideOpen] = useState(false);
    
    // Referencias para los timers
    const autoSaveTimerRef = useRef(null);
    const breakTimersRef = useRef({});
    
    // Suscribirse a las solicitudes de descanso
    const breakRequests = React.useSyncExternalStore(
        room.collection('break_request').subscribe,
        room.collection('break_request').getList
    );

    // Suscribirse a las entradas de log
    const logs = React.useSyncExternalStore(
        room.collection('log_entry').subscribe,
        room.collection('log_entry').getList
    );

    // Organizar las solicitudes de descanso por estado y hora
    const organizedBreaks = useMemo(() => {
        if (!breakRequests.length) return { pending: [], active: [], completed: [], paused: [], expired: [] };
        
        const sorted = [...breakRequests].sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at));
        
        return {
            pending: sorted.filter(br => br.status === 'pending'),
            active: sorted.filter(br => br.status === 'active'),
            paused: sorted.filter(br => br.status === 'paused'),
            expired: sorted.filter(br => br.status === 'expired'),
            completed: sorted.filter(br => br.status === 'completed')
        };
    }, [breakRequests]);

    // Manejar el cambio de pestaña con autenticación para logs
    const handleTabChange = (tab) => {
        if (tab === 'logs' && !isLogsAuthenticated) {
            setLogsAuthModalOpen(true);
        } else {
            setActiveTab(tab);
        }
    };

    // Inicializar el autosave cuando se monta el componente
    useEffect(() => {
        // Registrar inicio de sesión
        window.logService.logAction(room, 'session_started', { sessionId });
        
        // Configurar intervalo de autoguardado (5 minutos)
        autoSaveTimerRef.current = setInterval(() => {
            performAutoSave();
        }, 5 * 60 * 1000);
        
        // Configurar detector de inactividad
        let idleTimer;
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                performAutoSave();
            }, 3 * 60 * 1000); // Tras 3 minutos de inactividad
        };
        
        // Eventos para detectar actividad del usuario
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });
        
        resetIdleTimer();
        
        // Limpiar al desmontar
        return () => {
            clearInterval(autoSaveTimerRef.current);
            clearTimeout(idleTimer);
            ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.removeEventListener(event, resetIdleTimer, true);
            });
            
            // Limpiar todos los temporizadores de descanso
            Object.values(breakTimersRef.current).forEach(timer => clearInterval(timer));
            
            // Registrar fin de sesión
            window.logService.logAction(room, 'session_ended', { sessionId });
        };
    }, []);
    
    // Iniciar o actualizar temporizadores para descansos activos
    useEffect(() => {
        // Limpiar timers antiguos que ya no corresponden a descansos activos
        Object.keys(breakTimersRef.current).forEach(id => {
            if (!organizedBreaks.active.find(br => br.id === id) && 
                !organizedBreaks.expired.find(br => br.id === id)) {
                clearInterval(breakTimersRef.current[id]);
                delete breakTimersRef.current[id];
            }
        });
        
        // Iniciar nuevos timers para descansos activos
        organizedBreaks.active.forEach(breakReq => {
            if (!breakTimersRef.current[breakReq.id]) {
                breakTimersRef.current[breakReq.id] = setInterval(() => {
                    // Forzar actualización del componente para mostrar tiempo actualizado
                    window.breakService.updateBreakTime(room, breakReq.id, setSaveStatus);
                }, 1000);
            }
        });
        
        // También mantener los temporizadores para descansos expirados
        organizedBreaks.expired.forEach(breakReq => {
            if (!breakTimersRef.current[breakReq.id]) {
                breakTimersRef.current[breakReq.id] = setInterval(() => {
                    forceUpdate();
                }, 1000);
            }
        });
    }, [organizedBreaks.active, organizedBreaks.expired]);

    const performAutoSave = async () => {
        setSaveStatus({ state: 'saving', lastSaved: null });
        try {
            // En una aplicación real aquí sincronizaríamos datos pendientes
            // Para esta demo, simplemente registramos la acción
            await window.logService.logAction(room, 'auto_save', { sessionId });
            setSaveStatus({ 
                state: 'saved', 
                lastSaved: new Date().toLocaleTimeString() 
            });
        } catch (error) {
            console.error('Error al guardar automáticamente:', error);
            setSaveStatus({ 
                state: 'error', 
                lastSaved: saveStatus.lastSaved,
                error: error.message 
            });
        }
    };

    // Hack para forzar actualización del componente
    const [, updateState] = useState({});
    const forceUpdate = () => updateState({});

    // Autenticación exitosa para acceder a los logs
    const handleLogsAuthSuccess = () => {
        setIsLogsAuthenticated(true);
        setLogsAuthModalOpen(false);
        setActiveTab('logs');
        window.logService.logAction(room, 'logs_access_granted', { sessionId });
    };

    return (
        <div className="container">
            <header>
                <div className="header-title">
                    <h1>Gestión de Turnos de Descanso</h1>
                    <SaveIndicator saveStatus={saveStatus} />
                </div>
                <div className="header-actions">
                    <div 
                        className="help-button"
                        onClick={() => setUserGuideOpen(true)}
                        title="Abrir guía de uso"
                    >?</div>
                </div>
            </header>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'breaks' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('breaks')}
                >
                    Gestión de Descansos
                </button>
                <button 
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('logs')}
                >
                    Registros y Logs
                </button>
            </div>
            
            {activeTab === 'breaks' && (
                <>
                    <BreakRequestForm 
                        room={room} 
                        setSaveStatus={setSaveStatus} 
                    />
                    
                    <ActiveBreaks 
                        organizedBreaks={organizedBreaks} 
                        room={room} 
                        setSaveStatus={setSaveStatus} 
                    />
                    
                    <PendingBreaks 
                        organizedBreaks={organizedBreaks} 
                        room={room} 
                        setSaveStatus={setSaveStatus} 
                    />
                    
                    <CompletedBreaks 
                        organizedBreaks={organizedBreaks} 
                        room={room} 
                        setSaveStatus={setSaveStatus} 
                        setModalOpen={setModalOpen} 
                    />
                </>
            )}
            
            {activeTab === 'logs' && (
                <LogsView logs={logs} />
            )}
            
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={() => window.breakService.clearCompletedBreaks(room, organizedBreaks, setSaveStatus)}
                title="Confirmación Requerida"
                message="Esta acción eliminará todos los registros de descansos completados. Para confirmar, ingrese el código de seguridad."
            />

            <ConfirmationModal
                isOpen={logsAuthModalOpen}
                onClose={() => setLogsAuthModalOpen(false)}
                onConfirm={handleLogsAuthSuccess}
                title="Acceso Restringido"
                message="Para acceder a los registros y logs del sistema, ingrese el código de seguridad."
                authCode="VISION"
            />
            
            <UserGuideModal
                isOpen={userGuideOpen}
                onClose={() => setUserGuideOpen(false)}
            />
        </div>
    );
};

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')).render(<App />);