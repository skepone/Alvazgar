window.LogsView = ({ logs }) => {
    return (
        <section className="card">
            <h2>Registros del Sistema</h2>
            <button 
                className="btn-primary" 
                onClick={() => window.logService.downloadLogs(logs)} 
                disabled={!logs.length}
            >
                Descargar Logs (JSON)
            </button>
            
            {logs.length === 0 ? (
                <p className="mt-3">No hay registros disponibles.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Acción</th>
                            <th>Usuario</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...logs]
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .map(log => (
                            <tr key={log.id}>
                                <td>{window.timeUtils.formatTime(log.timestamp)}</td>
                                <td>{log.action}</td>
                                <td>{log.username}</td>
                                <td>
                                    {log.initials ? `${log.initials}` : ''}
                                    {log.duration ? ` (${log.duration} min)` : ''}
                                    {log.breakId ? ` - ID: ${log.breakId.substring(0, 8)}...` : ''}
                                    {log.count ? `${log.count} registros` : ''}
                                    {log.completion_type ? `, ${log.completion_type}` : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};