window.PendingBreaks = ({ organizedBreaks, room, setSaveStatus }) => {
    const breakRequests = React.useSyncExternalStore(
        room.collection('break_request').subscribe,
        room.collection('break_request').getList
    );
    
    return (
        <section className="card">
            <h2>Cola de Descansos Pendientes</h2>
            {organizedBreaks.pending.length === 0 ? (
                <p>No hay descansos pendientes.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Iniciales</th>
                            <th>Hora de Solicitud</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizedBreaks.pending.map((breakReq, index) => (
                            <tr key={breakReq.id}>
                                <td>{breakReq.initials}</td>
                                <td>{window.timeUtils.formatTime(breakReq.requested_at)}</td>
                                <td>{breakReq.duration} min</td>
                                <td>
                                    <span className="status-badge status-pending">
                                        Pendiente
                                        {breakReq.postponed && " (Termino en lo que estoy y lo cojo)"}
                                    </span>
                                </td>
                                <td className="button-group">
                                    <button 
                                        className="btn-primary btn-sm" 
                                        onClick={() => window.breakService.startBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                    >
                                        Iniciar
                                    </button>
                                    <button 
                                        className="btn-warning btn-sm" 
                                        onClick={() => window.breakService.postponeBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                    >
                                        Casi listo
                                    </button>
                                    {index < organizedBreaks.pending.length - 1 && (
                                        <button 
                                            className="btn-secondary btn-sm" 
                                            onClick={() => window.breakService.moveBreakToNext(room, breakReq.id, breakRequests, setSaveStatus)}
                                        >
                                            Pasar Siguiente
                                        </button>
                                    )}
                                    <button 
                                        className="btn-danger btn-sm" 
                                        onClick={() => window.breakService.cancelBreak(room, breakReq.id, breakRequests, setSaveStatus)}
                                    >
                                        Cancelar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};

