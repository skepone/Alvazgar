window.ActiveBreaks = ({ organizedBreaks, room, setSaveStatus }) => {
    const breakRequests = React.useSyncExternalStore(
        room.collection('break_request').subscribe,
        room.collection('break_request').getList
    );
    
    return (
        <section className="card">
            <h2>Descansos Activos</h2>
            {organizedBreaks.active.length === 0 && organizedBreaks.paused.length === 0 && organizedBreaks.expired.length === 0 ? (
                <p>No hay descansos en curso actualmente.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Iniciales</th>
                            <th>Duración</th>
                            <th>Inicio</th>
                            <th>Tiempo Restante</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizedBreaks.active.map(breakReq => {
                            const remaining = window.timeUtils.getTimeRemaining(breakReq);
                            return (
                                <tr key={breakReq.id}>
                                    <td>{breakReq.initials}</td>
                                    <td>{breakReq.duration} min</td>
                                    <td>{window.timeUtils.formatTime(breakReq.started_at)}</td>
                                    <td className="countdown">
                                        {remaining !== null ? 
                                            `${remaining.minutes}:${remaining.seconds.toString().padStart(2, '0')} min` : 
                                            'Calculando...'}
                                    </td>
                                    <td>
                                        <span className="status-badge status-active">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="button-group">
                                        <button 
                                            className="btn-warning btn-sm" 
                                            onClick={() => window.breakService.pauseBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            Pausar
                                        </button>
                                        <button 
                                            className="btn-success btn-sm" 
                                            onClick={() => window.breakService.completeBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            Completar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        
                        {organizedBreaks.expired.map(breakReq => {
                            return (
                                <tr key={breakReq.id} className="expired-break">
                                    <td>{breakReq.initials}</td>
                                    <td>{breakReq.duration} min</td>
                                    <td>{window.timeUtils.formatTime(breakReq.started_at)}</td>
                                    <td className="countdown expired-time">
                                        0:00 min
                                    </td>
                                    <td>
                                        <span className="status-badge status-expired">
                                            EXPIRADO
                                        </span>
                                    </td>
                                    <td className="button-group">
                                        <button 
                                            className="btn-success btn-sm" 
                                            onClick={() => window.breakService.completeBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            COMPLETA MANUAL
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        
                        {organizedBreaks.paused.map(breakReq => {
                            const remaining = window.timeUtils.getElapsedTime(breakReq);
                            return (
                                <tr key={breakReq.id}>
                                    <td>{breakReq.initials}</td>
                                    <td>{breakReq.duration} min</td>
                                    <td>{window.timeUtils.formatTime(breakReq.paused_at)}</td>
                                    <td className="countdown">
                                        {remaining !== null ? 
                                            `${remaining.minutes}:${remaining.seconds.toString().padStart(2, '0')} min` : 
                                            `Tiempo en pausa`}
                                    </td>
                                    <td>
                                        <span className="status-badge status-pending">
                                            Pausado
                                        </span>
                                    </td>
                                    <td className="button-group">
                                        <button 
                                            className="btn-primary btn-sm" 
                                            onClick={() => window.breakService.resumeBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            Reanudar
                                        </button>
                                        <button 
                                            className="btn-danger btn-sm" 
                                            onClick={() => window.breakService.cancelBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            Cancelar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
};