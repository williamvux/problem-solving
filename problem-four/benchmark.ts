import {
    sum_to_n_a,
    sum_to_n_b,
    sum_to_n_c,
    sum_to_n_d,
    sum_to_n_e,
    sum_to_n_f,
    sum_to_n_g,
} from "./sum_to_n.ts";

const fns = { sum_to_n_a, sum_to_n_b, sum_to_n_c, sum_to_n_d, sum_to_n_e, sum_to_n_f, sum_to_n_g };

const n = 1000;
const iterations = 10_000;

for (const [name, fn] of Object.entries(fns)) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn(n);
    const elapsed = performance.now() - start;
    console.log(`${name}: ${elapsed.toFixed(2)} ms (${fn(n)})`);
}
