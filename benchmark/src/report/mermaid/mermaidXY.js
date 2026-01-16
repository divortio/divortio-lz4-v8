/**
 * benchmark/src/report/mermaid/mermaidXY.js
 * 
 * Builder class for generating Mermaid JS XY Charts.
 * Syntax Reference: https://mermaid.js.org/syntax/xyChart.html
 */

export class MermaidXY {
    constructor(options = {}) {
        this.orientation = options.orientation || 'vertical'; // vertical | horizontal
        this.title = options.title || '';
        this.xAxis = null;
        this.yAxis = null;
        this.series = []; // { type: 'bar'|'line', data: [], label: string }
        this.theme = options.theme || ''; // optional theme override if supported by wrapper
    }

    /**
     * Sets the X-Axis configuration.
     * @param {object} config
     * @param {string} [config.title]
     * @param {string[]} [config.categories] - For 'category' axis type (usually X)
     * @param {[number, number]} [config.range] - For 'numeric' axis type
     */
    setXAxis({ title, categories, range }) {
        this.xAxis = { title, categories, range };
        return this;
    }

    /**
     * Sets the Y-Axis configuration.
     * @param {object} config
     * @param {string} [config.title]
     * @param {[number, number]} [config.range] - Min/Max for numeric axis
     * @param {string[]} [config.categories] - Rare for Y, but possible
     */
    setYAxis({ title, range, categories }) {
        this.yAxis = { title, range, categories };
        return this;
    }

    /**
     * Adds a Bar series.
     * @param {number[]} data 
     * @param {string} [label] - Optional label (unsupported in basic syntax but good for future)
     */
    addBar(data, label = '') {
        this.series.push({ type: 'bar', data, label });
        return this;
    }

    /**
     * Adds a Line series.
     * @param {number[]} data 
     * @param {string} [label]
     */
    addLine(data, label = '') {
        this.series.push({ type: 'line', data, label });
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    /**
     * Generates the mermaid diagram code.
     * @returns {string}
     */
    generate() {
        const lines = ['xychart-beta'];

        if (this.orientation === 'horizontal') {
            lines.push('    orientation horizontal');
        }

        if (this.title) {
            lines.push(`    title "${this.title}"`);
        }

        // X-Axis
        if (this.xAxis) {
            const rangeOrCats = this.xAxis.categories
                ? `[${this.xAxis.categories.map(c => `"${c}"`).join(', ')}]`
                : `[${this.xAxis.range[0]}, ${this.xAxis.range[1]}]`;

            lines.push(`    x-axis "${this.xAxis.title || ''}" ${rangeOrCats}`);
        }

        // Y-Axis
        if (this.yAxis) {
            const rangeOrCats = this.yAxis.categories
                ? `[${this.yAxis.categories.map(c => `"${c}"`).join(', ')}]`
                : `[${this.yAxis.range[0]}, ${this.yAxis.range[1]}]`;

            lines.push(`    y-axis "${this.yAxis.title || ''}" ${rangeOrCats}`);
        }

        // Series
        for (const s of this.series) {
            lines.push(`    ${s.type} [${s.data.join(', ')}]`);
        }

        return lines.join('\n');
    }
}
