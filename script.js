function validateInput(input) {
    const raw = (input.value ?? '').trim();

    //empty
    if (raw === '') {
        input.classList.remove('invalid');
        return true;
    }

    const value = parseFloat(raw);

    if (Number.isNaN(value) || value < 0) {
        input.classList.add('invalid');
        return false;
    }

    if (value > 20) {
        input.classList.add('invalid');
        input.value = '20';
        return false;
    } else {
        input.classList.remove('invalid');
        return true;
    }
}

function clamp20(n) {
    return Math.min(Math.max(n, 0), 20);
}

function readMark(id) {
    const el = document.getElementById(id);
    if (!el) return null;

    const raw = (el.value ?? '').trim();
    if (raw === '') return null;

    const v = parseFloat(raw);
    if (Number.isNaN(v)) return null;

    return clamp20(v);
}

function formatNumber(num) {
    return num !== null ? num.toFixed(2) : '-';
}

function calcModule(values, weights) {
    for (const k in weights) {
        if (values[k] === null) return null;
    }

    let sum = 0;
    for (const k in weights) {
        sum += values[k] * weights[k];
    }

    return clamp20(sum);
}

const STORAGE_KEY = 'gl2calc-inputs';
const THEME_KEY = 'gl2calc-theme';

function saveInputsToStorage() {
    const payload = {};
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.id) payload[input.id] = input.value;
    });

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
}

function restoreInputsFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);
        Object.keys(data).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = data[id];
        });
    } catch (e) {}
}

function clearStoredInputs() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
}

function applyTheme(theme) {
    const body = document.body;
    const toggle = document.getElementById('theme-toggle');

    if (theme === 'light') {
        body.classList.add('light-theme');
        if (toggle) toggle.textContent = 'light';
    } else {
        body.classList.remove('light-theme');
        if (toggle) toggle.textContent = 'dark';
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
}

function restoreTheme() {
    try {
        const t = localStorage.getItem(THEME_KEY);
        if (t) applyTheme(t);
    } catch (e) {}
}

function calculateAllGrades() {
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(validateInput);

    const modules = {
        tql: {
            controle: readMark('tql-controle'),
            td: readMark('tql-td'),
            tp: readMark('tql-tp'),
            coef: 2,
            result: null,
           
            weights: { controle: 0.6, td: 0.4 }
        },
        gpl: {
            controle: readMark('gpl-controle'),
            td: readMark('gpl-td'),
            tp: readMark('gpl-tp'),
            coef: 2,
            result: null,
         
            weights: { controle: 0.6, td: 0.4 }
        },
        dac: {
            controle: readMark('dac-controle'),
            td: readMark('dac-td'),
            tp: readMark('dac-tp'),
            coef: 2,
            result: null,
           
            weights: { controle: 0.6, td: 0.4 }
        },
        daw: {
            controle: readMark('daw-controle'),
            tp: readMark('daw-tp'),
            coef: 1,
            result: null,
            weights: { controle: 0.6, tp: 0.4 }
        },
        gl2: {
            controle: readMark('gl2-controle'),
            td: readMark('gl2-td'),
            coef: 4,
            result: null,
            weights: { controle: 0.6, td: 0.4 }
        },
        tabd: {
            controle: readMark('tabd-controle'),
            td: readMark('tabd-td'),
            tp: readMark('tabd-tp'),
            coef: 2,
            result: null,
            
            weights: { controle: 0.6, td: 0.4 }
        }
    };

    // calculations

    modules.tql.result = calcModule({ controle: modules.tql.controle, td: modules.tql.td }, modules.tql.weights);
    modules.gpl.result = calcModule({ controle: modules.gpl.controle, td: modules.gpl.td }, modules.gpl.weights);
    modules.dac.result = calcModule({ controle: modules.dac.controle, td: modules.dac.td }, modules.dac.weights);

    modules.daw.result = calcModule({ controle: modules.daw.controle, tp: modules.daw.tp }, modules.daw.weights);
    modules.gl2.result = calcModule({ controle: modules.gl2.controle, td: modules.gl2.td }, modules.gl2.weights);

    
    modules.tabd.result = calcModule({ controle: modules.tabd.controle, td: modules.tabd.td }, modules.tabd.weights);

    // ui
    document.getElementById('tql-result').textContent = formatNumber(modules.tql.result);
    document.getElementById('gpl-result').textContent = formatNumber(modules.gpl.result);
    document.getElementById('dac-result').textContent = formatNumber(modules.dac.result);
    document.getElementById('daw-result').textContent = formatNumber(modules.daw.result);
    document.getElementById('gl2-result').textContent = formatNumber(modules.gl2.result);
    document.getElementById('tabd-result').textContent = formatNumber(modules.tabd.result);

    // overall
    let totalCoef = 0;
    let weightedSum = 0;

    for (const m in modules) {
        if (modules[m].result !== null) {
            weightedSum += modules[m].result * modules[m].coef;
            totalCoef += modules[m].coef;
        }
    }

    const overallAverage = totalCoef > 0 ? (weightedSum / totalCoef) : null;

    document.getElementById('overall-average').textContent = formatNumber(overallAverage);
    document.getElementById('total-coef').textContent = totalCoef > 0 ? String(totalCoef) : '-';

    return modules;
}

function resetAllFields() {
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(input => {
        input.value = '';
        input.classList.remove('invalid');
    });

    clearStoredInputs();

    document.getElementById('tql-result').textContent = '-';
    document.getElementById('gpl-result').textContent = '-';
    document.getElementById('dac-result').textContent = '-';
    document.getElementById('daw-result').textContent = '-';
    document.getElementById('gl2-result').textContent = '-';
    document.getElementById('tabd-result').textContent = '-';

    document.getElementById('overall-average').textContent = '-';
    document.getElementById('total-coef').textContent = '-';
}

const allInputs = document.querySelectorAll('input[type="number"]');
allInputs.forEach(input => {
    input.addEventListener('input', function() {
        validateInput(this);
        calculateAllGrades();
    });

    input.addEventListener('blur', function() {
        validateInput(this);
    });
});

// light dark
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        const isLight = document.body.classList.contains('light-theme');
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        saveTheme(next);
    });
}

document.getElementById('reset-btn').addEventListener('click', resetAllFields);

document.addEventListener('DOMContentLoaded', function() {
    restoreTheme();
    restoreInputsFromStorage();
    calculateAllGrades();
});

// sutosave
(function() {
    let saveTimeout = null;

    document.addEventListener('input', function(e) {
        const el = e.target;
        if (!el) return;

        if (el.tagName === 'INPUT' && el.type === 'number') {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveInputsToStorage(), 250);
        }
    });

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            clearStoredInputs();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        restoreInputsFromStorage();
        calculateAllGrades();
    });
})();

//back up
(function() {
    const backToTop = document.getElementById('back-to-top');

    function updateBackToTop() {
        if (!backToTop) return;

        if (window.scrollY > 320) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    }

    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', updateBackToTop);
        updateBackToTop();
    }
})();
