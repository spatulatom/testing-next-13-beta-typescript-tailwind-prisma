// 'use server'

export async function testing () {console.log('testing')}

const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Done!"), 1000);
  });
try {
    await promise;
} catch (error) {
    console.error(error);
}
    

//1. function declaration examples:
function add(a: number, b: number): number {
    return a + b;
}

// 2. function expression example:
const multiply = function (a: number, b: number): number {
    return a * b;
};

// or
const myltipy2 = function multiply(a: number, b: number): number {
    return a * b;
}

// 3. arrow function example:
const subtract = (a: number, b: number): number => {
    return a - b;
};
// or
const divide = (a: number, b: number): number => a / b; // implicit return

// 4. method definition in an object:
const calculator = {
    square(n: number): number {
        return n * n;
    }
};

