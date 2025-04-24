// Servicio para gestionar los descansos
window.breakService = {
    requestBreak: async (room, initials, breakDuration, setSaveStatus) => {
        if (!initials.trim()) return;
        
        try {
            const timestamp = new Date().toISOString();
            const breakReq = await room.collection('break_request').create({
                initials: initials.toUpperCase().trim(),
                duration: parseInt(breakDuration),
                requested_at: timestamp,
                status: 'pending',
                started_at: null,
                completed_at: null
            });
            
            await window.logService.logAction(room, 'break_requested', { 
                breakId: breakReq.id, 
                initials: initials.toUpperCase().trim(),
                duration: parseInt(breakDuration)
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al solicitar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    startBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate) return;
            
            await room.collection('break_request').update(breakId, {
                status: 'active',
                started_at: new Date().toISOString(),
                elapsed_seconds: breakToUpdate.elapsed_seconds || 0
            });
            
            await window.logService.logAction(room, 'break_started', { 
                breakId,
                initials: breakToUpdate.initials, 
                duration: breakToUpdate.duration 
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al iniciar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    pauseBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate || breakToUpdate.status !== 'active') return;
            
            // Calcular tiempo transcurrido hasta el momento
            const startTime = new Date(breakToUpdate.started_at);
            const now = new Date();
            const elapsedSeconds = Math.floor((now - startTime) / 1000) + (breakToUpdate.elapsed_seconds || 0);
            
            await room.collection('break_request').update(breakId, {
                status: 'paused',
                paused_at: now.toISOString(),
                elapsed_seconds: elapsedSeconds
            });
            
            await window.logService.logAction(room, 'break_paused', { 
                breakId,
                initials: breakToUpdate.initials,
                elapsed_seconds: elapsedSeconds
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al pausar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    resumeBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate || breakToUpdate.status !== 'paused') return;
            
            await room.collection('break_request').update(breakId, {
                status: 'active',
                started_at: new Date().toISOString()
            });
            
            await window.logService.logAction(room, 'break_resumed', { 
                breakId,
                initials: breakToUpdate.initials,
                elapsed_seconds: breakToUpdate.elapsed_seconds || 0
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al reanudar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    postponeBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate) return;
            
            // Reordenar cambiando el timestamp (en una aplicación real, esto se manejaría de manera diferente)
            const oldTimestamp = breakToUpdate.requested_at;
            
            // Aquí simulamos un posponer moviendo el descanso al final de la cola
            await room.collection('break_request').update(breakId, {
                postponed: true,
                postponed_at: new Date().toISOString()
            });
            
            await window.logService.logAction(room, 'break_postponed', { 
                breakId,
                initials: breakToUpdate.initials,
                originalRequestTime: oldTimestamp
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al posponer descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    cancelBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToDelete = breakRequests.find(br => br.id === breakId);
            if (!breakToDelete) return;
            
            // En lugar de eliminar, lo movemos a completados con estado "Cancelado"
            await room.collection('break_request').update(breakId, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                completion_type: 'Cancelado' // Nuevo campo para indicar cómo se completó
            });
            
            await window.logService.logAction(room, 'break_cancelled', { 
                breakId,
                initials: breakToDelete.initials
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al cancelar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },

    completeBreak: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate) return;
            
            // Determinar el tipo de finalización
            let completionType = 'Manual';
            if (breakToUpdate.status === 'expired') {
                completionType = 'Expiró';
            }
            
            await room.collection('break_request').update(breakId, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                completion_type: completionType // Indicar cómo se completó
            });
            
            await window.logService.logAction(room, 'break_completed', { 
                breakId,
                initials: breakToUpdate.initials,
                duration: breakToUpdate.duration,
                completion_type: completionType
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al completar descanso:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },
    
    clearCompletedBreaks: async (room, organizedBreaks, setSaveStatus) => {
        try {
            const completedBreaks = organizedBreaks.completed;
            if (completedBreaks.length === 0) return;
            
            // Guardar información para registrar en logs
            const count = completedBreaks.length;
            
            // Eliminar todos los descansos completados
            for (const breakReq of completedBreaks) {
                await room.collection('break_request').delete(breakReq.id);
            }
            
            await window.logService.logAction(room, 'completed_breaks_cleared', { 
                count,
                clearedAt: new Date().toISOString()
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al limpiar descansos completados:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },
    
    moveBreakToNext: async (room, breakId, breakRequests, setSaveStatus) => {
        try {
            const breakToMove = breakRequests.find(br => br.id === breakId);
            if (!breakToMove) return;
            
            // Find position of this break in the pending queue
            const pendingBreaks = breakRequests
                .filter(br => br.status === 'pending')
                .sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at));
            
            const currentIndex = pendingBreaks.findIndex(br => br.id === breakId);
            
            // Can't move if it's already the last one
            if (currentIndex >= pendingBreaks.length - 1) return;
            
            // Get the next break after this one
            const nextBreak = pendingBreaks[currentIndex + 1];
            
            // Update the break with a new timestamp that comes just after the next one
            const newTimestamp = new Date(new Date(nextBreak.requested_at).getTime() + 1000).toISOString();
            
            await room.collection('break_request').update(breakId, {
                requested_at: newTimestamp,
                moved_after: nextBreak.id // Track that this was moved
            });
            
            await window.logService.logAction(room, 'break_moved_next', { 
                breakId,
                initials: breakToMove.initials,
                originalRequestTime: breakToMove.requested_at,
                movedAfterId: nextBreak.id
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al mover descanso a siguiente posición:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    },
    
    updateBreakTime: async (room, breakId, setSaveStatus) => {
        // Este método es una solución alternativa para forzar actualizaciones de la UI
        // En una aplicación real, usaríamos un enfoque más eficiente
        try {
            const breakRequests = room.collection('break_request').getList();
            const breakToCheck = breakRequests.find(br => br.id === breakId);
            
            if (breakToCheck?.status === 'active') {
                const startTime = new Date(breakToCheck.started_at);
                const now = new Date();
                const elapsed = Math.floor((now - startTime) / 1000) + (breakToCheck.elapsed_seconds || 0);
                const elapsedMinutes = Math.floor(elapsed / 60);
                
                // Si ha pasado el tiempo del descanso, marcarlo como expirado en vez de completado automáticamente
                if (elapsedMinutes >= breakToCheck.duration) {
                    await window.breakService.markBreakExpired(room, breakId, setSaveStatus);
                }
            }
        } catch (error) {
            console.error('Error al actualizar el tiempo del descanso:', error);
        }
    },
    
    markBreakExpired: async (room, breakId, setSaveStatus) => {
        try {
            const breakRequests = room.collection('break_request').getList();
            const breakToUpdate = breakRequests.find(br => br.id === breakId);
            if (!breakToUpdate) return;
            
            await room.collection('break_request').update(breakId, {
                status: 'expired',
                expired_at: new Date().toISOString()
            });
            
            await window.logService.logAction(room, 'break_expired', { 
                breakId,
                initials: breakToUpdate.initials,
                duration: breakToUpdate.duration
            });
            
            setSaveStatus({ state: 'saved', lastSaved: new Date().toLocaleTimeString() });
            return true;
        } catch (error) {
            console.error('Error al marcar descanso como expirado:', error);
            setSaveStatus({ state: 'error', lastSaved: null });
            return false;
        }
    }
};