export const formatspace = (data) => {
    return (data.text || '0').toLocaleString() || '' + (data.str || '')
}
