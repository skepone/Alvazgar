// Make the component available globally
window.SaveIndicator = ({ saveStatus }) => {
    return (
        <div className={`autosave-indicator ${saveStatus.state}`}>
            <span className={`dot dot-${saveStatus.state}`}></span>
            {saveStatus.state === 'idle' && 'Sistema listo'}
            {saveStatus.state === 'saving' && 'Guardando...'}
            {saveStatus.state === 'saved' && `Guardado a las ${saveStatus.lastSaved}`}
            {saveStatus.state === 'error' && `Error al guardar: ${saveStatus.error || 'Revise su conexión'}`}
        </div>
    );
};

