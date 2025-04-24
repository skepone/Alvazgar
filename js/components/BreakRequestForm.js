const { useState } = React;

window.BreakRequestForm = ({ room, setSaveStatus }) => {
    const [initials, setInitials] = useState('');
    const [breakDuration, setBreakDuration] = useState('10');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await window.breakService.requestBreak(room, initials, breakDuration, setSaveStatus);
        if (success) {
            setInitials('');
        }
    };
    
    return (
        <section className="card">
            <h2>Solicitar Descanso</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="initials">Iniciales del Empleado:</label>
                    <input 
                        type="text" 
                        id="initials" 
                        value={initials} 
                        onChange={(e) => setInitials(e.target.value)}
                        placeholder="Ej. JDR"
                        maxLength="4"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="duration">Duración del Descanso:</label>
                    <select 
                        id="duration" 
                        value={breakDuration} 
                        onChange={(e) => setBreakDuration(e.target.value)}
                    >
                        <option value="1">1 minuto</option>
                        <option value="10">10 minutos</option>
                        <option value="20">20 minutos</option>
                        <option value="25">25 minutos</option>
                    </select>
                </div>
                <button type="submit">Solicitar Descanso</button>
            </form>
        </section>
    );
};