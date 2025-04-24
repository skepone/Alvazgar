// Utilidades para manejo de tiempo
window.timeUtils = {
    formatTime: (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    getTimeRemaining: (breakReq) => {
        if ((breakReq.status !== 'active' && breakReq.status !== 'expired') || !breakReq.started_at) return null;
        
        const startTime = new Date(breakReq.started_at);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000) + (breakReq.elapsed_seconds || 0);
        const totalBreakSeconds = breakReq.duration * 60;
        const remainingSeconds = Math.max(0, totalBreakSeconds - elapsedSeconds);
        
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        return { minutes, seconds, isExpired: remainingSeconds <= 0 };
    },
    
    getElapsedTime: (breakReq) => {
        if (breakReq.status !== 'paused' || !breakReq.elapsed_seconds) return null;
        
        const elapsedSeconds = breakReq.elapsed_seconds;
        const totalBreakSeconds = breakReq.duration * 60;
        const remainingSeconds = Math.max(0, totalBreakSeconds - elapsedSeconds);
        
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        return { minutes, seconds };
    }
};

