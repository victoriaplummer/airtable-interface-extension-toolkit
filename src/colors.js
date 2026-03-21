// Airtable color system — maps Airtable's select option color names to usable style values.
//
// Airtable select options have a `color` property like 'blueBright', 'greenLight2', etc.
// This module resolves those to either Tailwind classes or raw RGB values.

// ── Airtable color token → family mapping ────────────────────────────────────────

export const AT_COLOR_FAMILY = {
    blueBright: 'blue', blueLight1: 'blue', blueLight2: 'blue', blueDark1: 'blue',
    cyanBright: 'cyan', cyanLight1: 'cyan', cyanLight2: 'cyan', cyanDark1: 'cyan',
    tealBright: 'teal', tealLight1: 'teal', tealLight2: 'teal', tealDark1: 'teal',
    greenBright: 'green', greenLight1: 'green', greenLight2: 'green', greenDark1: 'green',
    yellowBright: 'yellow', yellowLight1: 'yellow', yellowLight2: 'yellow', yellowDark1: 'yellow',
    orangeBright: 'orange', orangeLight1: 'orange', orangeLight2: 'orange', orangeDark1: 'orange',
    redBright: 'red', redLight1: 'red', redLight2: 'red', redDark1: 'red',
    pinkBright: 'pink', pinkLight1: 'pink', pinkLight2: 'pink', pinkDark1: 'pink',
    purpleBright: 'purple', purpleLight1: 'purple', purpleLight2: 'purple', purpleDark1: 'purple',
    grayBright: 'gray', grayLight1: 'gray', grayLight2: 'gray', grayDark1: 'gray',
};

// ── Raw RGB values per family ────────────────────────────────────────────────────
// These match the Airtable design token spec. Use with inline styles or non-Tailwind projects.

export const AT_COLORS_RAW = {
    blue:   { base: 'rgb(22, 110, 225)',  dark1: 'rgb(13, 82, 172)',   light1: 'rgb(160, 198, 255)', light2: 'rgb(209, 226, 255)', light3: 'rgb(241, 245, 255)' },
    cyan:   { base: 'rgb(57, 202, 255)',  dark1: 'rgb(15, 104, 162)',  light1: 'rgb(136, 219, 255)', light2: 'rgb(196, 236, 255)', light3: 'rgb(227, 250, 253)' },
    teal:   { base: 'rgb(1, 221, 213)',   dark1: 'rgb(23, 114, 110)',  light1: 'rgb(116, 235, 225)', light2: 'rgb(193, 245, 240)', light3: 'rgb(228, 251, 251)' },
    green:  { base: 'rgb(4, 138, 14)',    dark1: 'rgb(0, 100, 0)',     light1: 'rgb(154, 224, 149)', light2: 'rgb(207, 245, 209)', light3: 'rgb(230, 252, 232)' },
    yellow: { base: 'rgb(255, 186, 5)',   dark1: 'rgb(175, 96, 2)',    light1: 'rgb(255, 214, 107)', light2: 'rgb(255, 234, 182)', light3: 'rgb(255, 246, 221)' },
    orange: { base: 'rgb(213, 68, 1)',    dark1: 'rgb(170, 45, 0)',    light1: 'rgb(255, 182, 142)', light2: 'rgb(255, 224, 204)', light3: 'rgb(255, 236, 227)' },
    red:    { base: 'rgb(220, 4, 59)',    dark1: 'rgb(177, 15, 65)',   light1: 'rgb(255, 166, 193)', light2: 'rgb(255, 212, 224)', light3: 'rgb(255, 242, 250)' },
    pink:   { base: 'rgb(221, 4, 168)',   dark1: 'rgb(171, 10, 131)',  light1: 'rgb(247, 151, 239)', light2: 'rgb(250, 210, 252)', light3: 'rgb(255, 241, 255)' },
    purple: { base: 'rgb(124, 55, 239)',  dark1: 'rgb(98, 49, 174)',   light1: 'rgb(191, 174, 252)', light2: 'rgb(224, 218, 253)', light3: 'rgb(252, 243, 255)' },
    gray:   { base: 'rgb(151, 154, 160)', dark1: 'rgb(65, 69, 77)',    light1: 'rgb(196, 199, 205)', light2: 'rgb(229, 233, 240)', light3: 'rgb(249, 250, 251)' },
};

