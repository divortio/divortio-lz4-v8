export function printTable(rows) {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const widths = keys.map(k => Math.max(k.length, ...rows.map(r => String(r[k]).length)));

    // Header
    console.log(keys.map((k, i) => k.padEnd(widths[i])).join(' | '));
    console.log(widths.map(w => '-'.repeat(w)).join('-|-'));

    // Rows
    rows.forEach(row => {
        console.log(keys.map((k, i) => String(row[k]).padEnd(widths[i])).join(' | '));
    });
}


export default {printTable};
