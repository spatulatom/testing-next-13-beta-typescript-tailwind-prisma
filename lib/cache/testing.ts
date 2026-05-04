// 'use server'

export async function testing () {console.log('testing')}

const promise = new Promise<string>((resolve) => {
    setTimeout(() => resolve("Done!"), 1000);
  });
try {
    await promise;
} catch {
    // Handle error silently
}

export function add(a: number, b: number): number {
    return a + b;
}

export const multiply = function (a: number, b: number): number {
    return a * b;
};

export const myltipy2 = function multiply(a: number, b: number): number {
    return a * b;
}

export const subtract = (a: number, b: number): number => {
    return a - b;
};

export const divide = (a: number, b: number): number => a / b;

export const calculator = {
    square(n: number): number {
        return n * n;
    }
};