// ── Tailwind class bundles per family ────────────────────────────────────────────
// Requires the Airtable Tailwind preset (see tailwind/airtable-preset.js).
// Each family provides: bg, text, header, dot, border, dropActive

export const TAILWIND_STYLES = {
    blue:   { bg: 'bg-blue-blueLight2 dark:bg-blue-blueDark1/30', text: 'text-blue-blueDark1 dark:text-blue-blueLight1', header: 'bg-blue-blueLight3 dark:bg-blue-blueDark1/20 text-blue-blueDark1 dark:text-blue-blueLight1', dot: 'bg-blue-blue', border: 'border-blue-blueLight2 dark:border-blue-blueDark1/40', dropActive: 'border-blue-blue bg-blue-blueLight3/50 dark:bg-blue-blueDark1/10' },
    cyan:   { bg: 'bg-cyan-cyanLight2 dark:bg-cyan-cyanDark1/30', text: 'text-cyan-cyanDark1 dark:text-cyan-cyanLight1', header: 'bg-cyan-cyanLight3 dark:bg-cyan-cyanDark1/20 text-cyan-cyanDark1 dark:text-cyan-cyanLight1', dot: 'bg-cyan-cyan', border: 'border-cyan-cyanLight2 dark:border-cyan-cyanDark1/40', dropActive: 'border-cyan-cyan bg-cyan-cyanLight3/50 dark:bg-cyan-cyanDark1/10' },
    teal:   { bg: 'bg-teal-tealLight2 dark:bg-teal-tealDark1/30', text: 'text-teal-tealDark1 dark:text-teal-tealLight1', header: 'bg-teal-tealLight3 dark:bg-teal-tealDark1/20 text-teal-tealDark1 dark:text-teal-tealLight1', dot: 'bg-teal-teal', border: 'border-teal-tealLight2 dark:border-teal-tealDark1/40', dropActive: 'border-teal-teal bg-teal-tealLight3/50 dark:bg-teal-tealDark1/10' },
    green:  { bg: 'bg-green-greenLight2 dark:bg-green-greenDark1/30', text: 'text-green-greenDark1 dark:text-green-greenLight1', header: 'bg-green-greenLight3 dark:bg-green-greenDark1/20 text-green-greenDark1 dark:text-green-greenLight1', dot: 'bg-green-green', border: 'border-green-greenLight2 dark:border-green-greenDark1/40', dropActive: 'border-green-green bg-green-greenLight3/50 dark:bg-green-greenDark1/10' },
    yellow: { bg: 'bg-yellow-yellowLight2 dark:bg-yellow-yellowDark1/30', text: 'text-yellow-yellowDark1 dark:text-yellow-yellowLight1', header: 'bg-yellow-yellowLight3 dark:bg-yellow-yellowDark1/20 text-yellow-yellowDark1 dark:text-yellow-yellowLight1', dot: 'bg-yellow-yellow', border: 'border-yellow-yellowLight2 dark:border-yellow-yellowDark1/40', dropActive: 'border-yellow-yellow bg-yellow-yellowLight3/50 dark:bg-yellow-yellowDark1/10' },
    orange: { bg: 'bg-orange-orangeLight2 dark:bg-orange-orangeDark1/30', text: 'text-orange-orangeDark1 dark:text-orange-orangeLight1', header: 'bg-orange-orangeLight3 dark:bg-orange-orangeDark1/20 text-orange-orangeDark1 dark:text-orange-orangeLight1', dot: 'bg-orange-orange', border: 'border-orange-orangeLight2 dark:border-orange-orangeDark1/40', dropActive: 'border-orange-orange bg-orange-orangeLight3/50 dark:bg-orange-orangeDark1/10' },
    red:    { bg: 'bg-red-redLight2 dark:bg-red-redDark1/30', text: 'text-red-redDark1 dark:text-red-redLight1', header: 'bg-red-redLight3 dark:bg-red-redDark1/20 text-red-redDark1 dark:text-red-redLight1', dot: 'bg-red-red', border: 'border-red-redLight2 dark:border-red-redDark1/40', dropActive: 'border-red-red bg-red-redLight3/50 dark:bg-red-redDark1/10' },
    pink:   { bg: 'bg-pink-pinkLight2 dark:bg-pink-pinkDark1/30', text: 'text-pink-pinkDark1 dark:text-pink-pinkLight1', header: 'bg-pink-pinkLight3 dark:bg-pink-pinkDark1/20 text-pink-pinkDark1 dark:text-pink-pinkLight1', dot: 'bg-pink-pink', border: 'border-pink-pinkLight2 dark:border-pink-pinkDark1/40', dropActive: 'border-pink-pink bg-pink-pinkLight3/50 dark:bg-pink-pinkDark1/10' },
    purple: { bg: 'bg-purple-purpleLight2 dark:bg-purple-purpleDark1/30', text: 'text-purple-purpleDark1 dark:text-purple-purpleLight1', header: 'bg-purple-purpleLight3 dark:bg-purple-purpleDark1/20 text-purple-purpleDark1 dark:text-purple-purpleLight1', dot: 'bg-purple-purple', border: 'border-purple-purpleLight2 dark:border-purple-purpleDark1/40', dropActive: 'border-purple-purple bg-purple-purpleLight3/50 dark:bg-purple-purpleDark1/10' },
    gray:   { bg: 'bg-gray-gray100 dark:bg-gray-gray600', text: 'text-gray-gray600 dark:text-gray-gray200', header: 'bg-gray-gray100 dark:bg-gray-gray700/40 text-gray-gray600 dark:text-gray-gray300', dot: 'bg-gray-gray400', border: 'border-gray-gray200 dark:border-gray-gray600', dropActive: 'border-gray-gray400 bg-gray-gray100/50 dark:bg-gray-gray700/20' },
};

