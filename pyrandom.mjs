// PyRandom — a JS reimplementation of CPython's random.Random, bit-exact for integer seeds.
// MT19937 (init_by_array seeding) + genrand_res53 (.random) + getrandbits/_randbelow (.choice).
// This is what makes the web cab's odds PROVABLY identical to engine.py (the family parity rule).
// Only the surface the engine uses is implemented: random(), uniform(a,b), choice(seq).

const N = 624, M = 397, MATRIX_A = 0x9908b0df, UPPER = 0x80000000, LOWER = 0x7fffffff;
const mul32 = (a, b) => Math.imul(a, b) >>> 0;

export class PyRandom {
  constructor(seed) { this.mt = new Uint32Array(N); this.mti = N + 1; this.seed(seed); }

  _initGenrand(s) {
    this.mt[0] = s >>> 0;
    for (let i = 1; i < N; i++) {
      const prev = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (mul32(1812433253, prev) + i) >>> 0;
    }
    this.mti = N;
  }

  _initByArray(key) {
    this._initGenrand(19650218);
    let i = 1, j = 0;
    let k = Math.max(N, key.length);
    for (; k; k--) {
      const prev = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((this.mt[i] ^ mul32(prev, 1664525)) >>> 0) + key[j] + j) >>> 0;
      i++; j++;
      if (i >= N) { this.mt[0] = this.mt[N - 1]; i = 1; }
      if (j >= key.length) j = 0;
    }
    for (k = N - 1; k; k--) {
      const prev = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((this.mt[i] ^ mul32(prev, 1566083941)) >>> 0) - i) >>> 0;
      i++;
      if (i >= N) { this.mt[0] = this.mt[N - 1]; i = 1; }
    }
    this.mt[0] = 0x80000000;
  }

  seed(s) {
    // CPython: integer seed -> abs(seed) split into little-endian 32-bit words (>=1 word).
    s = Math.abs(s | 0) >>> 0;
    const key = [];
    let n = s;
    do { key.push(n >>> 0); n = Math.floor(n / 4294967296); } while (n > 0);
    this._initByArray(key);
  }

  _genrandInt32() {
    let y;
    if (this.mti >= N) {
      const mt = this.mt;
      let kk;
      for (kk = 0; kk < N - M; kk++) {
        y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = (mt[kk + M] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      for (; kk < N - 1; kk++) {
        y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = (mt[kk + (M - N)] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      y = (mt[N - 1] & UPPER) | (mt[0] & LOWER);
      mt[N - 1] = (mt[M - 1] ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      this.mti = 0;
    }
    y = this.mt[this.mti++];
    y ^= y >>> 11;
    y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0;
    y = (y ^ ((y << 15) & 0xefc60000)) >>> 0;
    y ^= y >>> 18;
    return y >>> 0;
  }

  random() {                                   // genrand_res53: 53-bit float in [0,1)
    const a = this._genrandInt32() >>> 5, b = this._genrandInt32() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }

  _getrandbits(k) { return this._genrandInt32() >>> (32 - k); }   // k in 1..32

  _randbelow(n) {                              // CPython _randbelow_with_getrandbits
    if (n <= 0) return 0;
    const k = 32 - Math.clz32(n);              // n.bit_length()
    let r = this._getrandbits(k);
    while (r >= n) r = this._getrandbits(k);
    return r;
  }

  uniform(a, b) { return a + (b - a) * this.random(); }
  choice(seq) { return seq[this._randbelow(seq.length)]; }
}
