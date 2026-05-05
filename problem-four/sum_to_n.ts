// Time:  O(n)
// Space: O(1)
export const sum_to_n_a = (n: number): number => {
    let total = 0;
    const sign = n < 0 ? -1 : 1;
    const limit = Math.abs(n);
    for (let i = 1; i <= limit; i++) {
        total += i;
    }
    return total * sign;
};

// Time:  O(1)
// Space: O(1)
export const sum_to_n_b = (n: number): number => {
    return (n * (n + 1)) / 2;
};

// Time:  O(n)
// Space: O(n)
export const sum_to_n_c = (n: number): number => {
    if (n === 0) return 0;
    if (n < 0) return -sum_to_n_c(-n);
    return n + sum_to_n_c(n - 1);
};

// Time:  O(n)
// Space: O(n)
export const sum_to_n_d = (n: number): number => {
    const sign = n < 0 ? -1 : 1;
    const limit = Math.abs(n);
    return sign * Array.from({ length: limit }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};


// Time:  O(n)
// Space: O(1)
export const sum_to_n_e = (n: number): number => {
    const sign = n < 0 ? -1 : 1;
    let i = Math.abs(n);
    let total = 0;
    while (i > 0) total += i--;
    return total * sign;
};

// Time:  O(n)
// Space: O(n)
export const sum_to_n_f = (n: number): number => {
    const sign = n < 0 ? -1 : 1;
    const limit = Math.abs(n);
    function* range(): Generator<number> {
        for (let i = 1; i <= limit; i++) yield i;
    }
    return sign * [...range()].reduce((a, b) => a + b, 0);
};

// Time:  O(n)
// Space: O(log n)
export const sum_to_n_g = (n: number): number => {
    if (n === 0) return 0;
    const sign = n < 0 ? -1 : 1;
    const sum = (lo: number, hi: number): number => {
        if (lo === hi) return lo;
        const mid = Math.floor((lo + hi) / 2);
        return sum(lo, mid) + sum(mid + 1, hi);
    };
    return sign * sum(1, Math.abs(n));
};
