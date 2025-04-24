// Servicio para gestionar los logs
window.logService = {
    logAction: async (room, action, details = {}) => {
        try {
            await room.collection('log_entry').create({
                action,
                timestamp: new Date().toISOString(),
                ...details
            });
            return true;
        } catch (error) {
            console.error('Error al registrar acción:', error);
            return false;
        }
    },
    
    downloadLogs: (logs) => {
        if (!logs.length) return;
        
        const logsData = logs.map(log => ({
            id: log.id,
            session_id: log.session_id,
            action: log.action,
            timestamp: log.timestamp,
            username: log.username,
            ...Object.keys(log)
                .filter(key => !['id', 'session_id', 'action', 'timestamp', 'username', 'created_at'].includes(key))
                .reduce((obj, key) => ({ ...obj, [key]: log[key] }), {})
        }));
        
        const jsonString = JSON.stringify(logsData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        saveAs(blob, `turnos-descansos-logs-${new Date().toISOString().split('T')[0]}.json`);
    }
};