// ── Raw inline-style bundles per family ──────────────────────────────────────────

const RAW_STYLES = {};
for (const [family, c] of Object.entries(AT_COLORS_RAW)) {
    RAW_STYLES[family] = {
        bg: c.light2,
        text: c.dark1,
        header: c.light3,
        dot: c.base,
        border: c.light2,
        dropActive: c.base,
    };
}

// ── Resolvers ────────────────────────────────────────────────────────────────────

const DEFAULT_TAILWIND = TAILWIND_STYLES.gray;
const DEFAULT_RAW = RAW_STYLES.gray;

function resolveFamily(airtableColor) {
    return AT_COLOR_FAMILY[airtableColor] || 'gray';
}

/**
 * Get Tailwind class bundle for an Airtable color name.
 * Returns {bg, text, header, dot, border, dropActive} as Tailwind class strings.
 */
export function airtableColorStyles(airtableColor) {
    if (!airtableColor) return DEFAULT_TAILWIND;
    return TAILWIND_STYLES[resolveFamily(airtableColor)] || DEFAULT_TAILWIND;
}

/**
 * Get raw RGB values for an Airtable color name.
 * Returns {bg, text, header, dot, border, dropActive} as RGB strings.
 * Use with inline styles for non-Tailwind projects.
 */
export function airtableColorValues(airtableColor) {
    if (!airtableColor) return DEFAULT_RAW;
    return RAW_STYLES[resolveFamily(airtableColor)] || DEFAULT_RAW;
}

/**
 * Factory to create a color resolver with a specific output mode.
 * @param {'tailwind'|'raw'|'both'} mode
 * @returns {(airtableColor: string) => object}
 */
export function createColorResolver(mode = 'tailwind') {
    if (mode === 'raw') return airtableColorValues;
    if (mode === 'tailwind') return airtableColorStyles;
    if (mode === 'both') {
        return (airtableColor) => {
            const tw = airtableColorStyles(airtableColor);
            const raw = airtableColorValues(airtableColor);
            const result = {};
            for (const key of Object.keys(tw)) {
                result[key] = { class: tw[key], value: raw[key] };
            }
            return result;
        };
    }
    return airtableColorStyles;
}
