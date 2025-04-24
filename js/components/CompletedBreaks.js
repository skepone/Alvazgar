window.CompletedBreaks = ({ organizedBreaks, room, setSaveStatus, setModalOpen }) => {
    return (
        <section className="card">
            <h2>Descansos Completados</h2>
            <div className="section-header">
                <button 
                    className="btn-danger" 
                    onClick={() => setModalOpen(true)}
                    disabled={organizedBreaks.completed.length === 0}
                >
                    Limpiar historial
                </button>
            </div>
            {organizedBreaks.completed.length === 0 ? (
                <p>No hay descansos completados en esta sesión.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Iniciales</th>
                            <th>Solicitado</th>
                            <th>Iniciado</th>
                            <th>Completado</th>
                            <th>Duración</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizedBreaks.completed.map(breakReq => (
                            <tr key={breakReq.id}>
                                <td>{breakReq.initials}</td>
                                <td>{window.timeUtils.formatTime(breakReq.requested_at)}</td>
                                <td>{window.timeUtils.formatTime(breakReq.started_at)}</td>
                                <td>{window.timeUtils.formatTime(breakReq.completed_at)}</td>
                                <td>{breakReq.duration} min</td>
                                <td>
                                    <span className={`status-badge ${
                                        breakReq.completion_type === 'Expiró' ? 'status-expired' : 
                                        breakReq.completion_type === 'Cancelado' ? 'status-pending' : 
                                        'status-completed'
                                    }`}>
                                        {breakReq.completion_type || 'Manual'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};